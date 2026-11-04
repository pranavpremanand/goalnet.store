import { addCartItemSchema } from "@/lib/validation/cart";
import { getCartIdentity } from "@/server/http/cart-identity";
import { apiHandler, readJson } from "@/server/http/handler";
import * as cartService from "@/server/services/cart.service";

export const GET = apiHandler(async () => {
  const identity = await getCartIdentity();
  return Response.json(await cartService.getCart(identity));
});

export const POST = apiHandler(async (request) => {
  const input = await readJson(request, addCartItemSchema);
  const identity = await getCartIdentity();
  return Response.json(await cartService.addCartItem(identity, input));
});

export const DELETE = apiHandler(async () => {
  const identity = await getCartIdentity();
  return Response.json(await cartService.clearCart(identity));
});
