import { apiHandler } from "@/server/http/handler";
import { requireUser } from "@/server/auth/current-user";
import { BadRequestError } from "@/server/errors";
import { findUserById, toggleUserFavorite } from "@/server/repositories/user.repository";
import { listStoreProductsByIds } from "@/server/services/storefront.service";

export const GET = apiHandler(async () => {
  const auth = await requireUser();
  const user = await findUserById(auth.id);
  const favoriteIds = user?.favorites ?? [];
  const products = await listStoreProductsByIds(favoriteIds);
  return Response.json({ favorites: favoriteIds, products });
});

export const POST = apiHandler(async (request) => {
  const auth = await requireUser();
  const body = await request.json().catch(() => null);
  const productId = typeof body?.productId === "string" ? body.productId.trim() : "";

  if (!productId) throw new BadRequestError("Product ID is required.");

  const favorites = await toggleUserFavorite(auth.id, productId);
  return Response.json({ favorites });
});

