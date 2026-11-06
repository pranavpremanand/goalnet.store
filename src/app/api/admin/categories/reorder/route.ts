import { z } from "zod";
import { objectIdSchema } from "@/lib/validation/catalog";
import { requireAdmin } from "@/server/auth/current-user";
import { apiHandler, readJson } from "@/server/http/handler";
import * as categoryService from "@/server/services/category.service";

const reorderSchema = z.object({ ids: z.array(objectIdSchema).max(200) }).strict();

export const PATCH = apiHandler(async (request) => {
  await requireAdmin();
  const { ids } = await readJson(request, reorderSchema);
  await categoryService.reorderCategories(ids);
  return Response.json({ success: true });
});
