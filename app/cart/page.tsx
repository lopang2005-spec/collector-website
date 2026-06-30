import { getSiteSettings } from "@/lib/settings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CartView from "@/components/CartView";

export default async function CartPage() {
  const settings = await getSiteSettings();

  return (
    <>
      <Header />
      <CartView whatsappNumber={settings.whatsapp_number} />
      <Footer />
    </>
  );
}
