import { AuthPage } from "@/components/pages/auth/AuthPage";
import { GuestOnly } from "@/components/common/RouteGuards";
import { safeRedirectPath } from "@/lib/safe-redirect";

export const metadata = { title: "Create account | GoalNet" };

async function SignUp({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const { next } = await searchParams;
  return <AuthPage mode="signup" redirectTo={safeRedirectPath(next, "") || undefined} />;
}

export default function Page({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  return <GuestOnly><SignUp searchParams={searchParams} /></GuestOnly>;
}
