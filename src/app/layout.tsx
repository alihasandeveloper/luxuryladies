import type { Metadata } from "next";
import { Montserrat } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CartProvider } from "@/context/CartContext";
import "./globals.css";

const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  title: "luxuryladies | Premium Contemporary Fashion",
  description: "luxuryladies - High heels, luxury bags, clutches, and curated sleepwear.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={montserrat.variable}>
      <body suppressHydrationWarning>
        <CartProvider>
          <Header />
          <main className="site-main">
            {children}
          </main>
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
