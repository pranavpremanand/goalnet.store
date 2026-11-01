import { heroSlideInputSchema } from "@/lib/validation/hero";
import { requireAdmin } from "@/server/auth/current-user";
import { apiHandler, readJson } from "@/server/http/handler";
import * as heroSlideService from "@/server/services/hero-slide.service";

export const GET = apiHandler(async () => {
  await requireAdmin();
  return Response.json({ slides: await heroSlideService.listHeroSlides() });
});

export const POST = apiHandler(async (request) => {
  await requireAdmin();
  const input = await readJson(request, heroSlideInputSchema);
  return Response.json({ slide: await heroSlideService.createHeroSlide(input) }, { status: 201 });
});
