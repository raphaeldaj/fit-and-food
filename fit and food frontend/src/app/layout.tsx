import type { Metadata, Viewport } from "next";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "Fit & Food - Eat Clean, Live Lean",
  description: "Abonnements de repas sains préparés à Dakar.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen flex flex-col overflow-x-hidden">
          <Header />
          <main className="flex-1 flex flex-col min-w-0">{children}</main>
          <Footer />
      </body>
    </html>
  );
}