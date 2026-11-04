import { productSearchSchema } from "@/lib/validation/search";
import { apiHandler } from "@/server/http/handler";
import { searchStoreProducts } from "@/server/services/storefront.service";

export const GET = apiHandler(async (request) => {
  const { q } = productSearchSchema.parse({
    q: new URL(request.url).searchParams.get("q") ?? "",
  });
  return Response.json({ items: await searchStoreProducts(q) });
});
