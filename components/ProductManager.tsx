"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import type { Product } from "@/components/ProductCard";

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
    });
  }

  function resetForm() {
    setForm(EMPTY_FORM);
  }

  async function handleImageUpload(file: File) {
    setUploading(true);
    setError(null);

    const ext = file.name.split(".").pop();
    const path = `${crypto.randomUUID()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(path, file, { cacheControl: "3600", upsert: false });

    if (uploadError) {
      setError("Image upload failed: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data } = supabase.storage.from("product-images").getPublicUrl(path);
    setForm((f) => ({ ...f, image_url: data.publicUrl }));
    setUploading(false);
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
      image_url: form.image_url,
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
    <div className="mt-6 grid gap-8 md:grid-cols-[1fr_320px]">
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
                {p.category} — P{Number(p.price).toFixed(2)}
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

        <label className="mt-3 block text-sm text-muted">Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) handleImageUpload(file);
          }}
          className="mt-1 w-full text-sm"
        />
        {uploading && <p className="mt-1 text-sm text-muted">Uploading…</p>}
        {form.image_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={form.image_url}
            alt="Preview"
            className="mt-2 h-20 w-20 rounded object-cover"
          />
        )}

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
