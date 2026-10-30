import { categoryInputSchema } from "@/lib/validation/catalog";
import { requireAdmin } from "@/server/auth/current-user";
import { apiHandler, readJson } from "@/server/http/handler";
import * as categoryService from "@/server/services/category.service";

export const GET = apiHandler(async () => {
  await requireAdmin();
  return Response.json({ categories: await categoryService.listCategories() });
});

export const POST = apiHandler(async (request) => {
  await requireAdmin();
  const input = await readJson(request, categoryInputSchema);
  return Response.json({ category: await categoryService.createCategory(input) }, { status: 201 });
});
