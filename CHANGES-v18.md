# v18 — price options per product + deposit breakdown at checkout

Built on v17. Run `supabase/migration_v10.sql` in Supabase BEFORE deploying.

## Price options (for example watch: Basic box / Premium box)
- Admin > Products: new "Price options" box under Price. Add 2 or more
  options, each with a name and a price. Leave empty for a normal product.
- While options exist, the main Price field is switched off and the cheapest
  option is saved as the main price (so search and the "From P..." label work).
- Product page: customer picks a version; the price updates; the chosen
  version goes into the cart.
- Shop grid / student catalog: shows "From P..." for products with options.
- The student discount (P off) applies to whichever option is chosen.
- Same watch in two versions = two separate cart lines.

## Deposit at checkout
- Cart page shows Total, Deposit (X%) and Balance due later.
- Deposit = total x percentage, rounded UP to the next whole Pula.
- Percentage is editable in Admin > Settings > Checkout (default 60).
- The WhatsApp order message now includes the version, deposit and balance.

## Files changed
migration_v10.sql, lib/deposit.ts (new), lib/settings.ts, lib/cart-context.tsx,
lib/whatsapp.ts, app/cart/page.tsx, app/product/[id]/page.tsx,
components/CartView.tsx, ProductCard.tsx, ProductPurchasePanel.tsx,
AddToCartButton.tsx, ProductManager.tsx, SettingsForm.tsx
