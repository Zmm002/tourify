import type { Metadata } from "next";
import "./globals.css";
import "./admin.css";
import "./landing.css";

export const metadata: Metadata = {
  title: "Tourify — Taman Hiburan dengan Banyak Wahana",
  description: "Kenali wahana dan area bermain Tourify. Pemesanan tiket tersedia melalui aplikasi Tourify.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="id"><body>{children}</body></html>;
}
