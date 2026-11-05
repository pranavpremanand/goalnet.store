import { after } from "next/server";
import { orderCancellationSchema } from "@/lib/validation/orders";
import { getCurrentUser } from "@/server/auth/current-user";
import { apiHandler, readJson } from "@/server/http/handler";
import { sendOrderNotification } from "@/server/services/order-email.service";
import * as orderService from "@/server/services/order.service";

export const POST = apiHandler(async (request) => {
  const input = await readJson(request, orderCancellationSchema);
  const user = "orderId" in input ? await getCurrentUser() : null;
  const order = await orderService.cancelOrder(input, user);
  if (order.status === "cancelled") {
    after(async () => {
      await sendOrderNotification(order, "cancelled");
    });
  }
  return Response.json({ order });
});
