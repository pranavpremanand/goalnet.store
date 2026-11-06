import { apiHandler } from "@/server/http/handler";
import { requireUser } from "@/server/auth/current-user";
import { BadRequestError, UnauthorizedError } from "@/server/errors";
import { findUserById, updateUserProfile } from "@/server/repositories/user.repository";

export const GET = apiHandler(async () => {
  const auth = await requireUser();
  const user = await findUserById(auth.id);
  return Response.json({ user });
});

export const PATCH = apiHandler(async (request) => {
  const auth = await requireUser();
  const body = await request.json().catch(() => null);
  const name = typeof body?.name === "string" ? body.name.trim() : undefined;
  const phone = typeof body?.phone === "string" ? body.phone.trim() : undefined;

  if (name !== undefined && !name) {
    throw new BadRequestError("Name cannot be empty.");
  }

  const updated = await updateUserProfile(auth.id, { name, phone });
  if (!updated) throw new UnauthorizedError("This account is unavailable. Contact support for assistance.");
  return Response.json({ user: updated });
});
