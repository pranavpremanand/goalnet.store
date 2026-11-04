import { orderCancellationSchema } from "@/lib/validation/orders";
import { getCurrentUser } from "@/server/auth/current-user";
import { apiHandler, readJson } from "@/server/http/handler";
import * as orderService from "@/server/services/order.service";

export const POST = apiHandler(async (request) => {
  const input = await readJson(request, orderCancellationSchema);
  const user = "orderId" in input ? await getCurrentUser() : null;
  return Response.json({ order: await orderService.cancelOrder(input, user) });
});
