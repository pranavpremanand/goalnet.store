import { AuthPage } from "@/components/pages/auth/AuthPage";

export const metadata = { title: "Log in | GoalNet" };

export default function Page() {
  return <AuthPage mode="login" />;
}