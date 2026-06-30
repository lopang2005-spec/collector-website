import { createClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddToCartButton from "@/components/AddToCartButton";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (!product) notFound();

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <div className="grid gap-10 md:grid-cols-2">
          <div className="card aspect-square overflow-hidden rounded-lg">
            {product.image_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={product.image_url}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full items-center justify-center text-muted">
                No image
              </div>
            )}
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-muted">
              {product.category}
            </p>
            <h1 className="mt-1 font-display text-3xl">{product.name}</h1>
            <p className="mt-3 text-2xl text-accent">
              P{Number(product.price).toFixed(2)}
            </p>
            <p className="mt-5 text-muted">{product.description}</p>

            <div className="mt-8">
              <AddToCartButton product={product} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
