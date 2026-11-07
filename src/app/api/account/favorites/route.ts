import { apiHandler, readJson } from "@/server/http/handler";
import { requireUser } from "@/server/auth/current-user";
import { NotFoundError } from "@/server/errors";
import { mergeWishlistSchema, wishlistProductSchema } from "@/lib/validation/wishlist";
import { addUserFavorite, listUserFavoriteIds, mergeUserFavorites, removeUserFavorite } from "@/server/repositories/user.repository";
import { listStoreProductsByIds } from "@/server/services/storefront.service";

export const GET = apiHandler(async () => {
  const auth = await requireUser();
  const favoriteIds = await listUserFavoriteIds(auth.id);
  const products = await listStoreProductsByIds(favoriteIds);
  return Response.json({ favorites: favoriteIds, products }, { headers: { "Cache-Control": "private, no-store" } });
});

export const POST = apiHandler(async (request) => {
  const auth = await requireUser();
  const { productId } = await readJson(request, wishlistProductSchema);
  const products = await listStoreProductsByIds([productId]);
  if (!products.some((product) => product.id === productId)) {
    throw new NotFoundError("This product is no longer available.");
  }
  const favorites = await addUserFavorite(auth.id, productId);
  return Response.json({ favorites });
});

export const PUT = apiHandler(async (request) => {
  const auth = await requireUser();
  const { productIds } = await readJson(request, mergeWishlistSchema);
  const activeProducts = await listStoreProductsByIds([...new Set(productIds)]);
  const favorites = await mergeUserFavorites(auth.id, activeProducts.map((product) => product.id));
  return Response.json({ favorites });
});

export const DELETE = apiHandler(async (request) => {
  const auth = await requireUser();
  const { productId } = await readJson(request, wishlistProductSchema);
  const favorites = await removeUserFavorite(auth.id, productId);
  return Response.json({ favorites });
});
