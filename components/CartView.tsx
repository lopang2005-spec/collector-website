"use client";

import { useState } from "react";
import { useCart } from "@/lib/cart-context";
import { buildWhatsAppOrderLink } from "@/lib/whatsapp";
import Link from "next/link";

export default function CartView({
  whatsappNumber,
}: {
  whatsappNumber: string;
}) {
  const { items, removeItem, updateQuantity, total } = useCart();
  const [name, setName] = useState("");

  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="font-display text-3xl">Your cart is empty</h1>
        <Link href="/" className="mt-4 inline-block text-accent underline">
          Continue shopping
        </Link>
      </main>
    );
  }

  const whatsappLink = buildWhatsAppOrderLink(
    whatsappNumber,
    items,
    total,
    name
  );

  return (
    <>
      <main className="mx-auto max-w-3xl px-4 py-10">
        <h1 className="font-display text-3xl">Your cart</h1>

        <div className="mt-6 space-y-4">
          {items.map((item) => (
            <div
              key={item.id}
              className="card flex items-center gap-4 rounded-lg p-4"
            >
              <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded bg-bg">
                {item.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                )}
              </div>
              <div className="flex-1">
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted">
                  P{item.price.toFixed(2)} each
                </p>
              </div>
              <input
                type="number"
                min={1}
                value={item.quantity}
                onChange={(e) =>
                  updateQuantity(item.id, Number(e.target.value))
                }
                className="w-16 rounded border border-border bg-surface px-2 py-1 text-center"
              />
              <button
                onClick={() => removeItem(item.id)}
                className="text-sm text-muted hover:text-text"
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-border pt-6">
          <span className="text-lg">Total</span>
          <span className="text-xl text-accent">P{total.toFixed(2)}</span>
        </div>

        <div className="mt-8 card rounded-lg p-5">
          <h2 className="font-display text-xl">
            Other Payment Method — Contact us on WhatsApp
          </h2>
          <p className="mt-2 text-sm text-muted">
            We don&apos;t process payment on this site. Send your order on
            WhatsApp and we&apos;ll arrange your deposit and delivery.
          </p>

          <label className="mt-4 block text-sm text-muted">Your name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="So we know who's ordering"
            className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
          />

          <a
            href={whatsappLink}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary mt-4 block w-full rounded px-6 py-3 text-center font-medium transition hover:opacity-90"
          >
            Send order on WhatsApp
          </a>
        </div>
      </main>
    </>
  );
}
