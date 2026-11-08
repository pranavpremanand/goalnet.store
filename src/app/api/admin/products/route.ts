import { productInputSchema, productListQuerySchema } from "@/lib/validation/catalog";
import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/server/auth/current-user";
import { apiHandler, readJson } from "@/server/http/handler";
import * as productService from "@/server/services/product.service";

export const GET = apiHandler(async (request) => {
  await requireAdmin();
  const query = productListQuerySchema.parse(Object.fromEntries(new URL(request.url).searchParams));
  return Response.json(await productService.listProducts(query));
});

export const POST = apiHandler(async (request) => {
  await requireAdmin();
  const input = await readJson(request, productInputSchema);
  const product = await productService.createProduct(input);
  revalidatePath("/admin/products");
  revalidatePath("/admin/categories");
  return Response.json({ product }, { status: 201 });
});
