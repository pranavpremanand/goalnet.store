import { slugify } from "@/lib/slugify";
import { BadRequestError, ConflictError } from "@/server/errors";

type SlugExists = (slug: string) => Promise<boolean>;

// Appends -1, -2, ... until the slug is free.
export async function generateUniqueSlug(value: string, exists: SlugExists) {
  const baseSlug = slugify(value);
  if (!baseSlug) throw new BadRequestError("A valid name is required to generate a slug.", { name: ["Use letters or numbers in the name"] });

  let slug = baseSlug;
  let counter = 1;
  while (await exists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }
  return slug;
}

// A slug typed by the admin is used as-is (and must be free); otherwise one is generated, or the current one kept on edit.
export async function resolveSlug(options: { requested: string; name: string; current?: string; exists: SlugExists }) {
  const requested = options.requested.trim();
  if (requested) {
    const slug = slugify(requested);
    if (!slug) throw new BadRequestError("The slug must contain letters or numbers.", { slug: ["Use letters or numbers in the slug"] });
    if (slug === options.current) return slug;
    if (await options.exists(slug)) throw new ConflictError("This slug is already in use.", { slug: ["This slug is already in use"] });
    return slug;
  }

  return options.current ?? generateUniqueSlug(options.name, options.exists);
}
