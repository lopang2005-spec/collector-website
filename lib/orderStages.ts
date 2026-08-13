// lib/orderStages.ts
// Keep this in sync with the check constraint in supabase/migration_v2.sql

export const ORDER_STAGES = [
  { key: "placed", label: "Order Placed" },
  { key: "sourcing", label: "Sourcing / Packing" },
  { key: "export", label: "China Export Declaration" },
  { key: "transit", label: "In Transit to Botswana" },
  { key: "arrived", label: "Arrived in Botswana" },
  { key: "out_for_delivery", label: "Out for Delivery" },
  { key: "delivered", label: "Delivered" },
] as const;

export type OrderStageKey = (typeof ORDER_STAGES)[number]["key"];

export function stageLabel(key: string) {
  return ORDER_STAGES.find((s) => s.key === key)?.label ?? key;
}

export function stageIndex(key: string) {
  return ORDER_STAGES.findIndex((s) => s.key === key);
}

export type OrderHistoryEntry = {
  stage: OrderStageKey;
  note: string;
  timestamp: string;
};
