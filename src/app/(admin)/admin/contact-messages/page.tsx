import { requireAdminPage } from "@/server/auth/current-user";
import { listContactMessages } from "@/server/services/contact.service";
import { AdminContactMessages } from "@/components/pages/admin/AdminContactMessages";

export const metadata = { title: "Contact Messages | GoalNet Admin" };

export default async function Page() {
  await requireAdminPage();
  const initialPage = await listContactMessages();
  return <AdminContactMessages initialPage={initialPage} />;
}
