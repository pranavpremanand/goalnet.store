import { z } from "zod";
import { AVAILABILITY_STATUSES, JERSEY_TYPES, LOGO_TYPES, MAX_PRODUCT_IMAGES, PRODUCT_TYPES, SIZE_OPTIONS, SIZE_SYSTEMS, TEAM_TYPES, isTeamBased } from "@/lib/catalog-constants";

// Shared by the admin forms and the API so both enforce the same rules.

export const objectIdSchema = z.string().regex(/^[a-f\d]{24}$/i, "Invalid id");

const text = (label: string, max: number) => z.string().trim().max(max, `${label} must be ${max} characters or fewer`);
const wholeNumber = (label: string, min: number, max: number) =>
  z.number({ error: `Enter a number for ${label}` }).int(`${label} must be a whole number`).min(min, `${label} must be at least ${min}`).max(max, `${label} must be at most ${max}`);

export const imageSchema = z.object(
  {
    url: z.url("Image URL is invalid"),
    fileId: z.string().min(1, "Image is missing its file id"),
    alt: text("Alt text", 200),
  },
  { error: "Please upload an image" },
);

// Leave the slug blank to generate one from the name.
const slugField = text("Slug", 120);

export const categoryInputSchema = z.object({
  name: z.string().trim().min(2, "Enter a category name").max(80, "Name must be 80 characters or fewer"),
  slug: slugField,
  description: text("Description", 500),
  tagline: text("Tagline", 80),
  coverImage: imageSchema,
  isActive: z.boolean(),
  displayOrder: wholeNumber("Display order", 0, 9999),
});

export const productInputSchema = z
  .object({
    name: z.string().trim().min(2, "Enter a product name").max(200, "Name must be 200 characters or fewer"),
    slug: slugField,
    description: text("Description", 5000),
    productType: z.enum(PRODUCT_TYPES, { error: "Select a product type" }),
    brand: text("Brand", 80),
    team: z.object({
      name: text("Team name", 100),
      type: z.enum(TEAM_TYPES, { error: "Select club or national" }).nullable(),
    }),
    season: text("Season", 20),
    player: z.object({
      name: text("Player name", 80),
      number: wholeNumber("Player number", 0, 99).nullable(),
    }),
    jerseyType: z.enum(JERSEY_TYPES, { error: "Select a jersey type" }).nullable(),
    logoType: z.enum(LOGO_TYPES, { error: "Select a logo type" }),
    fabric: text("Material", 120),
    price: z.number({ error: "Enter a price" }).positive("Price must be greater than 0").max(1_000_000, "Price is too high"),
    compareAtPrice: z.number({ error: "Enter a valid price" }).positive("Price must be greater than 0").max(1_000_000, "Price is too high").nullable(),
    sizeSystem: z.enum(SIZE_SYSTEMS, { error: "Select a size type" }),
    variants: z
      .array(z.object({ size: z.string().trim().min(1).max(20), availabilityStatus: z.enum(AVAILABILITY_STATUSES) }))
      .min(1, "Select at least one size")
      .refine((variants) => new Set(variants.map((variant) => variant.size)).size === variants.length, "Each size can only be added once"),
    images: z.array(imageSchema).min(1, "Upload at least one product image").max(MAX_PRODUCT_IMAGES, `You can add up to ${MAX_PRODUCT_IMAGES} images`),
    category: z.string().regex(/^[a-f\d]{24}$/i, "Select a category"),
    isActive: z.boolean(),
    isFeatured: z.boolean(),
    displayOrder: wholeNumber("Display order", 0, 9999),
    seo: z.object({
      title: text("SEO title", 70),
      description: text("SEO description", 160),
    }),
  })
  .refine((product) => product.compareAtPrice === null || product.compareAtPrice > product.price, {
    path: ["compareAtPrice"],
    message: "Compare-at price must be higher than the selling price",
  })
  .superRefine((product, context) => {
    if (isTeamBased(product.productType)) {
      if (!product.team.name) context.addIssue({ code: "custom", path: ["team", "name"], message: "Enter the team name" });
      if (!product.team.type) context.addIssue({ code: "custom", path: ["team", "type"], message: "Select club or national" });
    }
    if (product.productType === "jersey" && !product.jerseyType) context.addIssue({ code: "custom", path: ["jerseyType"], message: "Select a jersey type" });

    const allowed = SIZE_OPTIONS[product.sizeSystem];
    if (product.variants.some((variant) => !allowed.includes(variant.size))) {
      context.addIssue({ code: "custom", path: ["variants"], message: "Sizes must match the selected size type" });
    }
  });

export const productListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  q: z.string().trim().max(100).default(""),
  category: z.union([objectIdSchema, z.literal("")]).default(""),
  status: z.enum(["all", "active", "inactive"]).default("all"),
});

export const uploadTargetSchema = z.object({ target: z.enum(["category", "product", "hero"]) });
export const discardUploadsSchema = z.object({ fileIds: z.array(z.string().min(1).max(100)).min(1).max(20) });

// Deleting a category that still has products requires choosing what happens to them.
export const categoryDeleteSchema = z
  .object({
    productAction: z.enum(["reassign", "delete"]).optional(),
    targetCategoryId: objectIdSchema.optional(),
  })
  .superRefine((value, context) => {
    if (value.productAction === "reassign" && !value.targetCategoryId) {
      context.addIssue({ code: "custom", path: ["targetCategoryId"], message: "Choose the category to move the products to" });
    }
  });

export type CategoryInput = z.infer<typeof categoryInputSchema>;
export type CategoryDeleteOptions = z.infer<typeof categoryDeleteSchema>;
export type ProductInput = z.infer<typeof productInputSchema>;
export type ProductListQuery = z.infer<typeof productListQuerySchema>;
export type UploadTarget = z.infer<typeof uploadTargetSchema>["target"];
