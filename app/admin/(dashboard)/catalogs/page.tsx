import { createClient } from "@/lib/supabase-server";
import { loadCatalogs } from "@/lib/catalogs";
import CatalogTilesManager from "@/components/CatalogTilesManager";

export const revalidate = 0;

export default async function AdminCatalogsPage() {
  const supabase = createClient();
  const entries = await loadCatalogs(supabase, false);

  return (
    <div>
      <h1 className="font-display text-2xl">Catalog Buttons</h1>
      <p className="mt-2 text-muted">
        These are the buttons customers see after Shop Now. Change each
        picture and name, set the order, and hide a button. Hiding a button
        does not hide its products, they stay in All Items. New categories
        appear here automatically. Pictures are shrunk on your device before
        they upload.
      </p>
      <CatalogTilesManager initialEntries={entries} />
    </div>
  );
}
