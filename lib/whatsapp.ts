import type { CartItem } from "@/lib/cart-context";

export function buildWhatsAppOrderLink(
  whatsappNumber: string,
  items: CartItem[],
  total: number,
  customerName: string
) {
  const lines = [
    `Hi, I'd like to order from The Collector.`,
    `Name: ${customerName || "(not provided)"}`,
    "",
    "Order:",
    ...items.map(
      (i) => `- ${i.name} x${i.quantity} — P${(i.price * i.quantity).toFixed(2)}`
    ),
    "",
    `Total: P${total.toFixed(2)}`,
    "",
    "I'd like to arrange a deposit/payment.",
  ];

  const message = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${whatsappNumber}?text=${message}`;
}
