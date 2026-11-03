import { requireAdminPage } from "@/server/auth/current-user";
import { adminListTickets } from "@/server/services/ticket.service";
import { AdminTickets } from "@/components/pages/admin/AdminTickets";

export const metadata = { title: "Support Tickets | GoalNet Admin" };

export default async function Page() {
  await requireAdminPage();
  const initialTickets = await adminListTickets();
  return <AdminTickets initialTickets={initialTickets} />;
}

