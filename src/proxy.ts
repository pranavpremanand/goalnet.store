import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE_NAME } from "@/server/config/session";

// Fast first gate: signed-out visitors never reach protected pages. The cookie is only checked for
// presence here; the layouts verify it against the session store (see RouteGuards).
export function proxy(request: NextRequest) {
  if (request.cookies.has(SESSION_COOKIE_NAME)) return NextResponse.next();

  const { pathname, search } = request.nextUrl;
  if (pathname.startsWith("/admin")) return NextResponse.redirect(new URL("/admin/login", request.url));

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", `${pathname}${search}`);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/dashboard/:path*", "/admin", "/admin/((?!login$).*)"],
};
