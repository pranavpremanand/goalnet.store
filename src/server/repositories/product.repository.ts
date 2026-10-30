import type { QueryFilter, Types } from "mongoose";
import type { ProductDto } from "@/lib/types/catalog";
import { connectToDatabase } from "@/server/db/connect";
import { ProductModel, type ProductAttrs } from "@/server/models/product.model";

export type ProductData = Omit<ProductAttrs, "category" | "createdAt" | "updatedAt"> & { category: string };

type PopulatedCategory = { _id: Types.ObjectId; name: string; slug: string } | null;
type ProductDoc = Omit<ProductAttrs, "category"> & { _id: Types.ObjectId; category: PopulatedCategory };

function toDto(doc: ProductDoc): ProductDto {
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    team: { name: doc.team.name, type: doc.team.type },
    season: doc.season,
    player: { name: doc.player.name, number: doc.player.number ?? null },
    jerseyType: doc.jerseyType,
    logoType: doc.logoType,
    fabric: doc.fabric,
    price: doc.price,
    compareAtPrice: doc.compareAtPrice ?? null,
    variants: doc.variants.map((variant) => ({ size: variant.size, availabilityStatus: variant.availabilityStatus })),
    images: doc.images.map((image) => ({ url: image.url, fileId: image.fileId, alt: image.alt })),
    category: doc.category ? { id: doc.category._id.toString(), name: doc.category.name, slug: doc.category.slug } : { id: "", name: "Unknown category", slug: "" },
    isActive: doc.isActive,
    isFeatured: doc.isFeatured,
    displayOrder: doc.displayOrder,
    seo: { title: doc.seo.title, description: doc.seo.description },
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString(),
  };
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function listProducts(filter: { page: number; limit: number; q: string; category: string; status: "all" | "active" | "inactive" }) {
  await connectToDatabase();
  const query: QueryFilter<ProductAttrs> = {};
  if (filter.q) {
    const pattern = new RegExp(escapeRegex(filter.q), "i");
    query.$or = [{ name: pattern }, { slug: pattern }, { "team.name": pattern }];
  }
  if (filter.category) query.category = filter.category;
  if (filter.status !== "all") query.isActive = filter.status === "active";

  const [docs, total] = await Promise.all([
    ProductModel.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip((filter.page - 1) * filter.limit)
      .limit(filter.limit)
      .populate("category", "name slug")
      .lean<ProductDoc[]>(),
    ProductModel.countDocuments(query),
  ]);
  return { items: docs.map(toDto), total };
}

export async function findProductById(id: string): Promise<ProductDto | null> {
  await connectToDatabase();
  const doc = await ProductModel.findById(id).populate("category", "name slug").lean<ProductDoc>();
  return doc ? toDto(doc) : null;
}

export async function productSlugExists(slug: string, excludeId?: string) {
  await connectToDatabase();
  return (await ProductModel.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) !== null;
}

export async function createProduct(data: ProductData): Promise<ProductDto> {
  await connectToDatabase();
  const doc = await ProductModel.create(data);
  return (await findProductById(doc._id.toString())) as ProductDto;
}

export async function updateProduct(id: string, data: ProductData): Promise<ProductDto | null> {
  await connectToDatabase();
  const updated = await ProductModel.findByIdAndUpdate(id, { $set: data }, { returnDocument: "after", runValidators: true }).select("_id").lean();
  return updated ? findProductById(id) : null;
}

export async function deleteProduct(id: string) {
  await connectToDatabase();
  return (await ProductModel.deleteOne({ _id: id })).deletedCount === 1;
}

export async function countProductsByCategory(): Promise<Map<string, number>> {
  await connectToDatabase();
  const rows = await ProductModel.aggregate<{ _id: Types.ObjectId; count: number }>([{ $group: { _id: "$category", count: { $sum: 1 } } }]);
  return new Map(rows.map((row) => [row._id.toString(), row.count]));
}

export async function countProductsInCategory(categoryId: string) {
  await connectToDatabase();
  return ProductModel.countDocuments({ category: categoryId });
}
