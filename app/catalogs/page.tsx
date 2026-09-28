import { createClient } from "@/lib/supabase-server";
import { loadCatalogs, publicCatalogs } from "@/lib/catalogs";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CatalogTile from "@/components/CatalogTile";
import SignOutButton from "@/components/SignOutButton";

export const revalidate = 0;

export default async function CatalogsPage() {
  const supabase = createClient();
  const { data: unlocked } = await supabase.rpc("is_verified_student");
  const studentUnlocked = Boolean(unlocked);

  const entries = await loadCatalogs(supabase, studentUnlocked);
  const shown = publicCatalogs(entries);
  const noItemsAtAll = entries[0].count === 0;

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="font-display text-4xl uppercase tracking-wide">
          Catalogs
        </h1>

        {studentUnlocked && (
          <div className="mt-4 flex items-center justify-between gap-3 rounded-lg border border-border px-4 py-3 text-sm">
            <span className="text-muted">Student pricing is unlocked.</span>
            <SignOutButton redirectTo="/catalogs" label="Not you? Sign out" />
          </div>
        )}

        <div className="mt-6">
          {noItemsAtAll ? (
            <p className="py-10 text-center text-muted">
              No items in this catalog yet. Check back soon.
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
              {shown.map((c) => (
                <CatalogTile
                  key={c.slug}
                  href={`/catalogs/${c.slug}`}
                  name={c.name}
                  count={c.count}
                  imageUrl={c.image_url}
                />
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
