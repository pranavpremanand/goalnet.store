import { productSearchSchema } from "@/lib/validation/search";
import { apiHandler } from "@/server/http/handler";
import { searchStoreProducts } from "@/server/services/storefront.service";

export const GET = apiHandler(async (request) => {
  const searchParams = new URL(request.url).searchParams;
  const { q, page } = productSearchSchema.parse({
    q: searchParams.get("q") ?? "",
    page: searchParams.get("page") ?? undefined,
  });
  return Response.json(await searchStoreProducts(q, page));
});
