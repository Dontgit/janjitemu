import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Temujanji",
  description: "Booking dan penjadwalan sederhana untuk bisnis jasa di Indonesia."
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
