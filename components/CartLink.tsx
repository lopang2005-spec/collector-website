"use client";

import Link from "next/link";
import { useCart } from "@/lib/cart-context";

export default function CartLink() {
  const { items } = useCart();
  const count = items.reduce((sum, i) => sum + i.quantity, 0);

  return (
    <Link href="/cart" className="relative text-sm text-muted hover:text-text">
      Cart
      {count > 0 && (
        <span className="absolute -right-3 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-[11px] font-semibold text-bg">
          {count}
        </span>
      )}
    </Link>
  );
}
