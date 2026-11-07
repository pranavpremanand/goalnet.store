import { objectIdSchema } from "@/lib/validation/catalog";
import { apiHandler } from "@/server/http/handler";
import { BadRequestError } from "@/server/errors";
import { listStoreProductsByIds } from "@/server/services/storefront.service";
import { z } from "zod";

const productIdsSchema = z.array(objectIdSchema).max(100);

export const GET = apiHandler(async (request) => {
  const ids = new URL(request.url).searchParams.getAll("id");
  if (ids.length > 100) throw new BadRequestError("Request up to 100 products at a time.");
  const productIds = productIdsSchema.parse(ids);
  const products = await listStoreProductsByIds(productIds);
  return Response.json({ products });
});
