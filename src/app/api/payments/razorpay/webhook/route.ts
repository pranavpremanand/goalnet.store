import { apiHandler } from "@/server/http/handler";
import * as orderService from "@/server/services/order.service";

// Razorpay signs the exact raw body, so it must be read as text before any parsing.
export const POST = apiHandler(async (request) => {
  const rawBody = await request.text();
  await orderService.handleWebhook(rawBody, request.headers.get("x-razorpay-signature"));
  return Response.json({ received: true });
});
