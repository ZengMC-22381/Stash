export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function ensureUniqueSlug(
  base: string,
  exists: (slug: string) => Promise<boolean>
) {
  let slug = slugify(base)
  if (!slug) {
    slug = "design"
  }
  let candidate = slug
  let counter = 1
  while (await exists(candidate)) {
    candidate = `${slug}-${counter}`
    counter += 1
  }
  return candidate
}
