import { createHmac, randomUUID } from "node:crypto";
import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from "@/lib/catalog-constants";
import type { ImageAsset, UploadAuth } from "@/lib/types/catalog";
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

// Short-lived signature that lets the browser upload straight to ImageKit without seeing the private key.
export function createUploadAuth(target: UploadTarget): UploadAuth {
  const { publicKey, privateKey, urlEndpoint } = requireConfig();
  const token = randomUUID();
  const expire = Math.floor(Date.now() / 1000) + UPLOAD_TOKEN_TTL_SECONDS;
  const signature = createHmac("sha1", privateKey).update(token + expire).digest("hex");
  return { publicKey, urlEndpoint, token, expire, signature, folder: FOLDERS[target] };
}

async function verifyImage(image: ImageAsset, folder: string, field: string) {
  const { privateKey, urlEndpoint } = requireConfig();
  const invalid = (message: string) => new BadRequestError(message, { [field]: [message] });

  if (!image.url.startsWith(`${urlEndpoint}/`)) throw invalid("The image must be uploaded through the admin uploader");

  let details: { fileType?: string; mime?: string; size?: number; filePath?: string; url?: string };
  try {
    const response = await fetch(`${API_BASE}/files/${encodeURIComponent(image.fileId)}/details`, {
      headers: { Authorization: basicAuth(privateKey), Accept: "application/json" },
      cache: "no-store",
      signal: AbortSignal.timeout(10000),
    });
    if (response.status === 404) throw invalid("The uploaded image could not be found. Please upload it again");
    if (!response.ok) throw new Error(`ImageKit responded with ${response.status}`);
    details = await response.json();
  } catch (error) {
    if (error instanceof BadRequestError) throw error;
    console.error("ImageKit image verification failed", error);
    throw new ServiceUnavailableError("The image could not be verified right now. Please try again.");
  }

  if (details.fileType !== "image" || !IMAGE_MIME_TYPES.includes(details.mime as (typeof IMAGE_MIME_TYPES)[number])) throw invalid("Only JPG, PNG or WebP images are allowed");
  if ((details.size ?? 0) > MAX_IMAGE_BYTES) throw invalid("Images must be 5 MB or smaller");
  if (!details.filePath?.startsWith(`${folder}/`)) throw invalid("The image was uploaded to the wrong folder");
  if (!details.url || new URL(details.url).pathname !== new URL(image.url).pathname) throw invalid("The image details do not match the uploaded file");
}

// Images already saved on the record were verified before, so only new ones are checked with ImageKit.
export async function verifyNewImages(images: ImageAsset[], target: UploadTarget, knownFileIds: Set<string>, field: string) {
  const fresh = images.filter((image) => !knownFileIds.has(image.fileId));
  await Promise.all(fresh.map((image) => verifyImage(image, FOLDERS[target], field)));
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
    heroSlideRepository.isHeroImageFileUsed(fileId),
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
