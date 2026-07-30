import { createClient } from "@/lib/supabase-server";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AddToCartButton from "@/components/AddToCartButton";
import ProductGallery from "@/components/ProductGallery";
import BackToShopLink from "@/components/BackToShopLink";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();
  const [{ data: product }, { data: unlocked }] = await Promise.all([
    supabase.from("products").select("*").eq("id", params.id).maybeSingle(),
    supabase.rpc("is_verified_student"),
  ]);

  if (!product) notFound();

  const hasDiscount = Boolean(unlocked) && Number(product.discount_amount) > 0;
  const finalPrice = hasDiscount
    ? Number(product.price) - Number(product.discount_amount)
    : Number(product.price);

  const galleryImages: string[] =
    product.images?.length > 0
      ? product.images
      : product.image_url
        ? [product.image_url]
        : [];

  return (
    <>
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10">
        <BackToShopLink />

        <div className="grid min-w-0 gap-10 md:grid-cols-2">
          <ProductGallery images={galleryImages} name={product.name} />

          <div className="min-w-0">
            <p className="text-xs uppercase tracking-wide text-muted">
              {product.category}
            </p>
            <h1 className="mt-1 font-display text-3xl">{product.name}</h1>
            {hasDiscount ? (
              <div className="mt-3 flex items-baseline gap-3">
                <p className="text-lg text-muted line-through">
                  P{Number(product.price).toFixed(2)}
                </p>
                <p className="text-2xl text-accent">P{finalPrice.toFixed(2)}</p>
              </div>
            ) : (
              <p className="mt-3 text-2xl text-accent">
                P{Number(product.price).toFixed(2)}
              </p>
            )}
            <p className="mt-5 text-muted">{product.description}</p>

            <div className="mt-8">
              <AddToCartButton product={product} effectivePrice={finalPrice} />
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}


