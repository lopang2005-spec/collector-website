import { createClient } from "@/lib/supabase-server";
import ProductManager from "@/components/ProductManager";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const supabase = createClient();
  const [{ data: products }, { data: categories }] = await Promise.all([
    supabase.from("products").select("*").order("created_at", { ascending: false }),
    supabase.from("categories").select("name").order("created_at", { ascending: true }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl">Products</h1>
      <ProductManager
        initialProducts={products ?? []}
        categories={(categories ?? []).map((c) => c.name)}
      />
    </div>
  );
}
