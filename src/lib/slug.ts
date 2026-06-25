/**
 * Slug utilities for store landing-page URLs.
 * Slugs must be URL-safe, lowercase, and unique per platform.
 */

/** Convert an arbitrary string into a URL-safe slug fragment. */
export function slugify(input: string): string {
  return input
    .toString()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
    .replace(/[\s_-]+/g, "-") // collapse separators
    .replace(/^-+|-+$/g, ""); // trim hyphens
}

/**
 * Build a candidate slug from a store name, optionally prefixed by a
 * city/region for readability (e.g. "hyderabad-banjara-hills").
 */
export function buildSlug(parts: Array<string | null | undefined>): string {
  const slug = parts
    .filter((p): p is string => Boolean(p && p.trim()))
    .map(slugify)
    .filter(Boolean)
    .join("-");
  return slug || "store";
}

/**
 * Ensure uniqueness against a set of already-used slugs by appending an
 * incrementing numeric suffix when needed.
 */
export function ensureUniqueSlug(base: string, used: Set<string>): string {
  let candidate = base;
  let n = 2;
  while (used.has(candidate)) {
    candidate = `${base}-${n}`;
    n += 1;
  }
  used.add(candidate);
  return candidate;
}
