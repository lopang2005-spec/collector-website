"use client";

import { useState } from "react";
import ProductCard, { Product } from "@/components/ProductCard";

const NEW_IN = "New In";

export default function CategoryBrowser({
  products,
  categories,
  whatsappNumber,
}: {
  products: Product[];
  categories: string[];
  whatsappNumber: string;
}) {
  const [active, setActive] = useState(NEW_IN);

  const tabs = [NEW_IN, ...categories];
  const visible =
    active === NEW_IN ? products : products.filter((p) => p.category === active);

  return (
    <div className="mt-4">
      <div className="scrollbar-none -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {tabs.map((tab) => {
          const isActive = tab === active;
          return (
            <button
              key={tab}
              onClick={() => setActive(tab)}
              className={
                "flex-shrink-0 rounded-full border px-4 py-2 text-xs font-semibold uppercase tracking-wide transition " +
                (isActive
                  ? "border-accent bg-accent text-bg"
                  : "border-border text-muted hover:border-accent hover:text-accent")
              }
            >
              {tab}
            </button>
          );
        })}
      </div>

      <div className="mt-6 flex items-center gap-4">
        <h2 className="whitespace-nowrap font-display text-3xl uppercase tracking-wide">
          {active}
        </h2>
        <span className="h-px flex-1 bg-border" />
        <span className="text-xs uppercase tracking-wide text-muted">
          {visible.length} {visible.length === 1 ? "piece" : "pieces"}
        </span>
      </div>

      {visible.length === 0 ? (
        <div className="relative mt-8 flex flex-col items-center px-8 py-14 text-center">
          <span className="pointer-events-none absolute -top-2 -left-2 h-6 w-6 border-l border-t border-accent" />
          <span className="pointer-events-none absolute -top-2 -right-2 h-6 w-6 border-r border-t border-accent" />
          <span className="pointer-events-none absolute -bottom-2 -left-2 h-6 w-6 border-b border-l border-accent" />
          <span className="pointer-events-none absolute -bottom-2 -right-2 h-6 w-6 border-b border-r border-accent" />
          <h3 className="font-display text-2xl">New pieces incoming</h3>
          <p className="mt-2 max-w-sm text-sm text-muted">
            This category is being restocked. Message us on WhatsApp if
            there&apos;s something specific you&apos;re after.
          </p>
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 rounded-full bg-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-bg"
          >
            Message on WhatsApp
          </a>
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-2 gap-5 sm:grid-cols-3 lg:grid-cols-4">
          {visible.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
