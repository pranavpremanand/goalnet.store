import { createHmac, randomUUID } from "node:crypto";
import { HERO_VIDEO_MIME_TYPES, IMAGE_MIME_TYPES, MAX_HERO_VIDEO_BYTES, MAX_IMAGE_BYTES } from "@/lib/catalog-constants";
import type { ImageAsset, UploadAuth } from "@/lib/types/catalog";
import type { HeroMedia } from "@/lib/types/hero";
import type { UploadTarget } from "@/lib/validation/catalog";
import { getImageKitConfig } from "@/server/config/env";
import { BadRequestError, ServiceUnavailableError } from "@/server/errors";
import * as categoryRepository from "@/server/repositories/category.repository";
import * as heroSlideRepository from "@/server/repositories/hero-slide.repository";
import * as productRepository from "@/server/repositories/product.repository";

const API_BASE = "https://api.imagekit.io/v1";
const UPLOAD_TOKEN_TTL_SECONDS = 30 * 60;
const FOLDERS: Record<UploadTarget, string> = { category: "/goalnet/categories", product: "/goalnet/products", hero: "/goalnet/hero" };

function requireConfig() {
  const config = getImageKitConfig();
  if (!config) throw new ServiceUnavailableError("Image uploads are not configured. Add the ImageKit keys to the environment.");
  return config;
}

function basicAuth(privateKey: string) {
  return `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`;
}

type ImageKitFileDetails = { fileType?: string; mime?: string; size?: number; filePath?: string; url?: string };

function matchesImageKitFilePath(fileUrl: string, urlEndpoint: string, filePath: string) {
  try {
    const endpoint = new URL(urlEndpoint);
    const submitted = new URL(fileUrl);
    const endpointPath = endpoint.pathname.replace(/\/+$/, "");
    const expectedPath = `${endpointPath}${filePath.startsWith("/") ? filePath : `/${filePath}`}`;
    return submitted.origin === endpoint.origin
      && decodeURIComponent(submitted.pathname).replace(/\/+$/, "") === decodeURIComponent(expectedPath).replace(/\/+$/, "");
  } catch {
    return false;
  }
}

