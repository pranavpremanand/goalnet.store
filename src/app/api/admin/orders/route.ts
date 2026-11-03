import { orderListQuerySchema } from "@/lib/validation/orders";
import { requireAdmin } from "@/server/auth/current-user";
import { apiHandler } from "@/server/http/handler";
import * as orderService from "@/server/services/order.service";

export const GET = apiHandler(async (request) => {
  await requireAdmin();
  const query = orderListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
  return Response.json(await orderService.listAdminOrders(query));
});
