import { ConflictError, UnauthorizedError } from "@/server/errors";
import { SESSION_TTL_MS } from "@/server/config/session";
import type { UserRole } from "@/server/models/user.model";
import { hashPassword, verifyPassword } from "@/server/lib/password";
import { generateSessionToken, hashSessionToken } from "@/server/lib/token";
import { createSession, deleteSession, findActiveSessionUserId } from "@/server/repositories/session.repository";
import { createUser, findUserById, findUserByEmailWithPassword, isDuplicateKeyError, userEmailExists, type UserRecord } from "@/server/repositories/user.repository";
import type { SignInInput, SignUpInput } from "@/lib/validation/auth";

const EMAIL_TAKEN = "An account with this email already exists. Try signing in instead.";

export type AuthUser = Pick<UserRecord, "id" | "name" | "email" | "role">;
export type AuthResult = { user: AuthUser; sessionToken: string; expiresAt: Date };

// Compared against when the email is unknown so response time does not reveal which emails exist.
let decoyHash: Promise<string> | undefined;

async function startSession(user: UserRecord, userAgent?: string | null): Promise<AuthResult> {
  const sessionToken = generateSessionToken();
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS);
  await createSession({ userId: user.id, tokenHash: hashSessionToken(sessionToken), expiresAt, userAgent: userAgent?.slice(0, 300) });
  return { user: { id: user.id, name: user.name, email: user.email, role: user.role }, sessionToken, expiresAt };
}

export async function signUp(input: Pick<SignUpInput, "name" | "email" | "password">, userAgent?: string | null) {
  if (await userEmailExists(input.email)) throw new ConflictError(EMAIL_TAKEN, { email: [EMAIL_TAKEN] });

  const passwordHash = await hashPassword(input.password);
  try {
    const user = await createUser({ name: input.name, email: input.email, passwordHash });
    return await startSession(user, userAgent);
  } catch (error) {
    // Two simultaneous sign-ups can both pass the check above; the unique index decides.
    if (isDuplicateKeyError(error)) throw new ConflictError(EMAIL_TAKEN, { email: [EMAIL_TAKEN] });
    throw error;
  }
}

export async function signIn(input: SignInInput, userAgent?: string | null, options: { role?: UserRole } = {}) {
  const user = await findUserByEmailWithPassword(input.email);
  decoyHash ??= hashPassword("goalnet-decoy-password");
  const passwordMatches = await verifyPassword(input.password, user?.passwordHash ?? (await decoyHash));

  // A wrong role gets the same answer as a wrong password, so admin accounts are not revealed.
  if (!user || !passwordMatches || (options.role && user.role !== options.role)) throw new UnauthorizedError("Invalid email or password.");
  return startSession(user, userAgent);
}

export async function signOut(sessionToken: string | undefined) {
  if (sessionToken) await deleteSession(hashSessionToken(sessionToken));
}

export async function getUserFromSessionToken(sessionToken: string | undefined): Promise<AuthUser | null> {
  if (!sessionToken) return null;
  const userId = await findActiveSessionUserId(hashSessionToken(sessionToken));
  const user = userId ? await findUserById(userId) : null;
  return user ? { id: user.id, name: user.name, email: user.email, role: user.role } : null;
}
