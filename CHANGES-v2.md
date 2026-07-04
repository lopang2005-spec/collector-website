# v2 changes — what's new and how to set it up

This adds the four things we discussed: colors/sizes, availability status,
a richer WhatsApp order message, and a safe order-tracking system.

## 1. Run the SQL migration

In Supabase → SQL Editor → New query → paste the contents of
`supabase/migration_v2.sql` → Run.

This adds `colors`, `sizes`, `availability` to your `products` table, creates
a new `orders` table, and adds a `get_order_status()` function.

**Why a function instead of a normal public policy on `orders`:** if we'd
made the orders table publicly readable (like the courier dashboard problem
you ran into), anyone could query the whole table and see every customer's
orders. Instead, the public tracking page can only ever call
`get_order_status(order_id)`, which returns one order — and only if the
visitor already knows the exact order number you gave them.

## 2. What changed in the code

- **Products** now have `colors` (label + hex), `sizes` (free text list), and
  `availability` (`in_stock` / `by_order`), editable in `/admin/products`.
- **Product pages** show a color swatch picker and size picker (skipped if a
  product has none set) and an availability badge.
- **Product cards** on the homepage show a small "Ready to Ship" / "By Order"
  badge.
- **Cart** now tracks color/size per line item, so the same product in two
  sizes shows as two separate lines.
- **WhatsApp message** sent from checkout now includes, per item: color,
  size, availability status, and a link to the product photo (WhatsApp
  auto-previews it once sent).
- **New `/admin/orders` page** — same login as the rest of your dashboard.
  Create an order (using whatever order number you already use), update its
  stage from a dropdown, optionally add a note.
- **New public `/track` page**, linked in the header — customer enters their
  order number, sees a live timeline. No prices, no other orders, no login.

## 3. Testing checklist after deploying

1. Add colors/sizes to one product in `/admin/products`, confirm they show
   on the product page and you can select them.
2. Add to cart, go to checkout, confirm the WhatsApp message includes the
   color/size/status/photo link you expect.
3. In `/admin/orders`, add a test order and move it through a couple of
   stages.
4. Visit `/track`, enter that order number, confirm the timeline matches.
5. Try `/track` with a made-up order number — should say "not found," never
   show anyone else's data.

## Order stages (edit in `lib/orderStages.ts` if you want different wording)

Order Placed → Sourcing/Packing → China Export Declaration → In Transit to
Botswana → Arrived in Botswana → Out for Delivery → Delivered
