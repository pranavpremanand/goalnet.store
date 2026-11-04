import { orderLookupSchema } from "@/lib/validation/orders";
import { getCurrentUser } from "@/server/auth/current-user";
import { apiHandler, readJson } from "@/server/http/handler";
import * as orderService from "@/server/services/order.service";

export const POST = apiHandler(async (request) => {
  const input = await readJson(request, orderLookupSchema);
  const user = await getCurrentUser();
  return Response.json({ order: await orderService.lookupOrder(input, user) });
});
