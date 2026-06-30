import { createClient } from "@/lib/supabase-server";

export type SiteSettings = {
  site_name: string;
  logo_url: string | null;
  whatsapp_number: string;
};

const DEFAULTS: SiteSettings = {
  site_name: "The Collector",
  logo_url: null,
  whatsapp_number: "26772319455",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = createClient();
  const { data } = await supabase
    .from("settings")
    .select("site_name, logo_url, whatsapp_number")
    .eq("id", 1)
    .maybeSingle();

  if (!data) return DEFAULTS;

  return {
    site_name: data.site_name ?? DEFAULTS.site_name,
    logo_url: data.logo_url ?? null,
    whatsapp_number: data.whatsapp_number ?? DEFAULTS.whatsapp_number,
  };
}
