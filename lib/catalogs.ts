import type { createClient } from "@/lib/supabase-server";
import { ALL_SLUG, slugify } from "@/lib/slug";

type Supabase = ReturnType<typeof createClient>;

export type CatalogEntry = {
  id: string | null;
  slug: string;
  category: string | null;
  name: string;
  display_name: string | null;
  image_url: string | null;
  image_path: string | null;
  sort_order: number;
  visible: boolean;
  count: number;
  is_all: boolean;
};

type TileRow = {
  id: string;
  category: string | null;
  is_all: boolean;
  display_name: string | null;
  image_url: string | null;
  image_path: string | null;
  sort_order: number;
  visible: boolean;
};

/**
 * Builds the full list of catalogs: All Items first, then one entry per
 * category. Categories are read from the categories table, so a new
 * category shows up here even before it has a catalog_tiles row.
 *
 * Counts only include visible products for the current visitor: student
 * products for an unlocked student, working class products for everyone else.
 */
export async function loadCatalogs(
  supabase: Supabase,
  studentUnlocked: boolean
): Promise<CatalogEntry[]> {
  const [{ data: categoryRows }, { data: tileRows }, { data: productRows }] =
    await Promise.all([
      supabase
        .from("categories")
        .select("name, created_at")
        .order("created_at", { ascending: true }),
      supabase.from("catalog_tiles").select("*"),
      supabase
        .from("products")
        .select("category")
        .eq("hidden", false)
        .eq("student_only", studentUnlocked),
    ]);

  const tiles = (tileRows ?? []) as TileRow[];
  const allTile = tiles.find((t) => t.is_all) ?? null;
  const tileByCategory = new Map<string, TileRow>();
  for (const t of tiles) {
    if (t.category) tileByCategory.set(t.category, t);
  }

  const counts = new Map<string, number>();
  let total = 0;
  for (const p of productRows ?? []) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
    total += 1;
  }

  const all: CatalogEntry = {
    id: allTile?.id ?? null,
    slug: ALL_SLUG,
    category: null,
    name: allTile?.display_name?.trim() || "All Items",
    display_name: allTile?.display_name ?? null,
    image_url: allTile?.image_url ?? null,
    image_path: allTile?.image_path ?? null,
    sort_order: -1,
    visible: true,
    count: total,
    is_all: true,
  };

  const categories: CatalogEntry[] = (categoryRows ?? []).map((c, index) => {
    const tile = tileByCategory.get(c.name);
    return {
      id: tile?.id ?? null,
      slug: slugify(c.name),
      category: c.name,
      name: tile?.display_name?.trim() || c.name,
      display_name: tile?.display_name ?? null,
      image_url: tile?.image_url ?? null,
      image_path: tile?.image_path ?? null,
      // Categories without a row yet go after the ones that have one.
      sort_order: tile?.sort_order ?? 100000 + index,
      visible: tile?.visible ?? true,
      count: counts.get(c.name) ?? 0,
      is_all: false,
    };
  });

  categories.sort(
    (a, b) => a.sort_order - b.sort_order || a.name.localeCompare(b.name)
  );

  return [all, ...categories];
}

/** The buttons a customer sees: All Items, plus visible categories that
 *  have at least one item for the visitor. */
export function publicCatalogs(entries: CatalogEntry[]): CatalogEntry[] {
  return entries.filter((c) => c.is_all || (c.visible && c.count > 0));
}
