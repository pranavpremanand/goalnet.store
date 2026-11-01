import { heroSlideIdSchema, heroSlideInputSchema } from "@/lib/validation/hero";
import { requireAdmin } from "@/server/auth/current-user";
import { NotFoundError } from "@/server/errors";
import { apiHandler, readJson } from "@/server/http/handler";
import * as heroSlideService from "@/server/services/hero-slide.service";

type Context = { params: Promise<{ id: string }> };

async function readId({ params }: Context) {
  const result = heroSlideIdSchema.safeParse((await params).id);
  if (!result.success) throw new NotFoundError("Hero slide not found.");
  return result.data;
}

export const PUT = apiHandler<Context>(async (request, context) => {
  await requireAdmin();
  const id = await readId(context);
  const input = await readJson(request, heroSlideInputSchema);
  return Response.json({ slide: await heroSlideService.updateHeroSlide(id, input) });
});

export const DELETE = apiHandler<Context>(async (_request, context) => {
  await requireAdmin();
  await heroSlideService.deleteHeroSlide(await readId(context));
  return new Response(null, { status: 204 });
});
