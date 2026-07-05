# v8 changes — clearer availability wording

No database changes. Code only.

## What changed

"Ready to Ship" could read as "still in transit, about to ship" — the
opposite of what it meant. Changed everywhere to **"Readily Available"** to
make clear the item is already in hand in Botswana, not still coming from
China.

Updated in: product cards, product page badge, cart, admin product list,
and the WhatsApp order message.

## Deploy

```
git add .
git commit -m "Change 'Ready to Ship' wording to 'Readily Available' for clarity"
git push
```

## Test

Check a product card, the product page, your cart, and the WhatsApp
message — all should now say "Readily Available" instead of "Ready to
Ship" for in-stock items.
