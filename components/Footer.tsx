import { getSiteSettings } from "@/lib/settings";

export default async function Footer() {
  const settings = await getSiteSettings();

  return (
    <footer className="mt-16 border-t border-border py-8">
      <div className="mx-auto max-w-6xl px-4 text-center text-sm text-muted">
        <p>
          {settings.site_name} — questions? WhatsApp{" "}
          <a
            href={`https://wa.me/${settings.whatsapp_number}`}
            className="text-accent underline"
          >
            +{settings.whatsapp_number}
          </a>
        </p>
        <p className="mt-2">@connoisseur.bw</p>
      </div>
    </footer>
  );
}
