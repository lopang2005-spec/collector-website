import { createClient } from "@/lib/supabase-server";
import CategoriesManager from "@/components/CategoriesManager";

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const supabase = createClient();

  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase.from("categories").select("*").order("created_at", { ascending: true }),
    supabase.from("products").select("category"),
  ]);

  const counts = new Map<string, number>();
  for (const p of products ?? []) {
    counts.set(p.category, (counts.get(p.category) ?? 0) + 1);
  }

  const initialCategories = (categories ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    productCount: counts.get(c.name) ?? 0,
  }));

  return (
    <div>
      <h1 className="font-display text-2xl">Categories</h1>
      <p className="mt-2 text-muted">
        Add, rename, or remove the categories products can be tagged with.
        Renaming here updates every product using it automatically. Deleting
        a category that still has products asks you to move them first.
      </p>
      <CategoriesManager initialCategories={initialCategories} />
    </div>
  );
}
