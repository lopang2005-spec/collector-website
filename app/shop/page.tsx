import { createClient } from "@/lib/supabase-server";
import { getSiteSettings } from "@/lib/settings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CategoryBrowser from "@/components/CategoryBrowser";
import type { Product } from "@/components/ProductCard";

export const revalidate = 0;

export default async function ShopPage() {
  const supabase = createClient();
  const [{ data: products }, { data: categoryRows }, settings] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("categories").select("name").order("created_at", { ascending: true }),
    getSiteSettings(),
  ]);

  const list = (products ?? []) as Product[];

  // Show categories in the order they were created in /admin/categories,
  // and only the ones that actually have a product in them right now.
  const categoryNames = (categoryRows ?? []).map((c) => c.name);
  const usedCategories = new Set(list.map((p) => p.category));
  const categories = categoryNames.filter((c) => usedCategories.has(c));
  // Fall back to any category on a product that (for some reason) isn't
  // in the categories table yet, so nothing silently disappears.
  for (const c of usedCategories) {
    if (!categories.includes(c)) categories.push(c);
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        {list.length === 0 ? (
          <p className="mt-10 text-center text-muted">
            No products yet — add some from the admin dashboard.
          </p>
        ) : (
          <CategoryBrowser
            products={list}
            categories={categories}
            whatsappNumber={settings.whatsapp_number}
          />
        )}
      </main>
      <Footer />
    </>
  );
}
