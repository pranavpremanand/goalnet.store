import { Schema, model, models, type Model, type Types } from "mongoose";
import { AVAILABILITY_STATUSES, JERSEY_TYPES, LOGO_TYPES, SIZES, TEAM_TYPES, type AvailabilityStatus, type JerseyType, type LogoType, type Size, type TeamType } from "@/lib/catalog-constants";
import "@/server/models/category.model";

export interface ProductAttrs {
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
    team: {
      name: { type: String, required: true, trim: true },
      type: { type: String, enum: TEAM_TYPES, required: true },
    },
    season: { type: String, default: "", trim: true },
    player: {
      name: { type: String, default: "", trim: true },
      number: { type: Number, default: null, min: 0, max: 99 },
    },
    jerseyType: { type: String, enum: JERSEY_TYPES, required: true },
    logoType: { type: String, enum: LOGO_TYPES, default: "unknown" },
    fabric: { type: String, default: "DotNet breathable fabric", trim: true },
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, default: null, min: 0 },
    variants: [
      {
        _id: false,
        size: { type: String, enum: SIZES, required: true },
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
