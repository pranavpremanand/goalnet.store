import { Schema, model, models, type Model } from "mongoose";

export interface CategoryAttrs {
  name: string;
  slug: string;
  description: string;
  tagline: string;
  coverImage: { url: string; fileId: string; alt: string };
  isActive: boolean;
  displayOrder: number;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<CategoryAttrs>(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    description: { type: String, default: "", trim: true, maxlength: 500 },
    // Short line shown above the category name on the storefront, e.g. "From the archive".
    tagline: { type: String, default: "", trim: true, maxlength: 80 },
    coverImage: {
      url: { type: String, required: true },
      // ImageKit file id, kept so the file can be deleted when the image is replaced.
      fileId: { type: String, required: true },
      alt: { type: String, default: "" },
    },
    isActive: { type: Boolean, default: true },
    displayOrder: { type: Number, default: 0 },
  },
  { timestamps: true },
);

categorySchema.index({ isActive: 1, displayOrder: 1 });

export const CategoryModel = (models.Category as Model<CategoryAttrs> | undefined) ?? model<CategoryAttrs>("Category", categorySchema);
