// Deposit maths, shared by the cart page and the WhatsApp message so both
// always show the same numbers.
export function calcDeposit(total: number, percent: number) {
  const pct = Math.min(100, Math.max(0, Number(percent) || 0));
  const totalCents = Math.round(total * 100);
  // Deposit is rounded UP to the next whole Pula. The 1e-9 stops floating
  // point noise (e.g. 720.0000000001) from bumping it up by one.
  const deposit = Math.min(
    Math.ceil((totalCents * pct) / 10000 - 1e-9),
    Math.ceil(totalCents / 100)
  );
  const balance = Math.max(0, Math.round((total - deposit) * 100) / 100);
  return { deposit, balance, percent: pct };
}
