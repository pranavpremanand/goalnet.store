import { cookies } from "next/headers";
import { isProduction } from "@/server/config/env";
import { SESSION_COOKIE_NAME as SESSION_COOKIE } from "@/server/config/session";

export async function setSessionCookie(token: string, expiresAt: Date) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: isProduction,
    path: "/",
    expires: expiresAt,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function readSessionCookie() {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}
