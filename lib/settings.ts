import { createClient } from "@/lib/supabase-server";

export type SiteSettings = {
  site_name: string;
  logo_url: string | null;
  whatsapp_number: string;
  hero_location: string;
  hero_headline: string;
  hero_subtitle: string;
  hero_button_text: string;
  hero_image_url: string | null;
};

const DEFAULTS: SiteSettings = {
  site_name: "The Collector",
  logo_url: null,
  whatsapp_number: "26772319455",
  hero_location: "Palapye, Botswana",
  hero_headline: "THE COLLECTOR",
  hero_subtitle:
    "Curated streetwear, sneakers, accessories & watches — sourced, verified, and held to one standard.",
  hero_button_text: "Shop New Arrivals",
  hero_image_url: null,
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createClient();
  const { data } = await supabase
    .from("settings")
    .select(
      "site_name, logo_url, whatsapp_number, hero_location, hero_headline, hero_subtitle, hero_button_text, hero_image_url"
    )
    .eq("id", 1)
    .maybeSingle();

  if (!data) return DEFAULTS;

  return {
    site_name: data.site_name ?? DEFAULTS.site_name,
    logo_url: data.logo_url ?? null,
    whatsapp_number: data.whatsapp_number ?? DEFAULTS.whatsapp_number,
    hero_location: data.hero_location ?? DEFAULTS.hero_location,
    hero_headline: data.hero_headline ?? DEFAULTS.hero_headline,
    hero_subtitle: data.hero_subtitle ?? DEFAULTS.hero_subtitle,
    hero_button_text: data.hero_button_text ?? DEFAULTS.hero_button_text,
    hero_image_url: data.hero_image_url ?? null,
  };
}
