import { getSiteSettings } from "@/lib/settings";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Hero from "@/components/Hero";

export const revalidate = 0;

export default async function HomePage() {
  const settings = await getSiteSettings();

  return (
    <>
      <Header />
      <Hero settings={settings} />
      <Footer />
    </>
  );
}
