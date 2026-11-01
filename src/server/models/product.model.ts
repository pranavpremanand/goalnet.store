import { Schema, model, models, type Model, type Types } from "mongoose";
import { AVAILABILITY_STATUSES, JERSEY_TYPES, LOGO_TYPES, PRODUCT_TYPES, SIZE_SYSTEMS, TEAM_TYPES, type AvailabilityStatus, type JerseyType, type LogoType, type ProductType, type SizeSystem, type TeamType } from "@/lib/catalog-constants";
import "@/server/models/category.model";

export interface ProductAttrs {
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
  images: { url: string; fileId: string; alt: string }[];
  category: Types.ObjectId;
  isActive: boolean;
  isFeatured: boolean;
  displayOrder: number;
  seo: { title: string; description: string };
  createdAt: Date;
  updatedAt: Date;
}

const productSchema = new Schema<ProductAttrs>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "", trim: true },
    // Jersey-style fields below are only filled in for jerseys and kits; the service enforces this per product type.
    productType: { type: String, enum: PRODUCT_TYPES, default: "jersey", required: true },
    brand: { type: String, default: "", trim: true },
    team: {
      name: { type: String, default: "", trim: true },
      type: { type: String, enum: TEAM_TYPES, default: null },
    },
    season: { type: String, default: "", trim: true },
    player: {
      name: { type: String, default: "", trim: true },
      number: { type: Number, default: null, min: 0, max: 99 },
    },
    jerseyType: { type: String, enum: JERSEY_TYPES, default: null },
    logoType: { type: String, enum: LOGO_TYPES, default: "unknown" },
    fabric: { type: String, default: "DotNet breathable fabric", trim: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null, min: 0 },
    sizeSystem: { type: String, enum: SIZE_SYSTEMS, default: "apparel" },
    variants: [
      {
        _id: false,
        size: { type: String, required: true, trim: true },
        availabilityStatus: { type: String, enum: AVAILABILITY_STATUSES, default: "supplier-confirmation-required" },
      },
    ],
    images: [
      {
        _id: false,
        url: { type: String, required: true },
        fileId: { type: String, required: true },
        alt: { type: String, default: "", trim: true },
      },
    ],
    category: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    isActive: { type: Boolean, default: true },
    isFeatured: { type: Boolean, default: false },
    displayOrder: { type: Number, default: 0 },
    seo: {
      title: { type: String, default: "", trim: true },
      description: { type: String, default: "", trim: true },
    },
  },
  { timestamps: true },
);

productSchema.index({ category: 1, isActive: 1 });
productSchema.index({ isFeatured: 1, isActive: 1 });

export const ProductModel = (models.Product as Model<ProductAttrs> | undefined) ?? model<ProductAttrs>("Product", productSchema);
