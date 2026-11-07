import { isTeamBased } from "@/lib/catalog-constants";
import type { ProductDto, ProductListResult } from "@/lib/types/catalog";
import type { ProductInput, ProductListQuery } from "@/lib/validation/catalog";
import { isDuplicateKeyError } from "@/server/db/errors";
import { BadRequestError, ConflictError, NotFoundError } from "@/server/errors";
import * as categoryRepository from "@/server/repositories/category.repository";
import * as productRepository from "@/server/repositories/product.repository";
import { deleteImages, verifyNewImages } from "@/server/services/image.service";
import { resolveSlug } from "@/server/services/slug.service";

const SLUG_TAKEN = "This slug is already in use";

async function assertCategoriesExist(categoryIds: string[]) {
  const categories = await Promise.all(categoryIds.map((id) => categoryRepository.findCategoryById(id)));
  if (categories.some((category) => !category)) {
    throw new BadRequestError("One or more selected categories do not exist.", { categories: ["Select valid categories"] });
  }
}

function toData(input: ProductInput, slug: string): productRepository.ProductData {
  // Jersey-style details only make sense for jerseys and kits, so they are cleared for every other type.
  const teamBased = isTeamBased(input.productType);
  return {
    ...input,
    category: input.categories[0],
    categories: input.categories,
    slug,
    team: teamBased ? input.team : { name: null, type: null },
    season: teamBased ? input.season : "",
    player: teamBased ? input.player : { name: "", number: null },
    jerseyType: input.productType === "jersey" ? input.jerseyType : null,
    fit: input.productType === "jersey" ? input.fit : null,
    logoType: teamBased ? input.logoType : "unknown",
  };
}

export async function listProducts(query: ProductListQuery): Promise<ProductListResult> {
  const { items, total } = await productRepository.listProducts(query);
  return { items, total, page: query.page, limit: query.limit };
}

export async function getProduct(id: string): Promise<ProductDto> {
  const product = await productRepository.findProductById(id);
  if (!product) throw new NotFoundError("Product not found.");
  return product;
}

export async function createProduct(input: ProductInput): Promise<ProductDto> {
  await assertCategoriesExist(input.categories);
  const slug = await resolveSlug({ requested: input.slug, name: input.name, exists: (value) => productRepository.productSlugExists(value) });
  await verifyNewImages(input.images, "product", new Set(), "images");

  try {
    return await productRepository.createProduct(toData(input, slug));
  } catch (error) {
    if (isDuplicateKeyError(error)) throw new ConflictError(SLUG_TAKEN, { slug: [SLUG_TAKEN] });
    throw error;
  }
}

export async function updateProduct(id: string, input: ProductInput): Promise<ProductDto> {
  const existing = await productRepository.findProductById(id);
  if (!existing) throw new NotFoundError("Product not found.");

  await assertCategoriesExist(input.categories);
  const slug = await resolveSlug({ requested: input.slug, name: input.name, current: existing.slug, exists: (value) => productRepository.productSlugExists(value, id) });
  await verifyNewImages(input.images, "product", new Set(existing.images.map((image) => image.fileId)), "images");

  let updated: ProductDto | null;
  try {
    updated = await productRepository.updateProduct(id, toData(input, slug));
  } catch (error) {
    if (isDuplicateKeyError(error)) throw new ConflictError(SLUG_TAKEN, { slug: [SLUG_TAKEN] });
    throw error;
  }
  if (!updated) throw new NotFoundError("Product not found.");

  const keptFileIds = new Set(updated.images.map((image) => image.fileId));
  await deleteImages(existing.images.filter((image) => !keptFileIds.has(image.fileId)).map((image) => image.fileId));
  return updated;
}

export async function deleteProduct(id: string) {
  const existing = await productRepository.findProductById(id);
  if (!existing) throw new NotFoundError("Product not found.");

  await productRepository.deleteProduct(id);
  await deleteImages(existing.images.map((image) => image.fileId));
}
