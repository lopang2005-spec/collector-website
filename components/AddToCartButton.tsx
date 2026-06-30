"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import type { Product } from "@/components/ProductCard";

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  function handleAdd() {
    addItem({
      id: product.id,
      name: product.name,
      price: Number(product.price),
      image_url: product.image_url,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      onClick={handleAdd}
      className="btn-primary rounded px-6 py-3 font-medium transition hover:opacity-90"
    >
      {added ? "Added ✓" : "Add to cart"}
    </button>
  );
}
