import type { ProductDto } from "@/lib/types/catalog";
import type { FitType, JerseyType, LogoType, TeamType } from "@/lib/catalog-constants";
import type { OfferPrice } from "@/lib/types/offers";
import type { StoreCategory, StorePriceBand, StoreProduct, StoreProductPage } from "@/lib/types/storefront";
import * as categoryRepository from "@/server/repositories/category.repository";
import * as productRepository from "@/server/repositories/product.repository";
import * as offerService from "@/server/services/offer.service";

function toStoreProduct(product: ProductDto, price: OfferPrice): StoreProduct {
  const [main] = product.images;
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    category: { name: product.category.name, slug: product.category.slug },
    categories: product.categories.map(({ name, slug }) => ({ name, slug })),
    productType: product.productType,
    brand: product.brand,
    teamName: product.team.name ?? "",
    season: product.season,
    material: product.fabric,
    jerseyType: product.jerseyType ?? null,
    fit: product.fit,
    price: price.price,
    originalPrice: price.originalPrice,
    discountAmount: price.discountAmount,
    offerName: price.offerName,
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

async function toStoreProducts(products: ProductDto[]): Promise<StoreProduct[]> {
  const prices = await offerService.priceProducts(products);
  return products.map((product) => toStoreProduct(product, prices.get(product.id) ?? {
    price: product.price,
    originalPrice: product.price,
    discountAmount: 0,
    offerName: null,
  }));
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
  logoTypes?: LogoType[];
  jerseyTypes?: JerseyType[];
  fits?: FitType[];
  minPrice?: number;
  maxPrice?: number;
  sort: "featured" | "newest" | "low" | "high";
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
    includeUncategorized: filter.categories.length === 0,
    searchCategoryIds: filter.query
      ? visibleCategories
        .filter((category) => category.name.toLocaleLowerCase().includes(filter.query.toLocaleLowerCase()))
        .map((category) => category.id)
      : [],
    query: filter.query,
    teamTypes: filter.teamTypes,
    logoTypes: filter.logoTypes,
    jerseyTypes: filter.jerseyTypes,
    fits: filter.fits,
    minPrice: filter.minPrice,
    maxPrice: filter.maxPrice,
    sort: filter.sort,
    page: filter.page,
    pageSize: STOREFRONT_PAGE_SIZE,
  });

  return {
    items: await toStoreProducts(result.items),
    page: filter.page,
    total: result.total,
    hasMore: result.hasMore,
  };
}

export async function listStorePriceBands(): Promise<StorePriceBand[]> {
  return productRepository.listActivePriceBands(await activeCategoryIds());
}

export async function searchStoreProducts(query: string, page: number) {
  const result = await productRepository.searchActiveProducts(query, await activeCategoryIds(), page);
  const prices = await offerService.priceProducts(result.items.map((product) => ({
    id: product.id,
    price: product.price,
    category: { id: product.categoryIds[0] ?? "", name: "", slug: "" },
    categories: product.categoryIds.map((id) => ({ id, name: "", slug: "" })),
  })));
  return {
    items: result.items.map((product) => ({
      ...product,
      ...(prices.get(product.id) ?? {
        price: product.price,
        originalPrice: product.price,
        discountAmount: 0,
        offerName: null,
      }),
    })),
    hasMore: result.hasMore,
  };
}

export async function getStoreProduct(slug: string): Promise<StoreProduct | null> {
  const product = await productRepository.findActiveProductBySlug(slug, await activeCategoryIds());
  return product ? (await toStoreProducts([product]))[0] : null;
}

export async function listStoreProductsByIds(ids: string[]): Promise<StoreProduct[]> {
  if (!ids || ids.length === 0) return [];
  const products = await productRepository.listActiveProducts({ categoryIds: await activeCategoryIds(), ids });
  return toStoreProducts(products);
}

// Shows featured products in admin-defined order; without featured items, the catalog order fills the section.
export async function listFeaturedProducts(limit: number): Promise<StoreProduct[]> {
  const categoryIds = await activeCategoryIds();
  const featured = await productRepository.listActiveProducts({ categoryIds, featuredOnly: true, limit });
  const products = featured.length > 0 ? featured : await productRepository.listActiveProducts({ categoryIds, limit });
  return toStoreProducts(products);
}

export async function listRelatedProducts(product: StoreProduct, limit: number): Promise<StoreProduct[]> {
  const categoryIds = await activeCategoryIds();
  const candidates = await productRepository.listActiveProducts({ categoryIds, excludeId: product.id, limit: 50 });
  return toStoreProducts(candidates.slice(0, limit));
}
