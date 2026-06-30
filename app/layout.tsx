import type { Metadata } from "next";
import { Bebas_Neue, Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/lib/theme-context";
import { CartProvider } from "@/lib/cart-context";
import { getSiteSettings } from "@/lib/settings";

const bebasNeue = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-body",
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.site_name,
    description: `${settings.site_name} — streetwear, sneakers, accessories & watches.`,
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="dark" className={`${bebasNeue.variable} ${inter.variable}`}>
      <body className="font-body">
        <ThemeProvider>
          <CartProvider>{children}</CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
