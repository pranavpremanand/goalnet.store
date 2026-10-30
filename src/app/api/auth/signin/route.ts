import { signInSchema } from "@/lib/validation/auth";
import { apiHandler, readJson } from "@/server/http/handler";
import { setSessionCookie } from "@/server/http/session-cookie";
import * as authService from "@/server/services/auth.service";

export const POST = apiHandler(async (request) => {
  const input = await readJson(request, signInSchema);
  const { user, sessionToken, expiresAt } = await authService.signIn(input, request.headers.get("user-agent"));
  await setSessionCookie(sessionToken, expiresAt);
  return Response.json({ user });
});
