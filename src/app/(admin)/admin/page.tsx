import { AdminDashboard } from "@/components/pages/admin/AdminDashboard";
import { getAdminDashboardData } from "@/server/services/admin-dashboard.service";

export const metadata = { title: "Admin overview | GoalNet" };

export default async function Page() {
  const dashboard = await getAdminDashboardData();
  return <AdminDashboard data={dashboard} />;
}