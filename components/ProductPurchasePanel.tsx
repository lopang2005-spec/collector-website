"use client";

import { useState } from "react";
import ProductGallery from "@/components/ProductGallery";
import AddToCartButton from "@/components/AddToCartButton";
import type { Product } from "@/components/ProductCard";

export default function ProductPurchasePanel({
  product,
  discountAmount,
  galleryImages,
}: {
  product: Product;
  /** Pula off (student discount), 0 when not unlocked or not set. */
  discountAmount: number;
  galleryImages: string[];
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const selectedImageUrl = galleryImages[activeIndex] ?? product.image_url;

  const options = product.price_options ?? [];
  const hasOptions = options.length > 1;
  const [optionIndex, setOptionIndex] = useState(0);
  const selectedOption = hasOptions ? options[optionIndex] : null;

  const basePrice = selectedOption
    ? Number(selectedOption.price)
    : Number(product.price);
  const finalPrice = Math.max(0, basePrice - discountAmount);

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
        {finalPrice < basePrice ? (
          <div className="mt-3 flex items-baseline gap-3">
            <p className="text-lg text-muted line-through">
              P{basePrice.toFixed(2)}
            </p>
            <p className="text-2xl text-accent">P{finalPrice.toFixed(2)}</p>
          </div>
        ) : (
          <p className="mt-3 text-2xl text-accent">P{basePrice.toFixed(2)}</p>
        )}
        <p className="mt-5 text-muted">{product.description}</p>

        {hasOptions && (
          <div className="mt-6">
            <p className="mb-2 text-sm text-muted">Choose your version</p>
            <div className="flex flex-wrap gap-2">
              {options.map((o, i) => {
                const optFinal = Math.max(0, Number(o.price) - discountAmount);
                return (
                  <button
                    key={o.label}
                    type="button"
                    onClick={() => setOptionIndex(i)}
                    className={
                      "rounded-lg border px-4 py-2 text-left text-sm " +
                      (optionIndex === i
                        ? "border-accent bg-accent text-bg font-semibold"
                        : "border-border")
                    }
                  >
                    <span className="block">{o.label}</span>
                    <span className="block text-xs opacity-80">
                      P{optFinal.toFixed(2)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8">
          <AddToCartButton
            product={product}
            effectivePrice={finalPrice}
            option={selectedOption?.label ?? null}
            selectedImageUrl={selectedImageUrl}
          />
        </div>
      </div>
    </div>
  );
}
