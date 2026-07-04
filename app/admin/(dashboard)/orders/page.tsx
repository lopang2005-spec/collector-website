import OrderManager from "@/components/OrderManager";

export const revalidate = 0;

export default function AdminOrdersPage() {
  return (
    <div>
      <h1 className="font-display text-2xl">Orders</h1>
      <OrderManager />
    </div>
  );
}
