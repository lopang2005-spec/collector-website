import Header from "@/components/Header";
import Footer from "@/components/Footer";
import OrderTracker from "@/components/OrderTracker";

export default function TrackPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-10">
        <h1 className="font-display text-3xl">Track your order</h1>
        <p className="mt-2 text-muted">
          Enter your order number to see its current status.
        </p>
        <div className="mt-6">
          <OrderTracker />
        </div>
      </main>
      <Footer />
    </>
  );
}
