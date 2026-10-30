import { AdminCategories } from "@/components/pages/admin/AdminCategories";
import { requireAdminPage } from "@/server/auth/current-user";
import * as categoryService from "@/server/services/category.service";

export const metadata = { title: "Categories | GoalNet Admin" };

export default async function Page() {
  await requireAdminPage();
  return <AdminCategories categories={await categoryService.listCategories()} />;
}
