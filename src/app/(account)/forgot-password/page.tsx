import { AuthPage } from "@/components/pages/auth/AuthPage";

export const metadata = { title: "Reset password | Play On" };

export default function Page() {
  return <AuthPage mode="forgot-password" />;
}