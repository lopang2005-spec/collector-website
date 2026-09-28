import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase-server";
import { loadCatalogs } from "@/lib/catalogs";
import { ALL_SLUG } from "@/lib/slug";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard, { type Product } from "@/components/ProductCard";

export const revalidate = 0;

export default async function CatalogPage({
  params,
}: {
  params: { slug: string };
}) {
  const supabase = createClient();
  const { data: unlocked } = await supabase.rpc("is_verified_student");
  const studentUnlocked = Boolean(unlocked);

  const entries = await loadCatalogs(supabase, studentUnlocked);
  const catalog = entries.find((c) => c.slug === params.slug);
  if (!catalog) notFound();

  // Hidden products never appear. An unlocked student sees student products
  // and everyone else sees the regular products.
  let query = supabase
    .from("products")
    .select("*")
    .eq("hidden", false)
    .eq("student_only", studentUnlocked)
    .order("created_at", { ascending: false });

  if (catalog.slug !== ALL_SLUG && catalog.category) {
    query = query.eq("category", catalog.category);
  }

  const { data: products } = await query;
  const list = (products ?? []) as Product[];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <Link
          href="/catalogs"
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted transition hover:text-accent"
        >
          <BackArrowIcon />
          Back to Catalogs
        </Link>

        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="font-display text-4xl uppercase tracking-wide">
              {catalog.name}
            </h1>
          </div>
          <span className="text-xs uppercase tracking-wide text-muted">
            {list.length} {list.length === 1 ? "item" : "items"}
          </span>
        </div>

        {list.length === 0 ? (
          <div className="mt-10 rounded-lg border border-border px-6 py-14 text-center">
            <h2 className="font-display text-2xl">
              No items in this catalog yet
            </h2>
            <p className="mt-2 text-sm text-muted">
              New pieces are added often. Check back soon.
            </p>
            <Link
              href="/catalogs"
              className="mt-6 inline-block rounded-full bg-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-bg"
            >
              Back to Catalogs
            </Link>
          </div>
        ) : (
          <div className="mt-8 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
            {list.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                studentUnlocked={studentUnlocked}
              />
            ))}
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}

function BackArrowIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5M12 19l-7-7 7-7" />
    </svg>
  );
}
