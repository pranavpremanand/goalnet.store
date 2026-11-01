import { cache } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { ForbiddenError, UnauthorizedError } from "@/server/errors";
import { readSessionCookie } from "@/server/http/session-cookie";
import { getUserFromSessionToken, type AuthUser } from "@/server/services/auth.service";

// Memoized per request, so a layout and its pages share a single database lookup.
export const getCurrentUser = cache(async (): Promise<AuthUser | null> => {
  // Session expiry compares against the current time, so this must never be prerendered.
  await connection();
  return getUserFromSessionToken(await readSessionCookie());
});

// Guards for API routes: signed-in customers or admins only. Guests get 401.
export async function requireUser() {
  const user = await getCurrentUser();
  if (!user) throw new UnauthorizedError();
  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  if (user.role !== "admin") throw new ForbiddenError();
  return user;
}

// Same check for pages: sends non-admins to the admin login instead of returning an error.
export async function requireAdminPage() {
  const user = await getCurrentUser();
  if (user?.role !== "admin") redirect("/admin/login");
  return user;
}
