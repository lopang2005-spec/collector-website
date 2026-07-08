import { createClient } from "@/lib/supabase-server";
import Link from "next/link";

export default async function AdminHome() {
  const supabase = createClient();
  const { count } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true });

  return (
    <div>
      <h1 className="font-display text-2xl">Dashboard</h1>
      <p className="mt-2 text-muted">{count ?? 0} products live on the site.</p>

      <div className="mt-6 flex gap-4">
        <Link href="/admin/products" className="btn-primary rounded px-4 py-2">
          Manage products
        </Link>
        <Link
          href="/admin/categories"
          className="rounded border border-border px-4 py-2"
        >
          Categories
        </Link>
        <Link
          href="/admin/settings"
          className="rounded border border-border px-4 py-2"
        >
          Branding settings
        </Link>
      </div>
    </div>
  );
}
