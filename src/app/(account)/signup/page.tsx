import { AuthPage } from "@/components/pages/auth/AuthPage";

export const metadata = { title: "Create account | GoalNet" };

export default function Page() {
  return <AuthPage mode="signup" />;
}