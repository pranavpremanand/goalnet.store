import { apiHandler } from "@/server/http/handler";
import { readSessionCookie } from "@/server/http/session-cookie";
import * as authService from "@/server/services/auth.service";

export const GET = apiHandler(async () => {
  const user = await authService.getUserFromSessionToken(await readSessionCookie());
  return Response.json({ user }, { headers: { "Cache-Control": "no-store" } });
});
