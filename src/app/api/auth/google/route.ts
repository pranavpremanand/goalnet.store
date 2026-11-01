import { googleCredentialSchema } from "@/lib/validation/auth";
import { apiHandler, readJson } from "@/server/http/handler";
import { setSessionCookie } from "@/server/http/session-cookie";
import * as authService from "@/server/services/auth.service";

export const POST = apiHandler(async (request) => {
  const { credential, acceptTerms } = await readJson(request, googleCredentialSchema);
  const { user, sessionToken, expiresAt } = await authService.signInWithGoogle(credential, request.headers.get("user-agent"), acceptTerms);
  await setSessionCookie(sessionToken, expiresAt);
  return Response.json({ user });
});
