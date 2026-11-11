import { Types, type QueryFilter } from "mongoose";
import type { FitType, JerseyType, LogoType, TeamType } from "@/lib/catalog-constants";
import type { ProductDto } from "@/lib/types/catalog";
import type { StorePriceBand } from "@/lib/types/storefront";
import { connectToDatabase } from "@/server/db/connect";
import { ProductModel, type ProductAttrs, type StoredJerseyType } from "@/server/models/product.model";

export type ProductData = Omit<ProductAttrs, "category" | "categories" | "createdAt" | "updatedAt"> & {
  category: string | null;
  categories: string[];
};

type PopulatedCategory = { _id: Types.ObjectId; name: string; slug: string } | null;
type ProductDoc = Omit<ProductAttrs, "category" | "categories"> & {
  _id: Types.ObjectId;
  category?: PopulatedCategory;
  categories?: (PopulatedCategory | Types.ObjectId)[];
};
const uncategorizedCondition: QueryFilter<ProductAttrs> = {
  $and: [
    { $or: [{ category: { $exists: false } }, { category: null }] },
    { $or: [{ categories: { $exists: false } }, { categories: { $size: 0 } }, { categories: null }] },
  ],
};

function categoryFilter(categoryIds: string[], includeUncategorized = false): QueryFilter<ProductAttrs> {
  return {
    $or: [
      { categories: { $in: categoryIds } },
      { category: { $in: categoryIds } },
      ...(includeUncategorized ? [uncategorizedCondition] : []),
    ],
  };
}

const LEGACY_OVERSIZED_TYPES: StoredJerseyType[] = ["oversized-five-sleeve", "oversized-full-sleeve"];
const LEGACY_OVERSIZED_TEXT = /oversized/i;

function normalizeJerseyType(value: unknown): JerseyType | null {
  switch (value) {
    case "half-sleeve":
      return "half-sleeve";
    case "five-sleeve":
    case "oversized-five-sleeve":
    case "five-sleeve-collar":
      return "five-sleeve";
    case "full-sleeve":
    case "oversized-full-sleeve":
    case "full-sleeve-collar":
    case "full-sleeve-round-neck":
      return "full-sleeve";
    default:
      return null;
  }
}

