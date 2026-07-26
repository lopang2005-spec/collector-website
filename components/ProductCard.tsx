import Link from "next/link";

export type ProductColor = { label: string; hex: string };

export type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  images: string[];
  category: string;
  colors: ProductColor[];
  sizes: string[];
  availability: "in_stock" | "by_order";
  student_only?: boolean;
  discount_amount?: number | null;
};

export default function ProductCard({
  product,
  studentUnlocked = false,
}: {
  product: Product;
  studentUnlocked?: boolean;
}) {
  const hasDiscount = studentUnlocked && Number(product.discount_amount) > 0;
  const finalPrice = hasDiscount
    ? Number(product.price) - Number(product.discount_amount)
    : Number(product.price);
  return (
    <Link
      href={`/product/${product.id}`}
      className="card group block overflow-hidden rounded-lg transition hover:border-accent"
    >
      <div className="aspect-square overflow-hidden bg-surface">
        {product.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image_url}
            alt={product.name}
            className="h-full w-full object-cover transition group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted">
            No image
          </div>
        )}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs uppercase tracking-wide text-muted">
            {product.category}
          </p>
          <span
            className={
              "rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide " +
              (product.availability === "in_stock"
                ? "border-accent bg-accent text-bg"
                : "border-accent text-accent")
            }
          >
            {product.availability === "in_stock" ? "Readily Available" : "By Order"}
          </span>
        </div>
        <h3 className="mt-1 font-display text-lg">{product.name}</h3>
        {hasDiscount ? (
          <div className="mt-2 flex items-baseline gap-2">
            <p className="text-muted line-through">
              P{Number(product.price).toFixed(2)}
            </p>
            <p className="text-accent">P{finalPrice.toFixed(2)}</p>
          </div>
        ) : (
          <p className="mt-2 text-accent">P{Number(product.price).toFixed(2)}</p>
        )}
      </div>
    </Link>
  );
}
