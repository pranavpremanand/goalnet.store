import { apiHandler } from "@/server/http/handler";
import { requireUser } from "@/server/auth/current-user";
import { BadRequestError, UnauthorizedError } from "@/server/errors";
import { hashPassword, verifyPassword } from "@/server/lib/password";
import { getUserWithPasswordById, updateUserPassword } from "@/server/repositories/user.repository";

export const POST = apiHandler(async (request) => {
  const auth = await requireUser();
  const body = await request.json().catch(() => null);

  const currentPassword = typeof body?.currentPassword === "string" ? body.currentPassword : "";
  const newPassword = typeof body?.newPassword === "string" ? body.newPassword : "";

  if (!newPassword || newPassword.length < 8) {
    throw new BadRequestError("New password must be at least 8 characters long.");
  }

  const user = await getUserWithPasswordById(auth.id);
  if (!user) {
    throw new BadRequestError("User not found.");
  }

  // If user already has a password set, require and verify the current password
  if (user.hasPassword && user.passwordHash) {
    if (!currentPassword) {
      throw new BadRequestError("Current password is required.");
    }
    const matches = await verifyPassword(currentPassword, user.passwordHash);
    if (!matches) {
      throw new BadRequestError("Current password is incorrect.");
    }
  }

  const newHash = await hashPassword(newPassword);
  if (!(await updateUserPassword(auth.id, newHash))) {
    throw new UnauthorizedError("This account is unavailable. Contact support for assistance.");
  }

  return Response.json({
    message: user.hasPassword ? "Password changed successfully." : "Password created successfully. You can now also log in using your password.",
  });
});
