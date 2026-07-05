"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useCart } from "@/lib/cart-context";
import ThemeSwitcher from "@/components/ThemeSwitcher";

export default function NavPanel() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  useEffect(() => setMounted(true), []);

  const overlay = (
    <>
      {/* Backdrop */}
      <div
        onClick={() => setOpen(false)}
        className={
          "fixed inset-0 z-50 bg-black/50 transition-opacity " +
          (open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0")
        }
      />

      {/* Side panel */}
      <div
        className={
          "fixed right-0 top-0 z-50 h-full w-72 max-w-[80vw] transform bg-surface shadow-xl transition-transform duration-300 " +
          (open ? "translate-x-0" : "translate-x-full")
        }
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <span className="font-display text-lg">Menu</span>
          <button
            onClick={() => setOpen(false)}
            aria-label="Close menu"
            className="text-2xl leading-none text-muted hover:text-text"
          >
            ×
          </button>
        </div>

        <nav className="flex flex-col gap-1 px-5 py-4">
          <Link
            href="/cart"
            onClick={() => setOpen(false)}
            className="flex items-center justify-between rounded px-2 py-3 text-text hover:bg-bg"
          >
            Cart
            {count > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-bg">
                {count}
              </span>
            )}
          </Link>
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="rounded px-2 py-3 text-text hover:bg-bg"
          >
            Shop
          </Link>
          <Link
            href="/track"
            onClick={() => setOpen(false)}
            className="rounded px-2 py-3 text-text hover:bg-bg"
          >
            Track Order
          </Link>

          <div className="mt-4 border-t border-border pt-4">
            <p className="mb-2 px-2 text-xs uppercase tracking-wide text-muted">
              Theme
            </p>
            <div className="px-2">
              <ThemeSwitcher />
            </div>
          </div>
        </nav>
      </div>
    </>
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        className="relative flex h-9 w-9 flex-col items-center justify-center gap-1.5"
      >
        <span className="h-0.5 w-6 bg-text" />
        <span className="h-0.5 w-6 bg-text" />
        <span className="h-0.5 w-6 bg-text" />
        {count > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-bg">
            {count}
          </span>
        )}
      </button>

      {mounted ? createPortal(overlay, document.body) : null}
    </>
  );
}
