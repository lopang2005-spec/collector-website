import { getSiteSettings } from "@/lib/settings";
import SettingsForm from "@/components/SettingsForm";

export const revalidate = 0;

export default async function AdminSettingsPage() {
  const settings = await getSiteSettings();

  return (
    <div>
      <h1 className="font-display text-2xl">Branding</h1>
      <SettingsForm initialSettings={settings} />
    </div>
  );
}
