import { getSiteSettings } from "@/lib/settings";

export default async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="mt-16 border-t border-border py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center text-sm text-muted">
        <div className="flex items-center gap-5">
          <a
            href={settings.instagram_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow The Collector on Instagram"
            className="text-muted transition hover:text-accent"
          >
            <InstagramIcon />
          </a>
          <a
            href={settings.tiktok_url}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow The Collector on TikTok"
            className="text-muted transition hover:text-accent"
          >
            <TikTokIcon />
          </a>
        </div>

        <a
          href={`https://wa.me/${settings.whatsapp_number}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 rounded-full border border-accent px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-accent transition hover:bg-accent hover:text-bg"
        >
          <WhatsAppIcon />
          Chat with us on WhatsApp
        </a>

        <p className="text-xs text-muted">
          © {new Date().getFullYear()} {settings.site_name}. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2.05 22l5.25-1.38a9.9 9.9 0 0 0 4.74 1.21h.01c5.46 0 9.91-4.45 9.91-9.91S17.5 2 12.04 2Zm5.8 14.17c-.24.68-1.4 1.3-1.93 1.38-.49.08-1.11.11-1.79-.11a16.4 16.4 0 0 1-1.63-.6c-2.87-1.24-4.74-4.13-4.88-4.32-.14-.19-1.17-1.56-1.17-2.98s.74-2.12 1-2.41c.26-.29.57-.36.76-.36.19 0 .38 0 .55.01.18.01.41-.07.64.49.24.58.81 2 .88 2.15.07.15.12.32.02.51-.09.19-.14.31-.28.48-.14.17-.29.37-.42.5-.14.14-.28.29-.12.57.16.28.71 1.17 1.52 1.9 1.05.94 1.93 1.23 2.21 1.37.28.14.44.12.61-.07.16-.19.7-.81.88-1.09.19-.28.38-.23.63-.14.26.09 1.65.78 1.93.92.28.14.47.21.53.33.07.12.07.68-.17 1.36Z" />
    </svg>
  );
}

function InstagramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function TikTokIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
      <path d="M16.6 5.82c-.94-.83-1.53-2.03-1.53-3.37h-3.05v13.8a3.13 3.13 0 1 1-2.2-2.99V10.2a6.15 6.15 0 1 0 5.25 6.09V9.6a8.15 8.15 0 0 0 4.6 1.42V8.02a4.85 4.85 0 0 1-3.07-2.2z" />
    </svg>
  );
}
