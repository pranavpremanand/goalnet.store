import type { CategoryDto } from "@/lib/types/catalog";
import type { CategoryDeleteOptions, CategoryInput } from "@/lib/validation/catalog";
import { isDuplicateKeyError } from "@/server/db/errors";
import { BadRequestError, ConflictError, NotFoundError } from "@/server/errors";
import * as categoryRepository from "@/server/repositories/category.repository";
import * as productRepository from "@/server/repositories/product.repository";
import { deleteImages, verifyNewImages } from "@/server/services/image.service";
import { resolveSlug } from "@/server/services/slug.service";

export type PublicCategory = Pick<CategoryDto, "id" | "name" | "slug" | "description" | "tagline" | "coverImage">;

const SLUG_TAKEN = "This slug is already in use";

export async function listCategories(): Promise<CategoryDto[]> {
  const [categories, counts] = await Promise.all([categoryRepository.listCategories(), productRepository.countProductsByCategory()]);
  return categories.map((category) => ({ ...category, productCount: counts.get(category.id) ?? 0 }));
}

// Storefront: only categories the admin has switched on.
export async function listActiveCategories(): Promise<PublicCategory[]> {
  const categories = await categoryRepository.listCategories({ activeOnly: true });
  return categories.map(({ id, name, slug, description, tagline, coverImage }) => ({ id, name, slug, description, tagline, coverImage }));
}

export async function getCategory(id: string): Promise<CategoryDto> {
  const category = await categoryRepository.findCategoryById(id);
  if (!category) throw new NotFoundError("Category not found.");
  return { ...category, productCount: await productRepository.countProductsInCategory(id) };
}

export async function createCategory(input: CategoryInput): Promise<CategoryDto> {
  const slug = await resolveSlug({ requested: input.slug, name: input.name, exists: (value) => categoryRepository.categorySlugExists(value) });
  await verifyNewImages([input.coverImage], "category", new Set(), "coverImage");

  try {
    const category = await categoryRepository.createCategory({ name: input.name, slug, description: input.description, tagline: input.tagline, coverImage: input.coverImage, isActive: input.isActive, displayOrder: input.displayOrder });
    return { ...category, productCount: 0 };
  } catch (error) {
    if (isDuplicateKeyError(error)) throw new ConflictError(SLUG_TAKEN, { slug: [SLUG_TAKEN] });
    throw error;
  }
}

export async function updateCategory(id: string, input: CategoryInput): Promise<CategoryDto> {
  const existing = await categoryRepository.findCategoryById(id);
  if (!existing) throw new NotFoundError("Category not found.");

  const slug = await resolveSlug({ requested: input.slug, name: input.name, current: existing.slug, exists: (value) => categoryRepository.categorySlugExists(value, id) });
  await verifyNewImages([input.coverImage], "category", new Set([existing.coverImage.fileId]), "coverImage");

  let updated;
  try {
    updated = await categoryRepository.updateCategory(id, { name: input.name, slug, description: input.description, tagline: input.tagline, coverImage: input.coverImage, isActive: input.isActive, displayOrder: input.displayOrder });
  } catch (error) {
    if (isDuplicateKeyError(error)) throw new ConflictError(SLUG_TAKEN, { slug: [SLUG_TAKEN] });
    throw error;
  }
  if (!updated) throw new NotFoundError("Category not found.");

  if (existing.coverImage.fileId !== updated.coverImage.fileId) await deleteImages([existing.coverImage.fileId]);
  return { ...updated, productCount: await productRepository.countProductsInCategory(id) };
}

export async function deleteCategory(id: string, options: CategoryDeleteOptions = {}) {
  const existing = await categoryRepository.findCategoryById(id);
  if (!existing) throw new NotFoundError("Category not found.");

  const productCount = await productRepository.countProductsInCategory(id);
  let productFileIds: string[] = [];

  if (productCount > 0) {
    if (!options.productAction) {
      throw new ConflictError(`This category has ${productCount} ${productCount === 1 ? "product" : "products"}. Move them to another category or delete them along with the category.`);
    }

    if (options.productAction === "reassign") {
      const target = options.targetCategoryId && options.targetCategoryId !== id ? await categoryRepository.findCategoryById(options.targetCategoryId) : null;
      if (!target) throw new BadRequestError("Choose another category to move the products to.", { targetCategoryId: ["Choose another category"] });
      await productRepository.moveProductsToCategory(id, target.id);
    } else {
      productFileIds = await productRepository.listImageFileIdsInCategory(id);
      await productRepository.deleteProductsInCategory(id);
    }
  }

  await categoryRepository.deleteCategory(id);
  await deleteImages([existing.coverImage.fileId, ...productFileIds]);
}
