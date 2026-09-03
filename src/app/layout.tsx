import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Arkride — Your Ride, Your Way",
    template: "%s | Arkride",
  },
  description:
    "Arkride is a fast, reliable ride-hailing platform connecting riders and drivers across your city.",
  keywords: ["ride hailing", "taxi", "driver", "arkride"],
  openGraph: {
    title: "Arkride — Your Ride, Your Way",
    description: "Fast, reliable rides at your fingertips.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable}`}
    >
      <body className="min-h-screen flex flex-col antialiased bg-[var(--color-bg)] text-[var(--color-text)]">
        {children}
      </body>
    </html>
  );
}
