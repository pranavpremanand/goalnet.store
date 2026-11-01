import type { AvailabilityStatus, JerseyType, LogoType, ProductType, SizeSystem, TeamType } from "@/lib/catalog-constants";

export type ImageAsset = { url: string; fileId: string; alt: string };

export type CategoryDto = {
  id: string;
  name: string;
  slug: string;
  description: string;
  tagline: string;
  coverImage: ImageAsset;
  isActive: boolean;
  displayOrder: number;
  productCount: number;
  createdAt: string;
};

export type ProductDto = {
  id: string;
  name: string;
  slug: string;
  description: string;
  productType: ProductType;
  brand: string;
  team: { name: string; type: TeamType | null };
  season: string;
  player: { name: string; number: number | null };
  jerseyType: JerseyType | null;
  logoType: LogoType;
  fabric: string;
  price: number;
  compareAtPrice: number | null;
  sizeSystem: SizeSystem;
  variants: { size: string; availabilityStatus: AvailabilityStatus }[];
  images: ImageAsset[];
  category: { id: string; name: string; slug: string };
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  seo: { title: string; description: string };
  createdAt: string;
  updatedAt: string;
};

export type ProductListResult = { items: ProductDto[]; total: number; page: number; limit: number };

export type UploadAuth = {
  publicKey: string;
  urlEndpoint: string;
  token: string;
  expire: number;
  signature: string;
  folder: string;
};
