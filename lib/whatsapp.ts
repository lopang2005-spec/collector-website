import type { CartItem } from "@/lib/cart-context";

function itemLine(i: CartItem) {
  const variantParts = [
    i.option,
    i.color,
    i.size ? `Size ${i.size}` : null,
  ].filter(Boolean);
  const variant = variantParts.length ? ` (${variantParts.join(", ")})` : "";
  const status =
    i.availability === "by_order" ? "Available by order" : "Readily available";

  const lines = [
    `- ${i.name}${variant} x${i.quantity} — P${(i.price * i.quantity).toFixed(2)}`,
    `  Status: ${status}`,
  ];

  if (i.image_url) {
    lines.push(`  Photo: ${i.image_url}`);
  }

  return lines.join("\n");
}

export function buildWhatsAppOrderLink(
  whatsappNumber: string,
  items: CartItem[],
  total: number,
  customerName: string,
  deposit: number,
  balance: number,
  depositPercent: number
) {
  const lines = [
    `Hi, I'd like to order from The Collector.`,
    `Name: ${customerName || "(not provided)"}`,
    "",
    "Order:",
    ...items.map((i) => itemLine(i)),
    "",
    `Total: P${total.toFixed(2)}`,
    `Deposit (${depositPercent}%): P${deposit.toFixed(2)}`,
    `Balance: P${balance.toFixed(2)}`,
    "",
    "I'd like to arrange my deposit.",
  ];

  const message = encodeURIComponent(lines.join("\n"));
  return `https://wa.me/${whatsappNumber}?text=${message}`;
}
