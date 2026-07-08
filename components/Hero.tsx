import Link from "next/link";
import type { SiteSettings } from "@/lib/settings";

export default function Hero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:py-24">
      <div className="relative mx-auto flex max-w-3xl flex-col items-center px-8 py-16 text-center sm:px-16">
        <span className="pointer-events-none absolute -top-2 -left-2 h-6 w-6 border-l border-t border-accent" />
        <span className="pointer-events-none absolute -top-2 -right-2 h-6 w-6 border-r border-t border-accent" />
        <span className="pointer-events-none absolute -bottom-2 -left-2 h-6 w-6 border-b border-l border-accent" />
        <span className="pointer-events-none absolute -bottom-2 -right-2 h-6 w-6 border-b border-r border-accent" />

        <p className="text-xs uppercase tracking-[0.3em] text-muted">
          {settings.hero_location}
        </p>

        <h1 className="mt-4 font-display text-5xl leading-none tracking-wide sm:text-7xl">
          {settings.hero_headline}
        </h1>

        <p className="mt-4 max-w-md text-sm text-muted sm:text-base">
          {settings.hero_subtitle}
        </p>

        <Link
          href="#new-in"
          className="mt-8 rounded-full bg-accent px-6 py-3 text-xs font-semibold uppercase tracking-wide text-bg transition hover:opacity-90"
        >
          {settings.hero_button_text}
        </Link>
      </div>
    </section>
  );
}
