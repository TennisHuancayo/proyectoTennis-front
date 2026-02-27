import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Use Inter font
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "RominaCutipaAcademy - Academia de Tenis",
  description: "Aprende tenis con los mejores. Clases, torneos y más en RominaCutipaAcademy.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} antialiased bg-romina-navy text-white`}
      >
        {children}
      </body>
    </html>
  );
}
