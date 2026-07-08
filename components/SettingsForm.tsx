"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase-browser";
import type { SiteSettings } from "@/lib/settings";

export default function SettingsForm({
  initialSettings,
}: {
  initialSettings: SiteSettings;
}) {
  const [siteName, setSiteName] = useState(initialSettings.site_name);
  const [whatsapp, setWhatsapp] = useState(initialSettings.whatsapp_number);
  const [logoUrl, setLogoUrl] = useState(initialSettings.logo_url);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [heroLocation, setHeroLocation] = useState(initialSettings.hero_location);
  const [heroHeadline, setHeroHeadline] = useState(initialSettings.hero_headline);
  const [heroSubtitle, setHeroSubtitle] = useState(initialSettings.hero_subtitle);
  const [heroButtonText, setHeroButtonText] = useState(
    initialSettings.hero_button_text
  );
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const router = useRouter();
  const supabase = createClient();

  async function handleLogoUpload(file: File) {
    setUploading(true);
    setError(null);

    const ext = file.name.split(".").pop();
    const path = `logo-${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("branding")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError("Logo upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("branding").getPublicUrl(path);
    setLogoUrl(data.publicUrl);
    setLogoPath(path);
    setUploading(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSaved(false);

    // Find the previous logo's storage path so we can remove it after saving,
    // keeping the bucket from accumulating orphaned files.
    const { data: previous } = await supabase
      .from("settings")
      .select("logo_path")
      .eq("id", 1)
      .maybeSingle();

    const { error: updateError } = await supabase
      .from("settings")
      .upsert({
        id: 1,
        site_name: siteName,
        whatsapp_number: whatsapp,
        logo_url: logoUrl,
        logo_path: logoPath ?? previous?.logo_path ?? null,
        hero_location: heroLocation,
        hero_headline: heroHeadline,
        hero_subtitle: heroSubtitle,
        hero_button_text: heroButtonText,
      });

    if (updateError) {
      setError(updateError.message);
      setSaving(false);
      return;
    }

    if (logoPath && previous?.logo_path && previous.logo_path !== logoPath) {
      await supabase.storage.from("branding").remove([previous.logo_path]);
    }

    setSaving(false);
    setSaved(true);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="card mt-6 max-w-md rounded-lg p-5">
      <label className="block text-sm text-muted">Website name</label>
      <input
        value={siteName}
        onChange={(e) => setSiteName(e.target.value)}
        className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
      />

      <label className="mt-4 block text-sm text-muted">
        WhatsApp number (digits only, with country code)
      </label>
      <input
        value={whatsapp}
        onChange={(e) => setWhatsapp(e.target.value)}
        placeholder="26772319455"
        className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
      />

      <label className="mt-4 block text-sm text-muted">Logo</label>
      <input
        type="file"
        accept="image/png,image/jpeg,image/svg+xml"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleLogoUpload(file);
        }}
        className="mt-1 w-full text-sm"
      />
      {uploading && <p className="mt-1 text-sm text-muted">Uploading…</p>}
      {logoUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="Logo preview" className="mt-3 h-16 w-16 rounded-full object-cover" />
      )}

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-accent">
          Homepage hero
        </p>

        <label className="mt-4 block text-sm text-muted">
          Location line (shown above the headline)
        </label>
        <input
          value={heroLocation}
          onChange={(e) => setHeroLocation(e.target.value)}
          placeholder="Palapye, Botswana"
          className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
        />

        <label className="mt-4 block text-sm text-muted">Headline</label>
        <input
          value={heroHeadline}
          onChange={(e) => setHeroHeadline(e.target.value)}
          placeholder="THE COLLECTOR"
          className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
        />

        <label className="mt-4 block text-sm text-muted">Subtitle</label>
        <textarea
          value={heroSubtitle}
          onChange={(e) => setHeroSubtitle(e.target.value)}
          rows={3}
          className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
        />

        <label className="mt-4 block text-sm text-muted">Button text</label>
        <input
          value={heroButtonText}
          onChange={(e) => setHeroButtonText(e.target.value)}
          placeholder="Shop New Arrivals"
          className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
        />
        <p className="mt-1 text-xs text-muted">
          The button always scrolls down to the product grid — only the text is editable.
        </p>
      </div>

      {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      {saved && (
        <p className="mt-3 text-sm text-accent">
          Saved — changes are live site-wide now.
        </p>
      )}

      <button
        type="submit"
        disabled={saving || uploading}
        className="btn-primary mt-5 rounded px-4 py-2 font-medium disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
