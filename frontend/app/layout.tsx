import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "@/components/Providers";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Stayly — Vacation Rentals, Cabins, Beach Houses & More",
  description: "Find vacation rentals, cabins, beach houses, unique homes and experiences around the world.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className={`${inter.className} min-h-full flex flex-col bg-background text-foreground`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

