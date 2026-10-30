import { apiHandler } from "@/server/http/handler";
import { clearSessionCookie, readSessionCookie } from "@/server/http/session-cookie";
import * as authService from "@/server/services/auth.service";

export const POST = apiHandler(async () => {
  await authService.signOut(await readSessionCookie());
  await clearSessionCookie();
  return new Response(null, { status: 204 });
});
