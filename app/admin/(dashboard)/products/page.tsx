import { createClient } from "@/lib/supabase-server";
import ProductManager from "@/components/ProductManager";

export const revalidate = 0;

export default async function AdminProductsPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl">Products</h1>
      <ProductManager initialProducts={products ?? []} />
    </div>
  );
}
