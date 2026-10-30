import type { AvailabilityStatus, JerseyType, LogoType, Size, TeamType } from "@/lib/catalog-constants";

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
  team: { name: string; type: TeamType };
  season: string;
  player: { name: string; number: number | null };
  jerseyType: JerseyType;
  logoType: LogoType;
  fabric: string;
  price: number;
  compareAtPrice: number | null;
  variants: { size: Size; availabilityStatus: AvailabilityStatus }[];
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
