import { signUpSchema } from "@/lib/validation/auth";
import { apiHandler, readJson } from "@/server/http/handler";
import { setSessionCookie } from "@/server/http/session-cookie";
import * as authService from "@/server/services/auth.service";

export const POST = apiHandler(async (request) => {
  const input = await readJson(request, signUpSchema);
  const { user, sessionToken, expiresAt } = await authService.signUp(input, request.headers.get("user-agent"));
  await setSessionCookie(sessionToken, expiresAt);
  return Response.json({ user }, { status: 201 });
});
