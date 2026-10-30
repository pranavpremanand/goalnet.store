import { AdminProducts } from "@/components/pages/admin/AdminProducts";
import { productListQuerySchema } from "@/lib/validation/catalog";
import { requireAdminPage } from "@/server/auth/current-user";
import * as categoryService from "@/server/services/category.service";
import * as productService from "@/server/services/product.service";

export const metadata = { title: "Products | GoalNet Admin" };

export default async function Page({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  await requireAdminPage();
  const raw = await searchParams;
  const parsed = productListQuerySchema.safeParse(Object.fromEntries(Object.entries(raw).map(([key, value]) => [key, Array.isArray(value) ? value[0] : value])));
  const query = parsed.success ? parsed.data : productListQuerySchema.parse({});

  const [result, categories] = await Promise.all([productService.listProducts(query), categoryService.listCategories()]);
  return <AdminProducts categories={categories} filters={{ q: query.q, category: query.category, status: query.status }} result={result} />;
}
