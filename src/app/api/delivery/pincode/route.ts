import { pincodeSchema } from "@/lib/validation/delivery";
import { apiHandler } from "@/server/http/handler";
import { checkPincode } from "@/server/services/delivery.service";

export const GET = apiHandler(async (request) => {
  const pincode = pincodeSchema.parse(new URL(request.url).searchParams.get("pincode") ?? "");
  return Response.json(await checkPincode(pincode));
});
