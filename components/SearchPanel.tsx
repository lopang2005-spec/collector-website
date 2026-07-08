"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export type SearchProduct = {
  id: string;
  name: string;
  price: number;
  image_url: string | null;
  category: string;
};

export default function SearchPanel({
  products,
}: {
  products: SearchProduct[];
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
      const t = setTimeout(() => inputRef.current?.focus(), 50);
      return () => {
        clearTimeout(t);
        document.body.style.overflow = "";
      };
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q)
      )
      .slice(0, 24);
  }, [query, products]);

  function close() {
    setOpen(false);
    setQuery("");
  }

  const overlay = (
    <div className="fixed inset-0 z-[60]">
      <div
        onClick={close}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />
      <div className="relative mx-auto flex h-full max-h-[85vh] max-w-2xl flex-col rounded-b-xl bg-surface shadow-2xl sm:mt-16 sm:max-h-[70vh] sm:rounded-xl">
        <div className="flex items-center gap-3 border-b border-border px-5 py-4">
          <SearchIcon />
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, e.g. 'Corteiz' or 'sneakers'"
            className="flex-1 bg-transparent text-sm text-text placeholder:text-muted focus:outline-none"
          />
          <button
            onClick={close}
            aria-label="Close search"
            className="text-2xl leading-none text-muted hover:text-text"
          >
            ×
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {query.trim() === "" ? (
            <p className="py-10 text-center text-sm text-muted">
              Start typing to search the shop.
            </p>
          ) : results.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted">
              No pieces match &ldquo;{query}&rdquo;.
            </p>
          ) : (
            <ul className="divide-y divide-border">
              {results.map((product) => (
                <li key={product.id}>
                  <Link
                    href={`/product/${product.id}`}
                    onClick={close}
                    className="flex items-center gap-4 py-3 transition hover:opacity-80"
                  >
                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-bg">
                      {product.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.image_url}
                          alt={product.name}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-text">
                        {product.name}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-muted">
                        {product.category}
                      </p>
                    </div>
                    <span className="flex-shrink-0 text-sm text-accent">
                      P{product.price.toFixed(2)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Search products"
        className="flex h-9 w-9 items-center justify-center text-text hover:text-accent"
      >
        <SearchIcon />
      </button>
      {mounted && open ? createPortal(overlay, document.body) : null}
    </>
  );
}

function SearchIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" strokeLinecap="round" />
    </svg>
  );
}
