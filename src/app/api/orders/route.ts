import { createOrderSchema } from "@/lib/validation/orders";
import { getCurrentUser } from "@/server/auth/current-user";
import { apiHandler, readJson } from "@/server/http/handler";
import * as orderService from "@/server/services/order.service";

// Guests and signed-in customers share one flow; the order is linked to an account only when a session exists.
export const POST = apiHandler(async (request) => {
  const input = await readJson(request, createOrderSchema);
  const user = await getCurrentUser();
  return Response.json(await orderService.createCheckoutOrder(input, user), { status: 201 });
});
