"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";
import { ORDER_STAGES, stageIndex } from "@/lib/orderStages";

type OrderStatus = {
  customer_name: string;
  current_stage: string;
  history: { stage: string; note: string; timestamp: string }[];
};

export default function OrderTracker() {
  const supabase = createClient();
  const [orderId, setOrderId] = useState("");
  const [order, setOrder] = useState<OrderStatus | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "found" | "notfound">(
    "idle"
  );

  async function lookup(e: React.FormEvent) {
    e.preventDefault();
    if (!orderId.trim()) return;
    setStatus("loading");

    // Only ever calls the get_order_status() function — never queries the
    // orders table directly, so this can't be used to browse other orders.
    const { data, error } = await supabase.rpc("get_order_status", {
      order_id: orderId.trim(),
    });

    if (error || !data || data.length === 0) {
      setOrder(null);
      setStatus("notfound");
      return;
    }

    setOrder(data[0] as OrderStatus);
    setStatus("found");
  }

  const currentIdx = order ? stageIndex(order.current_stage) : -1;

  return (
    <div className="space-y-6">
      <form onSubmit={lookup} className="flex gap-2">
        <input
          value={orderId}
          onChange={(e) => setOrderId(e.target.value)}
          placeholder="e.g. TC-0182"
          className="flex-1 rounded border border-border bg-surface px-3 py-2"
        />
        <button
          type="submit"
          disabled={status === "loading"}
          className="btn-primary rounded px-5 py-2 font-medium disabled:opacity-60"
        >
          {status === "loading" ? "…" : "Track"}
        </button>
      </form>

      {status === "notfound" && (
        <p className="text-red-400">
          No order found with that number. Double-check it against your order
          confirmation.
        </p>
      )}

      {status === "found" && order && (
        <div className="card rounded-lg p-5">
          <h2 className="font-display text-xl">{orderId}</h2>
          <p className="text-sm text-muted">{order.customer_name}</p>

          <ul className="mt-5 space-y-4">
            {ORDER_STAGES.map((stage, i) => {
              const entry = [...order.history].reverse().find((h) => h.stage === stage.key);
              const isDone = i < currentIdx;
              const isCurrent = i === currentIdx;
              return (
                <li key={stage.key} className="flex gap-3">
                  <span
                    className={
                      "mt-1 h-3 w-3 flex-shrink-0 rounded-full " +
                      (isDone || isCurrent ? "bg-accent" : "bg-border")
                    }
                  />
                  <div>
                    <p
                      className={
                        (isCurrent ? "font-semibold " : "") +
                        (isDone || isCurrent ? "text-text" : "text-muted")
                      }
                    >
                      {stage.label}
                    </p>
                    {(isDone || isCurrent) && entry && (
                      <p className="text-xs text-muted">
                        {new Date(entry.timestamp).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                        })}
                        {entry.note ? ` — ${entry.note}` : ""}
                      </p>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
