export class ApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly fieldErrors?: Record<string, string[]>,
  ) {
    super(message);
  }
}

export async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
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
