import { Suspense, type ReactNode } from "react";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/server/auth/current-user";

// Verified on the server against the session store; the proxy only does a cheap cookie check first.

function GateFallback() {
  return <div aria-busy="true" className="grid min-h-[50vh] place-items-center text-sm text-muted">Loading…</div>;
}

async function UserGate({ children }: { children: ReactNode }) {
  if (!(await getCurrentUser())) redirect("/login");
  return children;
}

async function AdminGate({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/admin/login");
  return children;
}

async function GuestGate({ children, to, onlyAdmins }: { children: ReactNode; to: string; onlyAdmins: boolean }) {
  const user = await getCurrentUser();
  if (user && (!onlyAdmins || user.role === "admin")) redirect(to);
  return children;
}

// Account area: any signed-in customer. Guests are sent to log in.
export function RequireUser({ children }: { children: ReactNode }) {
  return <Suspense fallback={<GateFallback />}><UserGate>{children}</UserGate></Suspense>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  return <Suspense fallback={<GateFallback />}><AdminGate>{children}</AdminGate></Suspense>;
}

// Login and signup: already signed-in users are sent on to their account instead.
export function GuestOnly({ children, to = "/dashboard/dashboard", onlyAdmins = false }: { children: ReactNode; to?: string; onlyAdmins?: boolean }) {
  return <Suspense fallback={<GateFallback />}><GuestGate onlyAdmins={onlyAdmins} to={to}>{children}</GuestGate></Suspense>;
}
