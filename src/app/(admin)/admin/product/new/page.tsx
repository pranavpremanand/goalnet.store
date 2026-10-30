import { AdminProductForm } from "@/components/pages/admin/AdminProductForm";
import { requireAdminPage } from "@/server/auth/current-user";
import * as categoryService from "@/server/services/category.service";

export const metadata = { title: "New product | GoalNet Admin" };

export default async function Page() {
  await requireAdminPage();
  return <AdminProductForm categories={await categoryService.listCategories()} />;
}
