import { z } from "zod";
import { objectIdSchema } from "@/lib/validation/catalog";
import { requireAdmin } from "@/server/auth/current-user";
import { apiHandler, readJson } from "@/server/http/handler";
import * as heroSlideService from "@/server/services/hero-slide.service";

const reorderSchema = z.object({ ids: z.array(objectIdSchema).max(200) }).strict();

export const PATCH = apiHandler(async (request) => {
  await requireAdmin();
  const { ids } = await readJson(request, reorderSchema);
  await heroSlideService.reorderHeroSlides(ids);
  return Response.json({ success: true });
});
