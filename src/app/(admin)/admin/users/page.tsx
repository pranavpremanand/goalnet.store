import { AdminUsers } from "@/components/pages/admin/AdminTables";
import { requireAdminPage } from "@/server/auth/current-user";
import * as adminUserService from "@/server/services/admin-user.service";

export const metadata = { title: "Users | GoalNet Admin" };

export default async function Page() {
  await requireAdminPage();
  const initialData = await adminUserService.listAdminUsers({ page: 1, limit: 50, q: "" });
  return <AdminUsers initialData={initialData} />;
}