"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/components/ProductCard";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string | null>(
    product.colors?.[0]?.label ?? null
  );
  const [selectedSize, setSelectedSize] = useState<string | null>(
    product.sizes?.[0] ?? null
  );
  const [error, setError] = useState<string | null>(null);

  function handleAdd() {
    if (product.sizes?.length && !selectedSize) {
      setError("Please choose a size.");
      return;
    }
    setError(null);
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
      color: selectedColor,
      size: selectedSize,
      availability: product.availability,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <div className="space-y-4">
      <span
        className={
          "inline-block rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide " +
          (product.availability === "in_stock"
            ? "border-accent bg-accent text-bg"
            : "border-accent text-accent")
        }
      >
        {product.availability === "in_stock"
          ? "Readily Available"
          : "Available By Order"}
      </span>

      {product.colors?.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-muted">Color</p>
          <div className="flex flex-wrap gap-2">
            {product.colors.map((c) => (
              <button
                key={c.label}
                type="button"
                onClick={() => setSelectedColor(c.label)}
                className={
                  "flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm " +
                  (selectedColor === c.label
                    ? "border-accent"
                    : "border-border")
                }
              >
                <span
                  className="h-3.5 w-3.5 rounded-full border border-border"
                  style={{ backgroundColor: c.hex }}
                />
                {c.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {product.sizes?.length > 0 && (
        <div>
          <p className="mb-2 text-sm text-muted">Size</p>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map((sz) => (
              <button
                key={sz}
                type="button"
                onClick={() => setSelectedSize(sz)}
                className={
                  "rounded-full border px-4 py-1.5 text-sm " +
                  (selectedSize === sz ? "border-accent bg-accent text-bg font-semibold" : "border-border")
                }
              >
                {sz}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <button
        onClick={handleAdd}
        className="btn-primary rounded px-6 py-3 font-medium transition hover:opacity-90"
      >
        {added ? "Added ✓" : "Add to cart"}
      </button>
    </div>
  );
}
