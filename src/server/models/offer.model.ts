import { Schema, model, models, type Model, type Types } from "mongoose";

export type OfferDiscountType = "flat" | "percentage";
export type OfferAppliesTo = "all" | "categories" | "products";

export interface OfferAttrs {
  name: string;
  slug: string;
  discountType: OfferDiscountType;
  discountValue: number;
  appliesTo: OfferAppliesTo;
  categoryIds: Types.ObjectId[];
  productIds: Types.ObjectId[];
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const offerSchema = new Schema<OfferAttrs>(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    discountType: { type: String, enum: ["flat", "percentage"], required: true },
    discountValue: { type: Number, required: true, min: 0 },
    appliesTo: { type: String, enum: ["all", "categories", "products"], required: true },
    categoryIds: { type: [{ type: Schema.Types.ObjectId, ref: "Category" }], default: [] },
    productIds: { type: [{ type: Schema.Types.ObjectId, ref: "Product" }], default: [] },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

offerSchema.index({ isActive:  1, startDate: 1, endDate: 1 });
offerSchema.index({ appliesTo: 1, categoryIds: 1, isActive: 1 });
offerSchema.index({ appliesTo: 1, productIds: 1, isActive: 1 });

export const OfferModel = (models.Offer as Model<OfferAttrs> | undefined) ?? model<OfferAttrs>("Offer", offerSchema);
