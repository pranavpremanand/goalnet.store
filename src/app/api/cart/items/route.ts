import { removeCartItemSchema, updateCartItemSchema } from "@/lib/validation/cart";
import { getCartIdentity } from "@/server/http/cart-identity";
import { apiHandler, readJson } from "@/server/http/handler";
import * as cartService from "@/server/services/cart.service";

export const PATCH = apiHandler(async (request) => {
  const input = await readJson(request, updateCartItemSchema);
  const identity = await getCartIdentity();
  return Response.json(await cartService.updateCartItem(identity, input, input.quantity));
});

export const DELETE = apiHandler(async (request) => {
  const input = await readJson(request, removeCartItemSchema);
  const identity = await getCartIdentity();
  return Response.json(await cartService.removeCartItem(identity, input));
});
