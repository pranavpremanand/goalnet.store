import type { ProductDto } from "@/lib/types/catalog";
import type { StoreCategory, StoreProduct } from "@/lib/types/storefront";
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

export async function listStoreProducts(): Promise<StoreProduct[]> {
  const products = await productRepository.listActiveProducts({ categoryIds: await activeCategoryIds() });
  return products.map(toStoreProduct);
}

export async function getStoreProduct(slug: string): Promise<StoreProduct | null> {
  const product = await productRepository.findActiveProductBySlug(slug, await activeCategoryIds());
  return product ? toStoreProduct(product) : null;
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
