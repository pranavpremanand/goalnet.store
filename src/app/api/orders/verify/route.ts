import { after } from "next/server";
import { verifyPaymentSchema } from "@/lib/validation/orders";
import { apiHandler, readJson } from "@/server/http/handler";
import { sendOrderNotification } from "@/server/services/order-email.service";
import * as orderService from "@/server/services/order.service";

export const POST = apiHandler(async (request) => {
  const input = await readJson(request, verifyPaymentSchema);
  const order = await orderService.verifyPayment(input);
  if (order.paymentStatus === "paid") {
    after(async () => {
      await sendOrderNotification(order, "created");
    });
  }
  return Response.json({ order });
});
