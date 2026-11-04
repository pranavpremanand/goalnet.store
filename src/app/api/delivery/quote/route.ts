import { deliveryQuoteSchema } from "@/lib/validation/delivery";
import { apiHandler, readJson } from "@/server/http/handler";
import { getDeliveryQuote } from "@/server/services/delivery.service";

export const POST = apiHandler(async (request) => {
  const input = await readJson(request, deliveryQuoteSchema);
  return Response.json(await getDeliveryQuote(input.pincode, input.quantity));
});
