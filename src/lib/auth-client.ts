import type { SignInInput, SignUpInput } from "@/lib/validation/auth";
import { signIn as storeSignIn, signOut as storeSignOut } from "@/lib/demo-store";

export type AuthUser = { id: string; name: string; email: string; role: "customer" | "admin" };

export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(url, { ...init, headers: { "Content-Type": "application/json", ...init?.headers }, cache: "no-store" });
  } catch {
    throw new ApiError(0, "We couldn’t reach the server. Check your connection and try again.");
  }

  if (response.status === 204) return undefined as T;

  const body = (await response.json().catch(() => null)) as { error?: string; fieldErrors?: Record<string, string[]> } | null;
  if (!response.ok) throw new ApiError(response.status, body?.error ?? "Something went wrong. Please try again.", body?.fieldErrors);
  return body as T;
}

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
