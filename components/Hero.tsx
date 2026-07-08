import Link from "next/link";
import type { SiteSettings } from "@/lib/settings";

export default function Hero({ settings }: { settings: SiteSettings }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Background image + gradient wash, falls back to a plain dark field */}
      <div className="absolute inset-0">
        {settings.hero_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.hero_image_url}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full bg-surface" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/80 to-bg/40" />
        <div
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(var(--accent) 1px, transparent 1px), linear-gradient(90deg, var(--accent) 1px, transparent 1px)",
            backgroundSize: "36px 36px",
          }}
        />
      </div>

      <div className="relative mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-6 py-24 text-center sm:min-h-[80vh]">
        <span className="rounded-full border border-accent/50 px-4 py-1 text-[11px] uppercase tracking-[0.3em] text-accent">
          {settings.hero_location}
        </span>

        <h1 className="mt-6 font-display text-6xl leading-[0.95] tracking-wide sm:text-8xl">
          {settings.hero_headline}
        </h1>

        <p className="mt-5 max-w-lg text-sm text-muted sm:text-base">
          {settings.hero_subtitle}
        </p>

        <div className="mt-9 flex flex-col items-center gap-4 sm:flex-row">
          <Link
            href="/shop"
            className="rounded-full bg-accent px-8 py-3.5 text-xs font-semibold uppercase tracking-[0.15em] text-bg transition hover:opacity-90"
          >
            {settings.hero_button_text}
          </Link>
        </div>

        <div className="mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[11px] uppercase tracking-widest text-muted">
          <span className="flex items-center gap-2">
            <CheckIcon /> Verified pieces
          </span>
          <span className="flex items-center gap-2">
            <CheckIcon /> Gaborone &amp; nationwide
          </span>
          <span className="flex items-center gap-2">
            <CheckIcon /> Order via WhatsApp
          </span>
        </div>
      </div>
    </section>
  );
}

function CheckIcon() {
  return (
    <svg
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      className="text-accent"
    >
      <path d="M20 6 9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
