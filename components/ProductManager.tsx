"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Product, ProductColor } from "@/components/ProductCard";

const CATEGORIES = [
  "Streetwear",
  "Sneakers",
  "Accessories",
  "Watches",
];

const EMPTY_FORM = {
  id: "",
  name: "",
  description: "",
  price: "",
  category: CATEGORIES[0],
  image_url: "" as string | null,
  images: [] as string[],
  colors: [] as ProductColor[],
  sizes: [] as string[],
  availability: "in_stock" as "in_stock" | "by_order",
};

export default function ProductManager({
  initialProducts,
}: {
  initialProducts: Product[];
}) {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [form, setForm] = useState(EMPTY_FORM);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newColorLabel, setNewColorLabel] = useState("");
  const [newColorHex, setNewColorHex] = useState("#1a1a1a");
  const [newSize, setNewSize] = useState("");

  const supabase = createClient();
  const isEditing = Boolean(form.id);

  function startEdit(p: Product) {
    setForm({
      id: p.id,
      name: p.name,
      description: p.description ?? "",
      price: String(p.price),
      category: p.category,
      image_url: p.image_url,
      images: p.images?.length ? p.images : p.image_url ? [p.image_url] : [],
      colors: p.colors ?? [],
      sizes: p.sizes ?? [],
      availability: p.availability ?? "in_stock",
    });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  function addColor() {
    if (!newColorLabel.trim()) return;
    setForm((f) => ({
      ...f,
      colors: [...f.colors, { label: newColorLabel.trim(), hex: newColorHex }],
    }));
    setNewColorLabel("");
  }

  function removeColor(label: string) {
    setForm((f) => ({ ...f, colors: f.colors.filter((c) => c.label !== label) }));
  }

  function addSize() {
    const val = newSize.trim();
    if (!val || form.sizes.includes(val)) return;
    setForm((f) => ({ ...f, sizes: [...f.sizes, val] }));
    setNewSize("");
  }

  function removeSize(sz: string) {
    setForm((f) => ({ ...f, sizes: f.sizes.filter((s) => s !== sz) }));
  }

  async function handleImageUpload(files: FileList) {
    setUploading(true);
    setError(null);

    const uploadedUrls: string[] = [];

    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(path, file, { cacheControl: "3600", upsert: false });

      if (uploadError) {
        setError("Image upload failed: " + uploadError.message);
        continue;
      }

      const { data } = supabase.storage.from("product-images").getPublicUrl(path);
      uploadedUrls.push(data.publicUrl);
    }

    setForm((f) => {
      const images = [...f.images, ...uploadedUrls];
      return { ...f, images, image_url: f.image_url || images[0] || "" };
    });
    setUploading(false);
  }

  function removeImage(url: string) {
    setForm((f) => {
      const images = f.images.filter((i) => i !== url);
      return {
        ...f,
        images,
        image_url: f.image_url === url ? images[0] ?? "" : f.image_url,
      };
    });
  }

  function makeMainImage(url: string) {
    setForm((f) => ({ ...f, image_url: url }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    const payload = {
      name: form.name,
      description: form.description,
      price: Number(form.price),
      category: form.category,
      image_url: form.image_url || form.images[0] || null,
      images: form.images,
      colors: form.colors,
      sizes: form.sizes,
      availability: form.availability,
    };

    if (isEditing) {
      const { data, error: updateError } = await supabase
        .from("products")
        .update(payload)
        .eq("id", form.id)
        .select()
        .single();

      if (updateError) {
        setError(updateError.message);
      } else if (data) {
        setProducts((prev) =>
          prev.map((p) => (p.id === data.id ? (data as Product) : p))
        );
        resetForm();
      }
    } else {
      const { data, error: insertError } = await supabase
        .from("products")
        .insert(payload)
        .select()
        .single();

      if (insertError) {
        setError(insertError.message);
      } else if (data) {
        setProducts((prev) => [data as Product, ...prev]);
        resetForm();
      }
    }

    setSaving(false);
  }

  async function handleDelete(id: string) {
    if (!confirm("Remove this product? This can't be undone.")) return;

    const { error: deleteError } = await supabase
      .from("products")
      .delete()
      .eq("id", id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }

    setProducts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {products.length === 0 && (
          <p className="text-muted">No products yet.</p>
        )}
        {products.map((p) => (
          <div
            key={p.id}
            className="card flex items-center gap-4 rounded-lg p-3"
          >
            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded bg-bg">
              {p.image_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={p.image_url}
                  alt={p.name}
                  className="h-full w-full object-cover"
                />
              )}
            </div>
            <div className="flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-sm text-muted">
                {p.category} — P{Number(p.price).toFixed(2)} —{" "}
                {p.availability === "in_stock" ? "Readily Available" : "By order"}
              </p>
            </div>
            <button
              onClick={() => startEdit(p)}
              className="text-sm text-accent"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(p.id)}
              className="text-sm text-red-400"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="card h-fit rounded-lg p-5">
        <h2 className="font-display text-lg">
          {isEditing ? "Edit product" : "Add product"}
        </h2>

        <label className="mt-4 block text-sm text-muted">Name</label>
        <input
          required
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
        />

        <label className="mt-3 block text-sm text-muted">Description</label>
        <textarea
          value={form.description}
          onChange={(e) =>
            setForm((f) => ({ ...f, description: e.target.value }))
          }
          className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
          rows={3}
        />

        <label className="mt-3 block text-sm text-muted">Price (BWP)</label>
        <input
          required
          type="number"
          step="0.01"
          min="0"
          value={form.price}
          onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
          className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
        />

        <label className="mt-3 block text-sm text-muted">Category</label>
        <select
          value={form.category}
          onChange={(e) =>
            setForm((f) => ({ ...f, category: e.target.value }))
          }
          className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
        >
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>

        <label className="mt-3 block text-sm text-muted">Availability</label>
        <div className="mt-1 space-y-2">
          {[
            { key: "in_stock", label: "Readily Available", sub: "In hand, ships immediately" },
            { key: "by_order", label: "Available By Order", sub: "Sourced/made after order" },
          ].map((opt) => (
            <label
              key={opt.key}
              className={
                "flex cursor-pointer items-start gap-3 rounded border p-3 " +
                (form.availability === opt.key ? "border-accent" : "border-border")
              }
            >
              <input
                type="radio"
                name="availability"
                checked={form.availability === opt.key}
                onChange={() =>
                  setForm((f) => ({ ...f, availability: opt.key as "in_stock" | "by_order" }))
                }
                className="mt-1"
              />
              <span>
                <span className="block text-sm font-medium">{opt.label}</span>
                <span className="block text-xs text-muted">{opt.sub}</span>
              </span>
            </label>
          ))}
        </div>

        <label className="mt-3 block text-sm text-muted">Colors</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {form.colors.map((c) => (
            <span
              key={c.label}
              className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm"
            >
              <span
                className="h-3.5 w-3.5 rounded-full border border-border"
                style={{ backgroundColor: c.hex }}
              />
              {c.label}
              <button
                type="button"
                onClick={() => removeColor(c.label)}
                className="text-muted hover:text-text"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            type="color"
            value={newColorHex}
            onChange={(e) => setNewColorHex(e.target.value)}
            className="h-9 w-12 rounded border border-border bg-surface"
          />
          <input
            value={newColorLabel}
            onChange={(e) => setNewColorLabel(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addColor())}
            placeholder="e.g. Black"
            className="flex-1 rounded border border-border bg-surface px-3 py-2"
          />
          <button
            type="button"
            onClick={addColor}
            className="rounded border border-border px-3 py-2 text-sm"
          >
            Add
          </button>
        </div>

        <label className="mt-3 block text-sm text-muted">Sizes</label>
        <div className="mt-1 flex flex-wrap gap-2">
          {form.sizes.map((sz) => (
            <span
              key={sz}
              className="flex items-center gap-2 rounded-full border border-border px-3 py-1 text-sm"
            >
              {sz}
              <button
                type="button"
                onClick={() => removeSize(sz)}
                className="text-muted hover:text-text"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="mt-2 flex gap-2">
          <input
            value={newSize}
            onChange={(e) => setNewSize(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSize())}
            placeholder="e.g. M or 42"
            className="flex-1 rounded border border-border bg-surface px-3 py-2"
          />
          <button
            type="button"
            onClick={addSize}
            className="rounded border border-border px-3 py-2 text-sm"
          >
            Add
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">
          Leave empty if this product has no size options.
        </p>

        <label className="mt-3 block text-sm text-muted">Images</label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => {
            const files = e.target.files;
            if (files && files.length > 0) handleImageUpload(files);
            e.target.value = "";
          }}
          className="mt-1 w-full text-sm"
        />
        {uploading && <p className="mt-1 text-sm text-muted">Uploading…</p>}
        {form.images.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2">
            {form.images.map((url) => (
              <div key={url} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt="Product"
                  onClick={() => makeMainImage(url)}
                  className={
                    "h-20 w-20 cursor-pointer rounded object-cover border-2 " +
                    (form.image_url === url ? "border-accent" : "border-transparent")
                  }
                />
                {form.image_url === url && (
                  <span className="absolute -top-2 left-1 rounded bg-accent px-1 text-[10px] font-bold text-bg">
                    Main
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(url)}
                  className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-black text-xs text-white"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
        <p className="mt-1 text-xs text-muted">
          Select multiple photos at once, or add more over time. Tap a photo
          to make it the main image shown on the shop page.
        </p>

        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}

        <div className="mt-5 flex gap-3">
          <button
            type="submit"
            disabled={saving || uploading}
            className="btn-primary rounded px-4 py-2 font-medium disabled:opacity-60"
          >
            {saving ? "Saving…" : isEditing ? "Save changes" : "Add product"}
          </button>
          {isEditing && (
            <button
              type="button"
              onClick={resetForm}
              className="rounded border border-border px-4 py-2"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
