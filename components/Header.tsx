import Link from "next/link";
import { getSiteSettings } from "@/lib/settings";
import NavPanel from "@/components/NavPanel";

export default async function Header() {
  const settings = await getSiteSettings();

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

        <NavPanel />
      </div>
    </header>
  );
}
