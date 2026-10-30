import { AdminLogin } from "@/components/pages/admin/AdminLogin";
import { GuestOnly } from "@/components/common/RouteGuards";

export const metadata = { title: "Admin sign in | GoalNet" };

export default function Page() {
  return <GuestOnly onlyAdmins to="/admin"><AdminLogin /></GuestOnly>;
}
