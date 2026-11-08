import { offerInputSchema } from "@/lib/validation/offers";
import { requireAdmin } from "@/server/auth/current-user";
import { apiHandler, readJson } from "@/server/http/handler";
import * as offerService from "@/server/services/offer.service";

export const GET = apiHandler(async () => {
  await requireAdmin();
  return Response.json({ offers: await offerService.listOffers() });
});

export const POST = apiHandler(async (request) => {
  await requireAdmin();
  const input = await readJson(request, offerInputSchema);
  return Response.json({ offer: await offerService.createOffer(input) }, { status: 201 });
});
