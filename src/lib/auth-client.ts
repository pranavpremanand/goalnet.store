import type { SignInInput, SignUpInput } from "@/lib/validation/auth";
import { apiRequest as request } from "@/lib/api-client";
import { signIn as storeSignIn, signOut as storeSignOut } from "@/lib/demo-store";

export type AuthUser = { id: string; name: string; email: string; role: "customer" | "admin" };

export async function signUpUser(input: SignUpInput) {
  const { user } = await request<{ user: AuthUser }>("/api/auth/signup", { method: "POST", body: JSON.stringify(input) });
  storeSignIn(user);
  return user;
}

export async function signInUser(input: SignInInput) {
  const { user } = await request<{ user: AuthUser }>("/api/auth/signin", { method: "POST", body: JSON.stringify(input) });
  storeSignIn(user);
  return user;
}

export async function signInAdmin(input: SignInInput) {
  const { user } = await request<{ user: AuthUser }>("/api/auth/admin/signin", { method: "POST", body: JSON.stringify(input) });
  storeSignIn(user);
  return user;
}

export async function signInWithGoogle(credential: string, acceptTerms = false) {
  const { user } = await request<{ user: AuthUser }>("/api/auth/google", { method: "POST", body: JSON.stringify({ credential, acceptTerms }) });
  storeSignIn(user);
  return user;
}

export async function signOutUser() {
  try {
    await request<void>("/api/auth/signout", { method: "POST" });
  } finally {
    storeSignOut();
  }
}

// Reconciles the locally cached session with the server cookie.
export async function syncSession() {
  try {
    const { user } = await request<{ user: AuthUser | null }>("/api/auth/me");
    if (user) storeSignIn(user);
    else storeSignOut();
  } catch {
    // Offline or server error: keep whatever is cached.
  }
}
