import { verifyPaymentSchema } from "@/lib/validation/orders";
import { apiHandler, readJson } from "@/server/http/handler";
import * as orderService from "@/server/services/order.service";

export const POST = apiHandler(async (request) => {
  const input = await readJson(request, verifyPaymentSchema);
  return Response.json({ order: await orderService.verifyPayment(input) });
});