async function getFileDetails(fileId: string, field: string, mediaLabel: string): Promise<ImageKitFileDetails> {
  const invalid = (message: string) => new BadRequestError(message, { [field]: [message] });
  const { privateKey } = requireConfig();
  try {
    const response = await fetch(`${API_BASE}/files/${encodeURIComponent(fileId)}/details`, {
      headers: { Authorization: basicAuth(privateKey), Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (response.status === 404) throw invalid(`The uploaded ${mediaLabel} could not be found. Please upload it again`);
    if (!response.ok) throw new Error(`ImageKit responded with ${response.status}`);
    return await response.json();
  } catch (error) {
    if (error instanceof BadRequestError) throw error;
    console.error(`ImageKit ${mediaLabel} verification failed`, error);
    throw new ServiceUnavailableError(`The ${mediaLabel} could not be verified right now. Please try again.`);
  }
}

// Short-lived signature that lets the browser upload straight to ImageKit without seeing the private key.
export function createUploadAuth(target: UploadTarget): UploadAuth {
  const { publicKey, privateKey, urlEndpoint } = requireConfig();
  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + UPLOAD_TOKEN_TTL_SECONDS;
  const signature = createHmac("sha1", privateKey).update(token + expire).digest("hex");
  return { publicKey, urlEndpoint, token, expire, signature, folder: FOLDERS[target] };
}

async function verifyImage(image: ImageAsset, folder: string, field: string) {
  const { urlEndpoint } = requireConfig();
  const invalid = (message: string) => new BadRequestError(message, { [field]: [message] });

  if (!image.url.startsWith(`${urlEndpoint}/`)) throw invalid("The image must be uploaded through the admin uploader");

  const details = await getFileDetails(image.fileId, field, "image");

  if (details.fileType !== "image" || !IMAGE_MIME_TYPES.includes(details.mime as (typeof IMAGE_MIME_TYPES)[number])) throw invalid("Only JPG, PNG or WebP images are allowed");
  if ((details.size ?? 0) > MAX_IMAGE_BYTES) throw invalid("Images must be 5 MB or smaller");
  if (!details.filePath?.startsWith(`${folder}/`)) throw invalid("The image was uploaded to the wrong folder");
  if (!details.url || new URL(details.url).pathname !== new URL(image.url).pathname) throw invalid("The image details do not match the uploaded file");
}

async function verifyHeroMedia(media: HeroMedia, field: string) {
  const { urlEndpoint } = requireConfig();
  const invalid = (message: string) => new BadRequestError(message, { [field]: [message] });

  if (!media.url.startsWith(`${urlEndpoint}/`)) throw invalid("Upload the hero media using the admin uploader");

  const details = await getFileDetails(media.fileId, field, "hero media");

  const maxBytes = media.mediaType === "video" ? MAX_HERO_VIDEO_BYTES : MAX_IMAGE_BYTES;
  const expectedFileType = media.mediaType === "video" ? "non-image" : "image";
  const allowedMime = media.mediaType === "video"
    ? HERO_VIDEO_MIME_TYPES.some((mime) => mime === details.mime)
    : IMAGE_MIME_TYPES.some((mime) => mime === details.mime);
  const validFileType = media.mediaType === "video"
    ? details.fileType === "non-image" || details.fileType === "video"
    : details.fileType === expectedFileType;
  if (!validFileType || !allowedMime) {
    throw invalid(media.mediaType === "video" ? "Only MP4 or WebM videos are allowed" : "Only JPG, PNG or WebP images are allowed");
  }
  if (typeof details.size !== "number" || details.size > maxBytes) {
    throw invalid(media.mediaType === "video" ? "Videos must be 20 MB or smaller" : "Images must be 5 MB or smaller");
  }
  if (!details.filePath?.startsWith(`${FOLDERS.hero}/`)) throw invalid("The media was uploaded to the wrong folder");
  if (!matchesImageKitFilePath(media.url, urlEndpoint, details.filePath)) throw invalid("The media details do not match the uploaded file");
}

// Images already saved on the record were verified before, so only new ones are checked with ImageKit.
export async function verifyNewImages(images: ImageAsset[], target: UploadTarget, knownFileIds: Set<string>, field: string) {
  const fresh = images.filter((image) => !knownFileIds.has(image.fileId));
  await Promise.all(fresh.map((image) => verifyImage(image, FOLDERS[target], field)));
}

export async function verifyNewHeroMedia(media: HeroMedia, knownFileIds: Set<string>, field: string) {
  if (!knownFileIds.has(media.fileId)) await verifyHeroMedia(media, field);
}

// Cleanup is best-effort: a failed delete must not fail the request that triggered it.
export async function deleteImages(fileIds: string[]) {
  const config = getImageKitConfig();
  if (!config || fileIds.length === 0) return;

  await Promise.all(
    [...new Set(fileIds)].map(async (fileId) => {
      try {
        const response = await fetch(`${API_BASE}/files/${encodeURIComponent(fileId)}`, {
          method: "DELETE",
          headers: { Authorization: basicAuth(config.privateKey) },
          signal: AbortSignal.timeout(10000),
        });
        if (!response.ok && response.status !== 404) console.error(`ImageKit delete failed for ${fileId} with status ${response.status}`);
      } catch (error) {
        console.error(`ImageKit delete failed for ${fileId}`, error);
      }
    }),
  );
}

async function isFileInUse(fileId: string) {
  const [asCover, asProductImage, asHeroImage] = await Promise.all([
    categoryRepository.isCoverImageFileUsed(fileId),
    productRepository.isImageFileUsed(fileId),
    heroSlideRepository.isHeroMediaFileUsed(fileId),
  ]);
  return asCover || asProductImage || asHeroImage;
}

// Removes uploads that were never saved (admin removed the image, cancelled, or left the form).
// Only files inside our own folder and not referenced by any record are ever deleted.
export async function discardUnusedUploads(fileIds: string[]) {
  const config = getImageKitConfig();
  if (!config) return;

  const deletable: string[] = [];
  for (const fileId of new Set(fileIds)) {
    if (await isFileInUse(fileId)) continue;
    try {
      const response = await fetch(`${API_BASE}/files/${encodeURIComponent(fileId)}/details`, { headers: { Authorization: basicAuth(config.privateKey) }, cache: "no-store", signal: AbortSignal.timeout(10000) });
      if (!response.ok) continue;
      const details = (await response.json()) as { filePath?: string };
      if (details.filePath?.startsWith("/goalnet/")) deletable.push(fileId);
    } catch (error) {
      console.error(`Could not check upload ${fileId}`, error);
    }
  }
  await deleteImages(deletable);
}
