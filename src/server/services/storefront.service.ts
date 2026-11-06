import type { ProductDto } from "@/lib/types/catalog";
import type { JerseyType, TeamType } from "@/lib/catalog-constants";
import type { StoreCategory, StorePriceBand, StoreProduct, StoreProductPage } from "@/lib/types/storefront";
import * as categoryRepository from "@/server/repositories/category.repository";
import * as productRepository from "@/server/repositories/product.repository";

function toStoreProduct(product: ProductDto): StoreProduct {
  const [main] = product.images;
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    category: { name: product.category.name, slug: product.category.slug },
    productType: product.productType,
    brand: product.brand,
    teamName: product.team.name,
    season: product.season,
    material: product.fabric,
    jerseyType: product.jerseyType ?? null,
    price: product.price,
    compareAtPrice: product.compareAtPrice,
    image: main?.url ?? "",
    imageAlt: main?.alt || product.name,
    images: product.images.map((image) => ({ url: image.url, alt: image.alt || product.name })),
    sizeSystem: product.sizeSystem,
    sizes: product.variants.map((variant) => ({ size: variant.size, availability: variant.availabilityStatus })),
    isFeatured: product.isFeatured,
    seoTitle: product.seo.title,
    seoDescription: product.seo.description,
  };
}

async function activeCategoryIds() {
  return (await categoryRepository.listCategories({ activeOnly: true })).map((category) => category.id);
}

export async function listStoreCategories(): Promise<StoreCategory[]> {
  return (await categoryRepository.listCategories({ activeOnly: true })).map(({ id, name, slug }) => ({ id, name, slug }));
}

const STOREFRONT_PAGE_SIZE = 24;

export async function listStoreProductPage(filter: {
  page: number;
  query: string;
  categories: string[];
  teamTypes?: TeamType[];
  jerseyTypes?: JerseyType[];
  minPrice?: number;
  maxPrice?: number;
  sort: "featured" | "low" | "high";
}): Promise<StoreProductPage> {
  const categories = await categoryRepository.listCategories({ activeOnly: true });
  const requestedSlugs = new Set(filter.categories);
  const visibleCategories = filter.categories.length
    ? categories.filter((category) => requestedSlugs.has(category.slug))
    : categories;
  const categoryIds = visibleCategories.map((category) => category.id);
  const emptyPage = { items: [], page: filter.page, total: 0, hasMore: false };
  if (filter.categories.length > 0 && categoryIds.length !== requestedSlugs.size) return emptyPage;

  const result = await productRepository.listActiveProductPage({
    categoryIds,
    searchCategoryIds: filter.query
      ? visibleCategories
        .filter((category) => category.name.toLocaleLowerCase().includes(filter.query.toLocaleLowerCase()))
        .map((category) => category.id)
      : [],
    query: filter.query,
    teamTypes: filter.teamTypes,
    jerseyTypes: filter.jerseyTypes,
    minPrice: filter.minPrice,
    maxPrice: filter.maxPrice,
    sort: filter.sort,
    page: filter.page,
    pageSize: STOREFRONT_PAGE_SIZE,
  });

  return {
    items: result.items.map(toStoreProduct),
    page: filter.page,
    total: result.total,
    hasMore: result.hasMore,
  };
}

export async function listStorePriceBands(): Promise<StorePriceBand[]> {
  return productRepository.listActivePriceBands(await activeCategoryIds());
}

export async function searchStoreProducts(query: string) {
  return productRepository.searchActiveProducts(query, await activeCategoryIds());
}

export async function getStoreProduct(slug: string): Promise<StoreProduct | null> {
  const product = await productRepository.findActiveProductBySlug(slug, await activeCategoryIds());
  return product ? toStoreProduct(product) : null;
}

export async function listStoreProductsByIds(ids: string[]): Promise<StoreProduct[]> {
  if (!ids || ids.length === 0) return [];
  const products = await productRepository.listActiveProducts({ categoryIds: await activeCategoryIds(), ids });
  return products.map(toStoreProduct);
}

// Shows featured products; before any are marked featured, the newest products fill the section.
export async function listFeaturedProducts(limit: number): Promise<StoreProduct[]> {
  const categoryIds = await activeCategoryIds();
  const featured = await productRepository.listActiveProducts({ categoryIds, featuredOnly: true, limit });
  const products = featured.length > 0 ? featured : await productRepository.listActiveProducts({ categoryIds, limit });
  return products.map(toStoreProduct);
}

// Same-category products first, then the rest, so the section is full whenever the catalog allows it.
export async function listRelatedProducts(product: StoreProduct, limit: number): Promise<StoreProduct[]> {
  const categoryIds = await activeCategoryIds();
  const candidates = await productRepository.listActiveProducts({ categoryIds, excludeId: product.id, limit: 50 });
  const ranked = [...candidates].sort((a, b) => Number(b.category.slug === product.category.slug) - Number(a.category.slug === product.category.slug));
  return ranked.slice(0, limit).map(toStoreProduct);
}
