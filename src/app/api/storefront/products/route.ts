import { parseStorefrontProductPageQuery } from "@/lib/validation/storefront";
import { apiHandler } from "@/server/http/handler";
import { listStoreProductPage } from "@/server/services/storefront.service";

export const GET = apiHandler(async (request) => {
  const query = parseStorefrontProductPageQuery(new URL(request.url).searchParams);
  return Response.json(await listStoreProductPage({
    page: query.page,
    query: query.q,
    categories: query.categories,
    teamTypes: query.teamTypes,
    logoTypes: query.logoTypes,
    jerseyTypes: query.jerseyTypes,
    fits: query.fits,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    sort: query.sort,
  }));
});