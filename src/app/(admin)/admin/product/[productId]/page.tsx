import { notFound } from "next/navigation";
import { AdminProductForm } from "@/components/pages/admin/AdminProductForm";
import { objectIdSchema } from "@/lib/validation/catalog";
import { requireAdminPage } from "@/server/auth/current-user";
import { NotFoundError } from "@/server/errors";
import * as categoryService from "@/server/services/category.service";
import * as productService from "@/server/services/product.service";

export const metadata = { title: "Edit product | GoalNet Admin" };

export default async function Page({ params }: { params: Promise<{ productId: string }> }) {
  await requireAdminPage();
  const id = objectIdSchema.safeParse((await params).productId);
  if (!id.success) notFound();

  const [product, categories] = await Promise.all([
    productService.getProduct(id.data).catch((error: unknown) => {
      if (error instanceof NotFoundError) notFound();
      throw error;
    }),
    categoryService.listCategories(),
  ]);
  return <AdminProductForm categories={categories} product={product} />;
}
