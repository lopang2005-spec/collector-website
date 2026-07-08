import { createClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard, { Product } from "@/components/ProductCard";

export const revalidate = 0;

export default async function HomePage() {
  const supabase = createClient();
  const [{ data: products }, { data: categoryRows }] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("categories").select("name").order("created_at", { ascending: true }),
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
        <h1 className="font-display text-4xl">New In</h1>
        <p className="mt-2 text-muted">
          Streetwear, sneakers, accessories & watches.
        </p>

        {list.length === 0 && (
          <p className="mt-10 text-muted">
            No products yet — add some from the admin dashboard.
          </p>
        )}

        {categories.map((category) => (
          <section key={category} className="mt-12">
            <h2 className="font-display text-2xl uppercase tracking-wide text-accent">
              {category}
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
              {list
                .filter((p) => p.category === category)
                .map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
            </div>
          </section>
        ))}
      </main>
      <Footer />
    </>
  );
}