function toDto(doc: ProductDoc): ProductDto {
  const isLegacyOversized = (doc.jerseyType !== null && LEGACY_OVERSIZED_TYPES.includes(doc.jerseyType))
    || LEGACY_OVERSIZED_TEXT.test(`${doc.name} ${doc.description}`);
  const categories = (doc.categories ?? [])
    .filter((category): category is NonNullable<PopulatedCategory> => category !== null && typeof category === "object" && "name" in category)
    .map((category) => ({ id: category._id.toString(), name: category.name, slug: category.slug }));
  const normalizedCategories = categories.length
    ? categories
    : doc.category
      ? [{ id: doc.category._id.toString(), name: doc.category.name, slug: doc.category.slug }]
      : [];
  const primaryCategory = normalizedCategories[0] ?? { id: "", name: "", slug: "" };
  return {
    id: doc._id.toString(),
    name: doc.name,
    slug: doc.slug,
    description: doc.description,
    productType: doc.productType ?? "jersey",
    brand: doc.brand ?? "",
    team: { name: doc.team?.name || null, type: doc.team?.type ?? null },
    season: doc.season,
    player: { name: doc.player.name, number: doc.player.number ?? null },
    jerseyType: normalizeJerseyType(doc.jerseyType),
    fit: doc.productType === "jersey"
      ? doc.fit ?? (isLegacyOversized ? "oversized" : "regular")
      : null,
    logoType: doc.logoType,
    fabric: doc.fabric,
    price: doc.price,
    compareAtPrice: doc.compareAtPrice ?? null,
    sizeSystem: doc.sizeSystem ?? "apparel",
    variants: doc.variants.map((variant) => ({ size: variant.size, availabilityStatus: variant.availabilityStatus })),
    images: doc.images.map((image) => ({ url: image.url, fileId: image.fileId, alt: image.alt })),
    category: primaryCategory,
    categories: normalizedCategories,
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
  const conditions: QueryFilter<ProductAttrs>[] = [];
  if (filter.q) {
    const pattern = new RegExp(escapeRegex(filter.q), "i");
    conditions.push({ $or: [{ name: pattern }, { slug: pattern }, { brand: pattern }, { "team.name": pattern }] });
  }
  if (filter.category) conditions.push({ $or: [{ category: filter.category }, { categories: filter.category }] });
  if (conditions.length === 1) Object.assign(query, conditions[0]);
  else if (conditions.length > 1) query.$and = conditions;
  if (filter.status !== "all") query.isActive = filter.status === "active";

  const [docs, total] = await Promise.all([
    ProductModel.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .skip((filter.page - 1) * filter.limit)
      .limit(filter.limit)
      .populate("category", "name slug")
      .populate("categories", "name slug")
      .lean<ProductDoc[]>(),
    ProductModel.countDocuments(query),
  ]);
  return { items: docs.map(toDto), total };
}

export async function findProductById(id: string): Promise<ProductDto | null> {
  await connectToDatabase();
  const doc = await ProductModel.findById(id).populate("category", "name slug").populate("categories", "name slug").lean<ProductDoc>();
  return doc ? toDto(doc) : null;
}

type StorefrontFilter = { categoryIds: string[]; featuredOnly?: boolean; categoryId?: string; excludeId?: string; ids?: string[]; limit?: number };
type StorefrontPageFilter = {
  categoryIds: string[];
  includeUncategorized: boolean;
  searchCategoryIds: string[];
  query: string;
  teamTypes?: TeamType[];
  logoTypes?: LogoType[];
  jerseyTypes?: JerseyType[];
  fits?: FitType[];
  minPrice?: number;
  maxPrice?: number;
  sort: "featured" | "newest" | "low" | "high";
  page: number;
  pageSize: number;
};

// Category-less products are available in unrestricted storefront queries, but not category-filtered results.
export async function listActiveProducts(filter: StorefrontFilter): Promise<ProductDto[]> {
  const includeUncategorized = !filter.categoryId;
  if (filter.categoryIds.length === 0 && !includeUncategorized) return [];
  await connectToDatabase();

  const query: QueryFilter<ProductAttrs> = {
    isActive: true,
  };
  const conditions: QueryFilter<ProductAttrs>[] = [categoryFilter(filter.categoryIds, includeUncategorized)];
  query.$and = conditions;
  if (filter.featuredOnly) query.isFeatured = true;
  if (filter.categoryId) conditions.push({ $or: [{ categories: filter.categoryId }, { category: filter.categoryId }] });
  if (filter.excludeId) query._id = { $ne: filter.excludeId };
  if (filter.ids) query._id = { $in: filter.ids };

  const docs = await ProductModel.find(query).sort({ displayOrder: 1, createdAt: -1 }).limit(filter.limit ?? 200).populate("category", "name slug").populate("categories", "name slug").lean<ProductDoc[]>();
  return docs.map(toDto);
}

export async function listActiveProductPage(filter: StorefrontPageFilter) {
  if (filter.categoryIds.length === 0 && !filter.includeUncategorized) return { items: [], total: 0, hasMore: false };
  await connectToDatabase();

  const query: QueryFilter<ProductAttrs> = {
    isActive: true,
  };
  const conditions: QueryFilter<ProductAttrs>[] = [categoryFilter(filter.categoryIds, filter.includeUncategorized)];
  if (filter.query) {
    const pattern = new RegExp(escapeRegex(filter.query), "i");
    const searchConditions: QueryFilter<ProductAttrs>[] = [
      { name: pattern },
      { slug: pattern },
      { brand: pattern },
      { "team.name": pattern },
    ];
    if (filter.searchCategoryIds.length > 0) {
      searchConditions.push({
        $or: [
          { categories: { $in: filter.searchCategoryIds } },
          { category: { $in: filter.searchCategoryIds } },
        ],
      });
    }
    conditions.push({ $or: searchConditions });
  }
  if (filter.teamTypes?.length) {
    const teamTypeConditions = filter.teamTypes.map((teamType): QueryFilter<ProductAttrs> => {
      if (teamType === "uncategorized") {
        return {
          productType: { $in: ["jersey", "kit"] },
          $or: [{ "team.type": "uncategorized" }, { "team.type": null }],
        };
      }
      return { "team.type": teamType };
    });
    conditions.push({ $or: teamTypeConditions });
  }
  if (filter.logoTypes?.length) {
    conditions.push({
      productType: { $in: ["jersey", "kit"] },
      logoType: { $in: filter.logoTypes },
    });
  }
  if (filter.fits?.length) {
    const fitConditions = filter.fits.map((fit): QueryFilter<ProductAttrs> => (
      fit === "oversized"
        ? {
            productType: "jersey",
            $or: [
              { fit: "oversized" },
              {
                fit: null,
                $or: [
                  { jerseyType: { $in: LEGACY_OVERSIZED_TYPES } },
                  { name: LEGACY_OVERSIZED_TEXT },
                  { description: LEGACY_OVERSIZED_TEXT },
                ],
              },
            ],
          }
        : {
            productType: "jersey",
            $or: [
              { fit: "regular" },
              {
                fit: null,
                jerseyType: { $nin: LEGACY_OVERSIZED_TYPES },
                name: { $not: LEGACY_OVERSIZED_TEXT },
                description: { $not: LEGACY_OVERSIZED_TEXT },
              },
            ],
          }
    ));
    conditions.push({ $or: fitConditions });
  }
  if (conditions.length === 1) Object.assign(query, conditions[0]);
  else query.$and = conditions;
  if (filter.jerseyTypes?.length) {
    const storedTypes = filter.jerseyTypes.flatMap((jerseyType): (StoredJerseyType | RegExp)[] => {
      switch (jerseyType) {
        case "five-sleeve":
          return ["five-sleeve", /^oversized-five-sleeve$/, /^five-sleeve-collar$/];
        case "full-sleeve":
          return ["full-sleeve", /^oversized-full-sleeve$/, /^full-sleeve-collar$/, /^full-sleeve-round-neck$/];
        default:
          return [jerseyType];
      }
    });
    query.jerseyType = { $in: storedTypes };
  }
  if (filter.minPrice !== undefined || filter.maxPrice !== undefined) {
    query.price = {
      ...(filter.minPrice !== undefined ? { $gte: filter.minPrice } : {}),
      ...(filter.maxPrice !== undefined ? { $lte: filter.maxPrice } : {}),
    };
  }

  const sort: Record<string, 1 | -1> = filter.sort === "low"
    ? { price: 1 as const, displayOrder: 1 as const, createdAt: -1 as const, _id: -1 as const }
    : filter.sort === "high"
      ? { price: -1 as const, displayOrder: 1 as const, createdAt: -1 as const, _id: -1 as const }
      : filter.sort === "newest"
        ? { createdAt: -1 as const, _id: -1 as const }
      : { isFeatured: -1 as const, displayOrder: 1 as const, createdAt: -1 as const, _id: -1 as const };
  const [docs, total] = await Promise.all([
    ProductModel.find(query)
      .sort(sort)
      .skip((filter.page - 1) * filter.pageSize)
      .limit(filter.pageSize + 1)
      .populate("category", "name slug")
      .populate("categories", "name slug")
      .lean<ProductDoc[]>(),
    ProductModel.countDocuments(query),
  ]);
  const hasMore = docs.length > filter.pageSize;

  return {
    items: docs.slice(0, filter.pageSize).map(toDto),
    total,
    hasMore,
  };
}

export async function listActivePriceBands(categoryIds: string[]): Promise<StorePriceBand[]> {
  await connectToDatabase();

  const categoryObjectIds = categoryIds.map((id) => new Types.ObjectId(id));
  const [bounds] = await ProductModel.aggregate<{ minPrice: number; maxPrice: number }>([
    {
      $match: {
        isActive: true,
        $or: [
          { categories: { $in: categoryObjectIds } },
          { category: { $in: categoryObjectIds } },
          uncategorizedCondition,
        ],
      },
    },
    {
      $group: {
        _id: null,
        minPrice: { $min: "$price" },
        maxPrice: { $max: "$price" },
      },
    },
  ]);

  if (!bounds) return [];

  const firstPrice = Math.floor(bounds.minPrice / 100) * 100;
  const lastPrice = Math.ceil((bounds.maxPrice + 1) / 100) * 100 - 1;
  const hundredCount = (lastPrice - firstPrice + 1) / 100;
  const bandCount = Math.min(5, hundredCount);
  const baseHundredsPerBand = Math.floor(hundredCount / bandCount);
  const extraHundreds = hundredCount % bandCount;
  let nextMinPrice = firstPrice;

  return Array.from({ length: bandCount }, (_, index) => {
    const bandSize = (baseHundredsPerBand + (index < extraHundreds ? 1 : 0)) * 100;
    const band = { minPrice: nextMinPrice, maxPrice: nextMinPrice + bandSize - 1 };
    nextMinPrice = band.maxPrice + 1;
    return band;
  });
}

export type ProductSearchRecord = {
  id: string;
  slug: string;
  name: string;
  brand: string;
  teamName: string;
  season: string;
  price: number;
  categoryIds: string[];
  image: string;
  imageAlt: string;
};

type ProductSearchDoc = {
  _id: Types.ObjectId;
  slug: string;
  name: string;
  brand?: string;
  team?: { name?: string };
  season?: string;
  price: number;
  category?: Types.ObjectId;
  categories?: Types.ObjectId[];
  images?: { url?: string; alt?: string }[];
};

const PRODUCT_SEARCH_PAGE_SIZE = 8;

export async function searchActiveProducts(queryText: string, categoryIds: string[], page: number): Promise<{ items: ProductSearchRecord[]; hasMore: boolean }> {
  await connectToDatabase();

  const pattern = new RegExp(escapeRegex(queryText), "i");
  const docs = await ProductModel.find({
    isActive: true,
    $and: [
      categoryFilter(categoryIds, true),
      { $or: [{ name: pattern }, { slug: pattern }, { brand: pattern }, { "team.name": pattern }, { season: pattern }] },
    ],
  })
    .select("name slug brand team.name season price category categories images.url images.alt displayOrder createdAt")
    .sort({ displayOrder: 1, createdAt: -1, _id: 1 })
    .skip((page - 1) * PRODUCT_SEARCH_PAGE_SIZE)
    .limit(PRODUCT_SEARCH_PAGE_SIZE + 1)
    .lean<ProductSearchDoc[]>();

  const hasMore = docs.length > PRODUCT_SEARCH_PAGE_SIZE;
  const items = docs.slice(0, PRODUCT_SEARCH_PAGE_SIZE).map((doc) => {
    const image = doc.images?.[0];
    return {
      id: doc._id.toString(),
      slug: doc.slug,
      name: doc.name,
      brand: doc.brand ?? "",
      teamName: doc.team?.name ?? "",
      season: doc.season ?? "",
      price: doc.price,
      categoryIds: [
        ...(doc.category ? [doc.category.toString()] : []),
        ...(doc.categories ?? []).map((category) => category.toString()),
      ],
      image: image?.url ?? "",
      imageAlt: image?.alt || doc.name,
    };
  });
  return { items, hasMore };
}

export async function findActiveProductBySlug(slug: string, categoryIds: string[]): Promise<ProductDto | null> {
  await connectToDatabase();
  const doc = await ProductModel.findOne({
    slug,
    isActive: true,
    ...categoryFilter(categoryIds, true),
  }).populate("category", "name slug").populate("categories", "name slug").lean<ProductDoc>();
  return doc ? toDto(doc) : null;
}

export async function productSlugExists(slug: string, excludeId?: string) {
  await connectToDatabase();
  return (await ProductModel.exists({ slug, ...(excludeId ? { _id: { $ne: excludeId } } : {}) })) !== null;
}

export async function createProduct(data: ProductData): Promise<ProductDto> {
  await connectToDatabase();
  await ProductModel.updateMany({}, { $inc: { displayOrder: 1 } });
  const doc = await ProductModel.create({ ...data, displayOrder: 0 });
  return (await findProductById(doc._id.toString())) as ProductDto;
}

export async function listProductIdsInOrder(): Promise<string[]> {
  await connectToDatabase();
  const docs = await ProductModel.find({})
    .sort({ displayOrder: 1, createdAt: -1, _id: -1 })
    .select("_id")
    .lean<{ _id: Types.ObjectId }[]>();
  return docs.map((doc) => doc._id.toString());
}

export async function reorderProducts(ids: string[]) {
  await connectToDatabase();
  if (ids.length === 0) return;
  await ProductModel.bulkWrite(ids.map((id, displayOrder) => ({
    updateOne: { filter: { _id: id }, update: { $set: { displayOrder } } },
  })));
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
  const rows = await ProductModel.aggregate<{ _id: Types.ObjectId; count: number }>([
    {
      $project: {
        categoryIds: {
          $cond: [
            { $gt: [{ $size: { $ifNull: ["$categories", []] } }, 0] },
            "$categories",
            ["$category"],
          ],
        },
      },
    },
    { $unwind: "$categoryIds" },
    { $match: { categoryIds: { $ne: null } } },
    { $group: { _id: "$categoryIds", count: { $sum: 1 } } },
  ]);
  return new Map(rows.map((row) => [row._id.toString(), row.count]));
}

export async function countProductsInCategory(categoryId: string) {
  await connectToDatabase();
  return ProductModel.countDocuments({ $or: [{ category: categoryId }, { categories: categoryId }] });
}

export async function moveProductsToCategory(fromCategoryId: string, toCategoryId: string) {
  await connectToDatabase();
  const from = new Types.ObjectId(fromCategoryId);
  const to = new Types.ObjectId(toCategoryId);
  return (await ProductModel.updateMany(
    { $or: [{ category: from }, { categories: from }] },
    [{
      $set: {
        categories: {
          $setUnion: [
            {
              $filter: {
                input: { $ifNull: ["$categories", []] },
                as: "categoryId",
                cond: { $ne: ["$$categoryId", from] },
              },
            },
            [to],
          ],
        },
        category: to,
      },
    }],
  )).modifiedCount;
}

export async function listImageFileIdsInCategory(categoryId: string): Promise<string[]> {
  await connectToDatabase();
  const docs = await ProductModel.find({ $or: [{ category: categoryId }, { categories: categoryId }] }).select("images.fileId").lean<{ images: { fileId: string }[] }[]>();
  return docs.flatMap((doc) => doc.images.map((image) => image.fileId));
}

export async function deleteProductsInCategory(categoryId: string) {
  await connectToDatabase();
  return (await ProductModel.deleteMany({ $or: [{ category: categoryId }, { categories: categoryId }] })).deletedCount;
}

export async function isImageFileUsed(fileId: string) {
  await connectToDatabase();
  return (await ProductModel.exists({ "images.fileId": fileId })) !== null;
}
