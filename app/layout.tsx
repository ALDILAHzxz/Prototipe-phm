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
    <html lang="id" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var theme = localStorage.getItem('beesha_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                  document.documentElement.setAttribute('data-theme', 'dark');
                } else {
                  document.documentElement.classList.remove('dark');
                  document.documentElement.setAttribute('data-theme', 'light');
                }
              } catch (_) {}
            `,
          }}
        />
      </head>
      <body className="min-h-screen bg-canvas text-ink antialiased transition-colors duration-300">
        {children}
      </body>
    </html>
  );
}
