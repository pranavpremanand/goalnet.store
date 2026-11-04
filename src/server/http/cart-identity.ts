import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { CART_COOKIE_NAME, CART_TTL_MS } from "@/lib/cart-constants";
import { isProduction } from "@/server/config/env";
import { getCurrentUser } from "@/server/auth/current-user";
import { hashSessionToken } from "@/server/lib/token";

export async function getCartIdentity() {
  const [user, cookieStore] = await Promise.all([getCurrentUser(), cookies()]);
  let guestToken = cookieStore.get(CART_COOKIE_NAME)?.value;

  if (!guestToken) {
    guestToken = randomBytes(32).toString("base64url");
    cookieStore.set(CART_COOKIE_NAME, guestToken, {
      httpOnly: true,
      sameSite: "lax",
      secure: isProduction,
      path: "/",
      maxAge: Math.floor(CART_TTL_MS / 1000),
    });
  }

  return {
    userId: user?.id,
    guestTokenHash: hashSessionToken(guestToken),
  };
}
