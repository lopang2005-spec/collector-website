import { getSiteSettings } from "@/lib/settings";

const INSTAGRAM_URL =
  "https://www.instagram.com/connoisseur.bw?igsh=MXZsb3lmaTQ4eG10dQ%3D%3D&utm_source=qr";
const TIKTOK_URL = "https://www.tiktok.com/@the.collectors.ma?_r=1&_t=ZS-97q5p1h4CsX";

export default async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="mt-16 border-t border-border py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 text-center text-sm text-muted">
        <div className="flex items-center gap-5">
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow The Collector on Instagram"
            className="text-muted transition hover:text-accent"
          >
            <InstagramIcon />
          </a>
          <a
            href={TIKTOK_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Follow The Collector on TikTok"
            className="text-muted transition hover:text-accent"
          >
            <TikTokIcon />
          </a>
        </div>

        <p>
          {settings.site_name} — questions? WhatsApp{" "}
          <a
            href={`https://wa.me/${settings.whatsapp_number}`}
            className="text-accent underline"
          >
            +{settings.whatsapp_number}
          </a>
        </p>
        <p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-accent"
          >
            @connoisseur.bw
          </a>
        </p>
      </div>
    </footer>
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
