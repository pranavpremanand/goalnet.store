// Turns any text into a URL-safe slug, e.g. "Real Madrid — Home 2024/25" -> "real-madrid-home-2024-25".
export function slugify(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
