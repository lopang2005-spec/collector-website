// Turns a category name into a readable URL segment, for example
// "Watches" becomes "watches" and "Sneakers & Shoes" becomes "sneakers-shoes".
export function slugify(name: string): string {
  const slug = name
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return slug || encodeURIComponent(name.toLowerCase());
}

// Reserved for the All Items button.
export const ALL_SLUG = "all";
