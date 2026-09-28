"use client";

import { useRef, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { compressImage } from "@/lib/image-compress";
import type { CatalogEntry } from "@/lib/catalogs";

const BUCKET = "catalog-tiles";
const MAX_INPUT_BYTES = 15 * 1024 * 1024;
const ACCEPTED = ["image/png", "image/jpeg", "image/webp"];

export default function CatalogTilesManager({
  initialEntries,
}: {
  initialEntries: CatalogEntry[];
}) {
  const [entries, setEntries] = useState<CatalogEntry[]>(initialEntries);
  const [names, setNames] = useState<Record<string, string>>(() => {
    const map: Record<string, string> = {};
    for (const e of initialEntries) map[e.slug] = e.display_name ?? "";
    return map;
  });
  const [busySlug, setBusySlug] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const fileInputs = useRef<Record<string, HTMLInputElement | null>>({});

  const supabase = createClient();

  // Writes one row. Rows that do not exist yet are inserted.
  async function saveRow(
    entry: CatalogEntry,
    patch: Partial<
      Pick<
        CatalogEntry,
        "display_name" | "image_url" | "image_path" | "sort_order" | "visible"
      >
    >
  ): Promise<CatalogEntry> {
    const next = { ...entry, ...patch };
    const payload = {
      display_name: next.display_name,
      image_url: next.image_url,
      image_path: next.image_path,
      sort_order: next.sort_order,
      visible: next.visible,
      updated_at: new Date().toISOString(),
    };

    if (entry.id) {
      const { error: updateError } = await supabase
        .from("catalog_tiles")
        .update(payload)
        .eq("id", entry.id);
      if (updateError) throw new Error(updateError.message);
      return next;
    }

    const { data, error: insertError } = await supabase
      .from("catalog_tiles")
      .insert({ category: entry.category, is_all: entry.is_all, ...payload })
      .select("id")
      .single();
    if (insertError) throw new Error(insertError.message);
    return { ...next, id: data.id as string };
  }

  function replaceInState(updated: CatalogEntry) {
    setEntries((prev) => prev.map((e) => (e.slug === updated.slug ? updated : e)));
  }

  async function run(slug: string, action: () => Promise<void>) {
    setBusySlug(slug);
    setError(null);
    setNotice(null);
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong.");
    }
    setBusySlug(null);
  }

  async function saveName(entry: CatalogEntry) {
    const typed = (names[entry.slug] ?? "").trim();
    const value = typed === "" ? null : typed;
    if (value === entry.display_name) return;
    await run(entry.slug, async () => {
      const updated = await saveRow(entry, { display_name: value });
      replaceInState({
        ...updated,
        name: value ?? entry.category ?? "All Items",
      });
      setNotice("Name saved.");
    });
  }

  async function toggleVisible(entry: CatalogEntry) {
    await run(entry.slug, async () => {
      const updated = await saveRow(entry, { visible: !entry.visible });
      replaceInState(updated);
    });
  }

  // Moves a category up or down, then renumbers so orders stay clean.
  async function move(slug: string, direction: -1 | 1) {
    const categories = entries.filter((e) => !e.is_all);
    const index = categories.findIndex((e) => e.slug === slug);
    const target = index + direction;
    if (index < 0 || target < 0 || target >= categories.length) return;

    const reordered = [...categories];
    [reordered[index], reordered[target]] = [reordered[target], reordered[index]];

    await run(slug, async () => {
      const saved: CatalogEntry[] = [];
      for (let i = 0; i < reordered.length; i++) {
        const row = reordered[i];
        const order = (i + 1) * 10;
        saved.push(
          row.sort_order === order ? row : await saveRow(row, { sort_order: order })
        );
      }
      setEntries((prev) => [prev.find((e) => e.is_all)!, ...saved]);
    });
  }

  async function uploadImage(entry: CatalogEntry, file: File) {
    if (!ACCEPTED.includes(file.type)) {
      setError("Use a PNG, JPEG or WebP picture.");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError("That picture is too large. Choose one under 15 MB.");
      return;
    }

    await run(entry.slug, async () => {
      const { blob, contentType, extension } = await compressImage(file);
      const path = `${crypto.randomUUID()}.${extension}`;

      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, blob, { contentType, cacheControl: "31536000", upsert: false });
      if (uploadError) throw new Error("Upload failed: " + uploadError.message);

      const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
      const oldPath = entry.image_path;

      try {
        const updated = await saveRow(entry, {
          image_url: data.publicUrl,
          image_path: path,
        });
        replaceInState(updated);
      } catch (e) {
        // The row was not updated, so do not leave the new file orphaned.
        await supabase.storage.from(BUCKET).remove([path]);
        throw e;
      }

      if (oldPath && oldPath !== path) {
        await supabase.storage.from(BUCKET).remove([oldPath]);
      }
      setNotice("Picture saved.");
    });
  }

  async function removeImage(entry: CatalogEntry) {
    if (!confirm("Remove this picture? The button will show a plain gold card.")) {
      return;
    }
    await run(entry.slug, async () => {
      const oldPath = entry.image_path;
      const updated = await saveRow(entry, { image_url: null, image_path: null });
      replaceInState(updated);
      if (oldPath) await supabase.storage.from(BUCKET).remove([oldPath]);
    });
  }

  const categoryCount = entries.filter((e) => !e.is_all).length;

  return (
    <div className="mt-6 space-y-4">
      {error && (
        <p className="rounded border border-red-400/50 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      )}
      {notice && (
        <p className="rounded border border-accent/50 px-3 py-2 text-sm text-accent">
          {notice}
        </p>
      )}

      {entries.map((entry) => {
        const busy = busySlug === entry.slug;
        const position = entries.filter((e) => !e.is_all).findIndex((e) => e.slug === entry.slug);
        return (
          <div
            key={entry.slug}
            className={
              "card rounded-lg p-4 " + (!entry.visible ? "opacity-60" : "")
            }
          >
            <div className="flex gap-4">
              <div className="relative h-28 w-24 flex-shrink-0 overflow-hidden rounded border border-accent/60 bg-bg">
                {entry.image_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={entry.image_url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="flex h-full w-full items-center justify-center px-1 text-center text-[11px] text-muted">
                    No picture
                  </span>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs uppercase tracking-wide text-muted">
                  {entry.is_all
                    ? "Always first. Shows every visible product."
                    : `Category: ${entry.category}`}
                </p>

                <label className="mt-2 block text-xs text-muted">
                  Display name
                </label>
                <input
                  value={names[entry.slug] ?? ""}
                  onChange={(e) =>
                    setNames((n) => ({ ...n, [entry.slug]: e.target.value }))
                  }
                  onBlur={() => saveName(entry)}
                  placeholder={entry.category ?? "All Items"}
                  disabled={busy}
                  className="mt-1 w-full rounded border border-border bg-surface px-3 py-2 text-sm disabled:opacity-60"
                />
                <p className="mt-1 text-xs text-muted">
                  Leave blank to use the category name. Saves when you tap away.
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2 text-sm">
              <input
                ref={(el) => {
                  fileInputs.current[entry.slug] = el;
                }}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.target.value = "";
                  if (file) uploadImage(entry, file);
                }}
              />
              <button
                type="button"
                disabled={busy}
                onClick={() => fileInputs.current[entry.slug]?.click()}
                className="rounded border border-border px-3 py-2 disabled:opacity-60"
              >
                {busy ? "Working" : entry.image_url ? "Replace picture" : "Upload picture"}
              </button>

              {entry.image_url && (
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => removeImage(entry)}
                  className="rounded border border-border px-3 py-2 text-muted disabled:opacity-60"
                >
                  Remove picture
                </button>
              )}

              {!entry.is_all && (
                <>
                  <button
                    type="button"
                    disabled={busy || position <= 0}
                    onClick={() => move(entry.slug, -1)}
                    className="rounded border border-border px-3 py-2 disabled:opacity-40"
                  >
                    Move up
                  </button>
                  <button
                    type="button"
                    disabled={busy || position >= categoryCount - 1}
                    onClick={() => move(entry.slug, 1)}
                    className="rounded border border-border px-3 py-2 disabled:opacity-40"
                  >
                    Move down
                  </button>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => toggleVisible(entry)}
                    className={
                      "rounded border px-3 py-2 disabled:opacity-60 " +
                      (entry.visible
                        ? "border-accent text-accent"
                        : "border-border text-muted")
                    }
                  >
                    {entry.visible ? "Shown. Tap to hide" : "Hidden. Tap to show"}
                  </button>
                </>
              )}
            </div>
          </div>
        );
      })}

      {categoryCount === 0 && (
        <p className="text-sm text-muted">
          No categories yet. Add some in the Categories section and their
          buttons will appear here.
        </p>
      )}
    </div>
  );
}
