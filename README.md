# The Collector — storefront

A guest-checkout storefront with a WhatsApp-based ordering flow, plus an admin
dashboard for products and branding. Built with Next.js (App Router) and
Supabase. No card processing is included — Stripe doesn't support Botswana
merchant accounts, so V1 routes every order to WhatsApp for manual deposit
arrangement, matching how The Collector already operates.

## What's in here

- **Storefront** (`/`) — product grid by category, product pages, cart
- **Checkout** (`/cart`) — guest cart → "Send order on WhatsApp" with a
  prefilled message containing the order details
- **Admin** (`/admin`) — login-protected. Add/edit/delete products, change
  the site logo and name (applies site-wide immediately)
- **Theme switcher** — Dark / Light / Maroon / Light Blue, saved per browser

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) → New project (free tier is fine).
2. Once it's ready, open **SQL Editor** → New query → paste the entire
   contents of `supabase/schema.sql` → Run. This creates the `products` and
   `settings` tables, their security rules, and the two storage buckets for
   images.
3. Go to **Project Settings → API**. Copy the **Project URL** and the
   **anon public** key — you'll need both in step 3 below.

## 2. Create your admin login

Supabase Auth handles admin login. Customers never see this — there's no
public sign-up.

1. In Supabase: **Authentication → Users → Add user**.
2. Enter your email and a password. Confirm the user (no email verification
   needed for this internal use).
3. That email + password is what you'll use to sign in at `/admin/login`
   once the site is deployed.

To add a second admin later, repeat this step for them.

## 3. Set environment variables

Copy `.env.example` to `.env.local` and fill in the two values from step 1:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

## 4. Run it locally (optional, to check it works first)

```
npm install
npm run dev
```

Open `http://localhost:3000`. Add a product or two from `/admin` (after
signing in) and confirm they show up on the homepage.

## 5. Deploy to Vercel

Vercel deploys from a Git repository — there's no "paste code" option for a
multi-file project, so:

1. Push this folder to a new GitHub repository:
   ```
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/the-collector-store.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new) → Import that repository.
3. When prompted for environment variables, add the same two from step 3
   (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. Click Deploy. Vercel will detect Next.js automatically — no config needed.

Once it's live, sign in at `yourdomain.com/admin/login` with the admin user
you created in step 2.

## Editing the WhatsApp number / site name later

No code changes needed — go to `/admin/settings` after logging in. Changes
take effect immediately for every visitor.

## Things intentionally left out of V1 (and why)

- **No card payments.** Stripe and most major processors don't support
  Botswana-registered merchants. If you want this later, look at processors
  that actually serve Southern Africa (e.g. DPO Group) rather than Stripe.
- **No customer accounts.** Guest checkout only, since you don't currently
  need login/order-history for customers.
- **No bank-detail self-service panel.** Real-time, self-service bank
  rerouting is a common fraud vector (it's the same mechanism used in
  invoice-fraud attacks). If you ever need to change payout details, do it
  directly in your payment processor's dashboard, not through the storefront.
- **No SMS OTP.** Email-based admin login only, to avoid recurring per-message
  SMS provider costs for a single-admin setup.
