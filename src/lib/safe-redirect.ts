// Only same-site relative paths are accepted, so a crafted ?next= cannot send people to another site.
export function safeRedirectPath(value: string | string[] | undefined, fallback: string) {
  const path = Array.isArray(value) ? value[0] : value;
  if (!path || !path.startsWith("/") || path.startsWith("//") || path.startsWith("/\\")) return fallback;
  if (/[\u0000-\u001f]/.test(path)) return fallback;
  return path;
}
