import { z } from "zod";
import { objectIdSchema } from "@/lib/validation/catalog";

const uniqueIds = (label: string) =>
  z.array(objectIdSchema).max(500).refine((ids) => new Set(ids).size === ids.length, `Each ${label} can only be selected once`);

export const offerInputSchema = z
  .object({
    name: z.string().trim().min(2, "Enter an offer name").max(120, "Offer name must be 120 characters or fewer"),
    slug: z.string().trim().max(120).optional().default(""),
    discountType: z.enum(["flat", "percentage"]),
    discountValue: z.number({ error: "Enter a discount value" }).positive("Discount must be greater than 0").max(1_000_000, "Discount is too high"),
    appliesTo: z.enum(["all", "categories", "products"]),
    categoryIds: uniqueIds("categories"),
    productIds: uniqueIds("products"),
    startDate: z.iso.datetime({ offset: true, error: "Enter a valid start date and time" }),
    endDate: z.iso.datetime({ offset: true, error: "Enter a valid end date and time" }),
    isActive: z.boolean(),
  })
  .superRefine((offer, context) => {
    if (offer.discountType === "percentage" && offer.discountValue > 100) {
      context.addIssue({ code: "custom", path: ["discountValue"], message: "Percentage discounts cannot exceed 100%" });
    }
    if (new Date(offer.endDate) <= new Date(offer.startDate)) {
      context.addIssue({ code: "custom", path: ["endDate"], message: "End date must be after the start date" });
    }
    if (offer.appliesTo === "categories" && offer.categoryIds.length === 0) {
      context.addIssue({ code: "custom", path: ["categoryIds"], message: "Select at least one collection or category" });
    }
    if (offer.appliesTo === "products" && offer.productIds.length === 0) {
      context.addIssue({ code: "custom", path: ["productIds"], message: "Select at least one product" });
    }
  });

export type OfferInput = z.infer<typeof offerInputSchema>;
