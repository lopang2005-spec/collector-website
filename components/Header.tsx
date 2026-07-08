import Link from "next/link";
import { createClient } from "@/lib/supabase-server";
import { getSiteSettings } from "@/lib/settings";
import NavPanel from "@/components/NavPanel";
import SearchPanel from "@/components/SearchPanel";

export default async function Header() {
  const supabase = createClient();
  const [settings, { data: products }] = await Promise.all([
    getSiteSettings(),
    supabase
      .from("products")
      .select("id, name, price, image_url, category")
      .order("created_at", { ascending: false }),
  ]);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="flex items-center gap-3">
          {settings.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.logo_url}
              alt={settings.site_name}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-accent text-sm font-display text-accent">
              TC
            </span>
          )}
          <span className="font-display text-xl tracking-wide">
            {settings.site_name}
          </span>
        </Link>

        <div className="flex items-center gap-1">
          <SearchPanel products={products ?? []} />
          <NavPanel />
        </div>
      </div>
    </header>
  );
}
