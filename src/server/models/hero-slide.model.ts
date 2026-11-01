import { Schema, model, models, type Model } from "mongoose";

export interface HeroSlideAttrs {
  tagline: string;
  heading: string;
  highlightedWord: string;
  description: string;
  image: { url: string; fileId: string; alt: string };
  buttons: { label: string; href: string; style: "primary" | "secondary" }[];
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const heroSlideSchema = new Schema<HeroSlideAttrs>(
  {
    tagline: { type: String, required: true, trim: true, maxlength: 80 },
    heading: { type: String, required: true, trim: true, maxlength: 120 },
    highlightedWord: { type: String, default: "", trim: true, maxlength: 40 },
    description: { type: String, required: true, trim: true, maxlength: 240 },
    image: {
      url: { type: String, required: true },
      fileId: { type: String, required: true },
      alt: { type: String, default: "", trim: true, maxlength: 200 },
    },
    buttons: [
      {
        _id: false,
        label: { type: String, required: true, trim: true, maxlength: 24 },
        href: { type: String, required: true, trim: true, maxlength: 300 },
        style: { type: String, enum: ["primary", "secondary"], required: true },
      },
    ],
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0, min: 0, max: 9999 },
  },
  { timestamps: true },
);

heroSlideSchema.index({ isActive: 1, displayOrder: 1 });

export const HeroSlideModel = (models.HeroSlide as Model<HeroSlideAttrs> | undefined) ?? model<HeroSlideAttrs>("HeroSlide", heroSlideSchema);
