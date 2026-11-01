import { AuthPage } from "@/components/pages/auth/AuthPage";
import { GuestOnly } from "@/components/common/RouteGuards";
import { safeRedirectPath } from "@/lib/safe-redirect";
import { getGoogleClientId } from "@/server/config/env";

export const metadata = { title: "Log in | GoalNet" };

async function Login({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  const { next } = await searchParams;
  return <AuthPage googleClientId={getGoogleClientId() ?? ""} mode="login" redirectTo={safeRedirectPath(next, "") || undefined} />;
}

export default function Page({ searchParams }: { searchParams: Promise<{ next?: string | string[] }> }) {
  return <GuestOnly><Login searchParams={searchParams} /></GuestOnly>;
}
