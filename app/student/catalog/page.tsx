import { createClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard, { Product } from "@/components/ProductCard";
import SignOutButton from "@/components/SignOutButton";

export const revalidate = 0;

export default async function StudentCatalogPage() {
  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("student_only", true)
    .order("created_at", { ascending: false });

  const list = (products ?? []) as Product[];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-4xl">Student Exclusive</h1>
            <p className="mt-2 text-muted">
              Discounted picks, only visible to verified students.
            </p>
          </div>
          <SignOutButton redirectTo="/" label="Not you? Sign out" />
        </div>

        {list.length === 0 && (
          <p className="mt-10 text-muted">
            No student-only items yet — check back soon.
          </p>
        )}

        <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {list.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </main>
      <Footer />
    </>
  );
}
