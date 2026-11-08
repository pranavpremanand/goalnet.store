import { objectIdSchema } from "@/lib/validation/catalog";
import { offerInputSchema } from "@/lib/validation/offers";
import { requireAdmin } from "@/server/auth/current-user";
import { NotFoundError } from "@/server/errors";
import { apiHandler, readJson } from "@/server/http/handler";
import * as offerService from "@/server/services/offer.service";

type Context = { params: Promise<{ id: string }> };

async function readId({ params }: Context) {
  const parsed = objectIdSchema.safeParse((await params).id);
  if (!parsed.success) throw new NotFoundError("Offer not found.");
  return parsed.data;
}

export const PUT = apiHandler<Context>(async (request, context) => {
  await requireAdmin();
  const input = await readJson(request, offerInputSchema);
  return Response.json({ offer: await offerService.updateOffer(await readId(context), input) });
});

export const DELETE = apiHandler<Context>(async (_request, context) => {
  await requireAdmin();
  await offerService.deleteOffer(await readId(context));
  return new Response(null, { status: 204 });
});
