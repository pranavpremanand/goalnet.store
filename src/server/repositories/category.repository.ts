import type { Types } from "mongoose";
import type { CategoryDto } from "@/lib/types/catalog";
import { connectToDatabase } from "@/server/db/connect";
import { CategoryModel, type CategoryAttrs } from "@/server/models/category.model";

export type CategoryRecord = Omit<CategoryDto, "productCount">;
export type CategoryData = Pick<CategoryAttrs, "name" | "slug" | "description" | "tagline" | "coverImage" | "isActive" | "displayOrder">;

type CategoryDoc = CategoryAttrs & { _id: Types.ObjectId };

function toRecord(doc: CategoryDoc): CategoryRecord {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    // Categories created before the tagline existed have no value stored.
    tagline: doc.tagline ?? "",
    coverImage: { url: doc.coverImage.url, fileId: doc.coverImage.fileId, alt: doc.coverImage.alt },
    isActive: doc.isActive,
    displayOrder: doc.displayOrder,
    createdAt: doc.createdAt.toISOString(),
  };
}

export async function listCategories(options: { activeOnly?: boolean } = {}): Promise<CategoryRecord[]> {
  await connectToDatabase();
  const docs = await CategoryModel.find(options.activeOnly ? { isActive: true } : {}).sort({ displayOrder: 1, createdAt: 1 }).lean<CategoryDoc[]>();
  return docs.map(toRecord);
}

export async function findCategoryById(id: string): Promise<CategoryRecord | null> {
  await connectToDatabase();
  const doc = await CategoryModel.findById(id).lean<CategoryDoc>();
  return doc ? toRecord(doc) : null;
}

export async function categorySlugExists(slug: string, excludeId?: string) {
  await connectToDatabase();
  return (await CategoryModel.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) !== null;
}

export async function createCategory(data: CategoryData): Promise<CategoryRecord> {
  await connectToDatabase();
  const doc = await CategoryModel.create(data);
  return toRecord(doc.toObject() as CategoryDoc);
}

export async function updateCategory(id: string, data: CategoryData): Promise<CategoryRecord | null> {
  await connectToDatabase();
  const doc = await CategoryModel.findByIdAndUpdate(id, { $set: data }, { returnDocument: "after", runValidators: true }).lean<CategoryDoc>();
  return doc ? toRecord(doc) : null;
}

export async function deleteCategory(id: string) {
  await connectToDatabase();
  return (await CategoryModel.deleteOne({ _id: id })).deletedCount === 1;
}

export async function isCoverImageFileUsed(fileId: string) {
  await connectToDatabase();
  return (await CategoryModel.exists({ "coverImage.fileId": fileId })) !== null;
}
