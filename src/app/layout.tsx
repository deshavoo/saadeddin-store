import type { Metadata } from "next";
import { Cairo } from "next/font/google";
import Providers from "@/components/providers";
import Navbar from "@/components/Navbar";
import "./globals.css";
import TopBar from "@/components/TopBar";
import { CartDrawer } from "@/components/Cart";

const cairo = Cairo({
  subsets: ["arabic", "latin"],
  weight: ["300", "400", "600", "700", "900"],
  variable: "--font-cairo",
});

export const metadata: Metadata = {
  title: "حلويات سعد الدين 1919 | مذاق يحمل حكاية",
  description: "متجر حلويات سعد الدين 1919 - تشكيلة فاخرة من الحلويات الشرقية والغربية والمناسبات.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={`${cairo.variable} h-full bg-[#FEF8EB] antialiased`}>
      <body className="min-h-screen flex flex-col bg-[#FEF8EB] font-(family-name:--font-cairo) text-[#0b3c2e] selection:bg-[#c5a880]/30 m-0">
        <Providers>
          <TopBar />
          <Navbar />
          <CartDrawer />
          <main className="flex-1 flex flex-col">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
