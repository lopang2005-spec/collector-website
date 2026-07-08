"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

type Category = {
  id: string;
  name: string;
  productCount: number;
};

export default function CategoriesManager({
  initialCategories,
}: {
  initialCategories: Category[];
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [newName, setNewName] = useState("");
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [savingEdit, setSavingEdit] = useState(false);
  const [blockedId, setBlockedId] = useState<string | null>(null);
  const [reassignTarget, setReassignTarget] = useState("");
  const [reassigning, setReassigning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    const name = newName.trim();
    if (!name) return;
    setError(null);
    setAdding(true);

    const { data, error: insertError } = await supabase
      .from("categories")
      .insert({ name })
      .select()
      .single();

    if (insertError) {
      setError(
        insertError.code === "23505"
          ? `"${name}" already exists.`
          : insertError.message
      );
    } else if (data) {
      setCategories((prev) => [...prev, { id: data.id, name: data.name, productCount: 0 }]);
      setNewName("");
    }
    setAdding(false);
  }

  function startEdit(c: Category) {
    setEditingId(c.id);
    setEditValue(c.name);
    setError(null);
  }

  async function saveEdit(c: Category) {
    const name = editValue.trim();
    if (!name || name === c.name) {
      setEditingId(null);
      return;
    }
    setSavingEdit(true);
    setError(null);

    // Renaming here cascades to every product with this category
    // automatically (see products_category_fkey in migration_v5.sql) —
    // no need to touch the products table from here.
    const { error: updateError } = await supabase
      .from("categories")
      .update({ name })
      .eq("id", c.id);

    if (updateError) {
      setError(
        updateError.code === "23505"
          ? `"${name}" already exists.`
          : updateError.message
      );
    } else {
      setCategories((prev) =>
        prev.map((x) => (x.id === c.id ? { ...x, name } : x))
      );
      setEditingId(null);
    }
    setSavingEdit(false);
  }

  function attemptDelete(c: Category) {
    setError(null);
    if (c.productCount > 0) {
      setBlockedId(c.id);
      setReassignTarget("");
      return;
    }
    handleDelete(c);
  }

  async function handleDelete(c: Category) {
    setError(null);
    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", c.id);

    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    setCategories((prev) => prev.filter((x) => x.id !== c.id));
  }

  async function confirmReassignAndDelete(c: Category) {
    const target = categories.find((x) => x.id === reassignTarget);
    if (!target) return;
    setReassigning(true);
    setError(null);

    const { error: moveError } = await supabase
      .from("products")
      .update({ category: target.name })
      .eq("category", c.name);

    if (moveError) {
      setError(moveError.message);
      setReassigning(false);
      return;
    }

    const { error: deleteError } = await supabase
      .from("categories")
      .delete()
      .eq("id", c.id);

    if (deleteError) {
      setError(deleteError.message);
      setReassigning(false);
      return;
    }

    setCategories((prev) =>
      prev
        .map((x) =>
          x.id === target.id
            ? { ...x, productCount: x.productCount + c.productCount }
            : x
        )
        .filter((x) => x.id !== c.id)
    );
    setBlockedId(null);
    setReassigning(false);
  }

  return (
    <div className="mt-6 max-w-xl space-y-3">
      {categories.length === 0 && (
        <p className="text-muted">No categories yet — add one below.</p>
      )}

      {categories.map((c) => (
        <div key={c.id} className="card rounded-lg p-3">
          <div className="flex items-center gap-3">
            {editingId === c.id ? (
              <>
                <input
                  autoFocus
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && saveEdit(c)}
                  className="flex-1 rounded border border-border bg-surface px-2 py-1 text-sm"
                />
                <button
                  onClick={() => saveEdit(c)}
                  disabled={savingEdit}
                  className="text-sm text-accent disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-sm text-muted"
                >
                  Cancel
                </button>
              </>
            ) : (
              <>
                <div className="flex-1">
                  <p className="font-medium">{c.name}</p>
                  <p className="text-xs text-muted">
                    {c.productCount} product{c.productCount === 1 ? "" : "s"}
                  </p>
                </div>
                <button
                  onClick={() => startEdit(c)}
                  className="text-sm text-accent"
                >
                  Rename
                </button>
                <button
                  onClick={() => attemptDelete(c)}
                  className="text-sm text-red-400"
                >
                  Delete
                </button>
              </>
            )}
          </div>

          {blockedId === c.id && (
            <div className="mt-3 rounded-md border border-accent/40 bg-accent/10 p-3 text-sm">
              <p className="text-text">
                {c.productCount} product{c.productCount === 1 ? " is" : "s are"}{" "}
                still tagged &quot;{c.name}&quot;. Move them to another category
                first, or cancel.
              </p>
              <div className="mt-2 flex flex-wrap gap-2">
                <select
                  value={reassignTarget}
                  onChange={(e) => setReassignTarget(e.target.value)}
                  className="flex-1 rounded border border-border bg-surface px-2 py-1 text-sm"
                >
                  <option value="">Move products to…</option>
                  {categories
                    .filter((x) => x.id !== c.id)
                    .map((x) => (
                      <option key={x.id} value={x.id}>
                        {x.name}
                      </option>
                    ))}
                </select>
                <button
                  onClick={() => confirmReassignAndDelete(c)}
                  disabled={!reassignTarget || reassigning}
                  className="btn-primary rounded px-3 py-1 text-sm disabled:opacity-40"
                >
                  {reassigning ? "Moving…" : "Move & delete"}
                </button>
                <button
                  onClick={() => setBlockedId(null)}
                  className="text-sm text-muted"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      {error && <p className="text-sm text-red-400">{error}</p>}

      <form onSubmit={addCategory} className="flex gap-2 pt-1">
        <input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="New category name"
          className="flex-1 rounded border border-border bg-surface px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={adding}
          className="btn-primary rounded px-4 py-2 text-sm font-medium disabled:opacity-60"
        >
          {adding ? "Adding…" : "Add"}
        </button>
      </form>
    </div>
  );
}
