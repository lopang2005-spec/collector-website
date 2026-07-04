"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { ORDER_STAGES, stageLabel } from "@/lib/orderStages";

type Order = {
  id: string;
  customer_name: string;
  current_stage: string;
  updated_at: string;
  history: { stage: string; note: string; timestamp: string }[];
};

export default function OrderManager() {
  const supabase = createClient();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [newOrderId, setNewOrderId] = useState("");
  const [newCustomer, setNewCustomer] = useState("");
  const [stageChoice, setStageChoice] = useState<string>(ORDER_STAGES[0].key);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadOrders() {
    const { data, error: loadError } = await supabase
      .from("orders")
      .select("*")
      .order("updated_at", { ascending: false });
    if (loadError) setError(loadError.message);
    setOrders((data as Order[]) ?? []);
    setLoading(false);
  }

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const selected = orders.find((o) => o.id === selectedId) ?? null;

  useEffect(() => {
    if (selected) setStageChoice(selected.current_stage);
  }, [selectedId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function createOrder(e: React.FormEvent) {
    e.preventDefault();
    if (!newOrderId.trim()) return;
    setSaving(true);
    setError(null);

    const { error: insertError } = await supabase.from("orders").insert({
      id: newOrderId.trim(),
      customer_name: newCustomer.trim() || "Customer",
      current_stage: ORDER_STAGES[0].key,
      history: [
        {
          stage: ORDER_STAGES[0].key,
          note: "",
          timestamp: new Date().toISOString(),
        },
      ],
    });

    if (insertError) {
      setError(insertError.message);
    } else {
      setNewOrderId("");
      setNewCustomer("");
      await loadOrders();
    }
    setSaving(false);
  }

  async function saveStage() {
    if (!selected) return;
    setSaving(true);
    setError(null);

    const newHistory = [
      ...selected.history,
      { stage: stageChoice, note: note.trim(), timestamp: new Date().toISOString() },
    ];

    const { error: updateError } = await supabase
      .from("orders")
      .update({
        current_stage: stageChoice,
        history: newHistory,
        updated_at: new Date().toISOString(),
      })
      .eq("id", selected.id);

    if (updateError) {
      setError(updateError.message);
    } else {
      setNote("");
      await loadOrders();
    }
    setSaving(false);
  }

  async function deleteOrder(id: string) {
    if (!confirm(`Delete order ${id}? This can't be undone.`)) return;
    const { error: deleteError } = await supabase.from("orders").delete().eq("id", id);
    if (deleteError) {
      setError(deleteError.message);
      return;
    }
    if (selectedId === id) setSelectedId(null);
    await loadOrders();
  }

  return (
    <div className="mt-6 grid gap-8 md:grid-cols-[1fr_360px]">
      <div className="space-y-3">
        {loading && <p className="text-muted">Loading…</p>}
        {!loading && orders.length === 0 && (
          <p className="text-muted">No orders yet — add one from the form.</p>
        )}
        {orders.map((o) => (
          <div
            key={o.id}
            onClick={() => setSelectedId(o.id)}
            className={
              "card flex cursor-pointer items-center gap-4 rounded-lg p-3 " +
              (selectedId === o.id ? "border-accent" : "")
            }
          >
            <div className="flex-1">
              <p className="font-medium">
                {o.id} <span className="text-muted">— {o.customer_name}</span>
              </p>
              <p className="text-sm text-muted">{stageLabel(o.current_stage)}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteOrder(o.id);
              }}
              className="text-sm text-red-400"
            >
              Delete
            </button>
          </div>
        ))}
      </div>

      <div className="space-y-6">
        <form onSubmit={createOrder} className="card h-fit rounded-lg p-5">
          <h2 className="font-display text-lg">New order</h2>
          <label className="mt-3 block text-sm text-muted">
            Order number (matches what you give the customer)
          </label>
          <input
            required
            value={newOrderId}
            onChange={(e) => setNewOrderId(e.target.value)}
            placeholder="e.g. TC-0182"
            className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
          />
          <label className="mt-3 block text-sm text-muted">
            Customer name (optional)
          </label>
          <input
            value={newCustomer}
            onChange={(e) => setNewCustomer(e.target.value)}
            className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
          />
          <button
            type="submit"
            disabled={saving}
            className="btn-primary mt-4 rounded px-4 py-2 font-medium disabled:opacity-60"
          >
            Add order
          </button>
        </form>

        {selected && (
          <div className="card h-fit rounded-lg p-5">
            <h2 className="font-display text-lg">{selected.id}</h2>
            <p className="text-sm text-muted">{selected.customer_name}</p>

            <label className="mt-4 block text-sm text-muted">Stage</label>
            <select
              value={stageChoice}
              onChange={(e) => setStageChoice(e.target.value)}
              className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
            >
              {ORDER_STAGES.map((s) => (
                <option key={s.key} value={s.key}>
                  {s.label}
                </option>
              ))}
            </select>

            <label className="mt-3 block text-sm text-muted">
              Note (optional)
            </label>
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Cleared customs in Gaborone"
              className="mt-1 w-full rounded border border-border bg-surface px-3 py-2"
            />

            <button
              onClick={saveStage}
              disabled={saving}
              className="btn-primary mt-4 w-full rounded px-4 py-2 font-medium disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save status"}
            </button>
          </div>
        )}

        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>
    </div>
  );
}
