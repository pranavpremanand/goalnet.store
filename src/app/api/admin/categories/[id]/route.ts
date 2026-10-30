import { categoryInputSchema, objectIdSchema } from "@/lib/validation/catalog";
import { requireAdmin } from "@/server/auth/current-user";
import { NotFoundError } from "@/server/errors";
import { apiHandler, readJson } from "@/server/http/handler";
import * as categoryService from "@/server/services/category.service";

type Context = { params: Promise<{ id: string }> };

async function readId({ params }: Context) {
  const parsed = objectIdSchema.safeParse((await params).id);
  if (!parsed.success) throw new NotFoundError("Category not found.");
  return parsed.data;
}

export const GET = apiHandler<Context>(async (_request, context) => {
  await requireAdmin();
  return Response.json({ category: await categoryService.getCategory(await readId(context)) });
});

export const PUT = apiHandler<Context>(async (request, context) => {
  await requireAdmin();
  const id = await readId(context);
  const input = await readJson(request, categoryInputSchema);
  return Response.json({ category: await categoryService.updateCategory(id, input) });
});

export const DELETE = apiHandler<Context>(async (_request, context) => {
  await requireAdmin();
  await categoryService.deleteCategory(await readId(context));
  return new Response(null, { status: 204 });
});
