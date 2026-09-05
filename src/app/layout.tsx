import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

/**
 * THE BRAND FACE
 *
 * Mobile uses Euclid Circular A (Swiss Typefaces) in four weights. Its licence
 * covers an app, NOT webfont embedding, so shipping the same TTFs here would be
 * a licensing breach — and they are TTF, where the web wants WOFF2.
 *
 * Plus Jakarta Sans is the closest free geometric sans: circular bowls, similar
 * proportions, and — the deciding factor — it holds up at the small sizes this
 * design actually runs at. 10-14px carries most of ArkRide's interface, and
 * several rounder alternatives (Poppins, Outfit) get muddy down there.
 *
 * Swapping to the real face later is TWO lines: this import, and the
 * `--font-brand` binding below. Nothing else in the codebase names a family —
 * `--font-sans` in globals.css reads `--font-brand` and every component reads
 * `--font-sans`.
 */
const brandSans = Plus_Jakarta_Sans({
  variable: "--font-brand",
  subsets: ["latin"],
  // The four weights mobile registers, matched one for one.
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://arkrides.com"),
  title: {
    default: "ArkRide — Move at the speed of now",
    template: "%s · ArkRide",
  },
  description:
    "Request a ride, hop in, and get where you're going. Keke, okada and car rides across Lagos — book in the app, by voice, or on WhatsApp.",
  keywords: [
    "ride hailing Lagos",
    "keke napep",
    "okada",
    "ArkRide",
    "book a ride Nigeria",
  ],
  openGraph: {
    title: "ArkRide — Move at the speed of now",
    description:
      "Request a ride, hop in, and get where you're going. Keke, okada and car rides across Lagos.",
    type: "website",
    locale: "en_NG",
    siteName: "ArkRide",
  },
  twitter: {
    card: "summary_large_image",
    title: "ArkRide — Move at the speed of now",
    description:
      "Request a ride, hop in, and get where you're going. Keke, okada and car rides across Lagos.",
  },
};

/**
 * `themeColor` belongs in `viewport`, not `metadata` — Next warns when it is on
 * the latter. Amber is the browser-chrome colour because it is the first thing
 * the splash screen shows on mobile.
 */
export const viewport: Viewport = {
  themeColor: "#f3ba3f",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={brandSans.variable}>
      <body className="min-h-screen flex flex-col antialiased bg-bg text-text">
        {/*
          Skip link. There was none anywhere, so a keyboard user re-tabbed the
          whole header on every one of the nine verification steps. Visually
          hidden until focused, which is the point — it should appear only for
          the people who need it.
        */}
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-100 focus:rounded-pill focus:bg-surface-inverse focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-on-inverse focus:outline-2 focus:outline-offset-2 focus:outline-primary"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
