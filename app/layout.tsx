import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "BEESHA — Sistem Informasi Operasional PHM Group",
  description: "Sistem Informasi Operasional Terpadu PT Putra Hatim Mandiri (PHM Group)",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="min-h-screen bg-[#F2F4F7] text-[#1E293B] antialiased">
        {children}
      </body>
    </html>
  );
}
