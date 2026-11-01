import type { AvailabilityStatus, ProductType, SizeSystem } from "@/lib/catalog-constants";

// What the customer-facing pages need to show a product; admin-only fields are left out.
export type StoreProduct = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: { name: string; slug: string };
  productType: ProductType;
  brand: string;
  teamName: string;
  season: string;
  material: string;
  price: number;
  compareAtPrice: number | null;
  image: string;
  imageAlt: string;
  images: { url: string; alt: string }[];
  sizeSystem: SizeSystem;
  sizes: { size: string; availability: AvailabilityStatus }[];
  isFeatured: boolean;
  seoTitle: string;
  seoDescription: string;
};

export type StoreCategory = { id: string; name: string; slug: string };

export type CartProduct = Pick<StoreProduct, "id" | "slug" | "name" | "image" | "imageAlt" | "price">;
