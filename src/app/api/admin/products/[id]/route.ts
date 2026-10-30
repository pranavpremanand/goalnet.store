import { objectIdSchema, productInputSchema } from "@/lib/validation/catalog";
import { requireAdmin } from "@/server/auth/current-user";
import { NotFoundError } from "@/server/errors";
import { apiHandler, readJson } from "@/server/http/handler";
import * as productService from "@/server/services/product.service";

type Context = { params: Promise<{ id: string }> };

async function readId({ params }: Context) {
  const parsed = objectIdSchema.safeParse((await params).id);
  if (!parsed.success) throw new NotFoundError("Product not found.");
  return parsed.data;
}

export const GET = apiHandler<Context>(async (_request, context) => {
  await requireAdmin();
  return Response.json({ product: await productService.getProduct(await readId(context)) });
});

export const PUT = apiHandler<Context>(async (request, context) => {
  await requireAdmin();
  const id = await readId(context);
  const input = await readJson(request, productInputSchema);
  return Response.json({ product: await productService.updateProduct(id, input) });
});

export const DELETE = apiHandler<Context>(async (_request, context) => {
  await requireAdmin();
  await productService.deleteProduct(await readId(context));
  return new Response(null, { status: 204 });
});
