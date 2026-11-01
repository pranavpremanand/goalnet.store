import { IMAGE_MIME_TYPES, MAX_IMAGE_BYTES } from "@/lib/catalog-constants";
import { ApiError, apiRequest } from "@/lib/api-client";
import type { CategoryDto, ImageAsset, ProductDto, UploadAuth } from "@/lib/types/catalog";
import type { CategoryDeleteOptions, CategoryInput, ProductInput, UploadTarget } from "@/lib/validation/catalog";

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

const json = (method: string, body: unknown) => ({ method, body: JSON.stringify(body) });

export const categoryApi = {
  create: (input: CategoryInput) => apiRequest<{ category: CategoryDto }>("/api/admin/categories", json("POST", input)),
  update: (id: string, input: CategoryInput) => apiRequest<{ category: CategoryDto }>(`/api/admin/categories/${id}`, json("PUT", input)),
  remove: (id: string, options: CategoryDeleteOptions = {}) => {
    const params = new URLSearchParams();
    if (options.productAction) params.set("productAction", options.productAction);
    if (options.targetCategoryId) params.set("targetCategoryId", options.targetCategoryId);
    const query = params.toString();
    return apiRequest<void>(`/api/admin/categories/${id}${query ? `?${query}` : ""}`, { method: "DELETE" });
  },
};

export const productApi = {
  create: (input: ProductInput) => apiRequest<{ product: ProductDto }>("/api/admin/products", json("POST", input)),
  update: (id: string, input: ProductInput) => apiRequest<{ product: ProductDto }>(`/api/admin/products/${id}`, json("PUT", input)),
  remove: (id: string) => apiRequest<void>(`/api/admin/products/${id}`, { method: "DELETE" }),
};

// Deletes uploads that were never saved. Failures are ignored; the server only removes files no record uses.
export async function discardUploads(fileIds: string[], keepalive = false) {
  if (fileIds.length === 0) return;
  try {
    await fetch("/api/admin/uploads/discard", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ fileIds }), keepalive });
  } catch {
    // Nothing to do: the file simply stays in ImageKit.
  }
}

// Uploads straight from the browser to ImageKit using a signature issued by our API.
export async function uploadImage(file: File, target: UploadTarget): Promise<ImageAsset> {
  if (!IMAGE_MIME_TYPES.includes(file.type as (typeof IMAGE_MIME_TYPES)[number])) throw new ApiError(400, "Only JPG, PNG or WebP images are allowed.");
  if (file.size > MAX_IMAGE_BYTES) throw new ApiError(400, "Images must be 5 MB or smaller.");

  const auth = await apiRequest<UploadAuth>("/api/admin/uploads/auth", json("POST", { target }));

  const form = new FormData();
  form.append("file", file);
  form.append("fileName", file.name);
  form.append("publicKey", auth.publicKey);
  form.append("signature", auth.signature);
  form.append("expire", String(auth.expire));
  form.append("token", auth.token);
  form.append("folder", auth.folder);
  form.append("useUniqueFileName", "true");

  let response: Response;
  try {
    response = await fetch(IMAGEKIT_UPLOAD_URL, { method: "POST", body: form });
  } catch {
    throw new ApiError(0, "The upload could not reach ImageKit. Check your connection and try again.");
  }

  const result = (await response.json().catch(() => null)) as { url?: string; fileId?: string; message?: string } | null;
  if (!response.ok || !result?.url || !result.fileId) throw new ApiError(response.status, result?.message ?? "The image upload failed. Please try again.");
  return { url: result.url, fileId: result.fileId, alt: "" };
}
