import { z } from "zod";
import { JERSEY_TYPES, TEAM_TYPES } from "@/lib/catalog-constants";

const priceSchema = z.coerce.number().finite().min(0).optional();

export const storefrontProductPageQuerySchema = z.object({
  page: z.coerce.number().int().min(1).max(100_000).default(1),
  q: z.string().trim().max(80).default(""),
  categories: z.array(z.string().trim().min(1).max(80)).max(30).default([]),
  teamTypes: z.array(z.enum(TEAM_TYPES)).max(2).default([]),
  jerseyTypes: z.array(z.enum(JERSEY_TYPES)).max(3).default([]),
  minPrice: priceSchema,
  maxPrice: priceSchema,
  sort: z.enum(["featured", "low", "high"]).default("featured"),
}).refine(
  ({ minPrice, maxPrice }) => minPrice === undefined || maxPrice === undefined || minPrice <= maxPrice,
  { message: "Minimum price must not exceed maximum price.", path: ["minPrice"] },
);

export type StorefrontProductPageQuery = z.infer<typeof storefrontProductPageQuerySchema>;

export function parseStorefrontProductPageQuery(params: URLSearchParams) {
  const categories = params.getAll("category").flatMap((value) => value.split(",")).filter(Boolean);

  return storefrontProductPageQuerySchema.parse({
    page: params.get("page") ?? undefined,
    q: params.get("q") ?? undefined,
    categories,
    teamTypes: params.getAll("teamType"),
    jerseyTypes: params.getAll("jerseyType"),
    minPrice: params.get("minPrice") ?? undefined,
    maxPrice: params.get("maxPrice") ?? undefined,
    sort: params.get("sort") ?? undefined,
  });
}