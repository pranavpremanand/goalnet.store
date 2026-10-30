import { AuthPage } from "@/components/pages/auth/AuthPage";
import { GuestOnly } from "@/components/common/RouteGuards";

export const metadata = { title: "Reset password | GoalNet" };

export default function Page() {
  return <GuestOnly><AuthPage mode="forgot-password" /></GuestOnly>;
}
