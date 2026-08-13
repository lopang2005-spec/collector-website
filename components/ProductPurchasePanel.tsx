"use client";

import { useState } from "react";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";
import type { Product } from "@/components/ProductCard";

export default function ProductPurchasePanel({
  product,
  effectivePrice,
  galleryImages,
}: {
  product: Product;
  effectivePrice: number;
  galleryImages: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedImageUrl = galleryImages[activeIndex] ?? product.image_url;

  return (
    <div className="grid min-w-0 gap-10 md:grid-cols-2">
      <ProductGallery
        images={galleryImages}
        name={product.name}
        activeIndex={activeIndex}
        onActiveChange={setActiveIndex}
      />

      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted">
          {product.category}
        </p>
        <h1 className="mt-1 font-display text-3xl">{product.name}</h1>
        {effectivePrice < Number(product.price) ? (
          <div className="mt-3 flex items-baseline gap-3">
            <p className="text-lg text-muted line-through">
              P{Number(product.price).toFixed(2)}
            </p>
            <p className="text-2xl text-accent">P{effectivePrice.toFixed(2)}</p>
          </div>
        ) : (
          <p className="mt-3 text-2xl text-accent">
            P{Number(product.price).toFixed(2)}
          </p>
        )}
        <p className="mt-5 text-muted">{product.description}</p>

        <div className="mt-8">
          <AddToCartButton
            product={product}
            effectivePrice={effectivePrice}
            selectedImageUrl={selectedImageUrl}
          />
        </div>
      </div>
    </div>
  );
}
