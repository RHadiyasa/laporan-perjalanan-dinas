import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SPD Document Generator",
  description: "Generator Laporan Pelaksanaan Perjalanan Dinas",
  icons: {
    icon: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
