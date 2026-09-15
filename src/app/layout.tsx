import { PrivyProvider } from "@/components/auth/PrivyProvider";
import { Providers } from "./providers";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { Toaster } from "sonner";
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
 *
 * WHY THE FILES ARE COMMITTED RATHER THAN FETCHED
 *
 * `next/font/google` downloads the face from Google AT BUILD TIME. That makes
 * every build — CI, Docker, Railway — depend on a working TLS path to
 * fonts.googleapis.com, and a flaky one takes the whole build down: this
 * failed in a container with `TypeError: fetch failed` and an SSL "bad record
 * mac", from a network that could reach Google perfectly well a moment later.
 *
 * Self-hosting makes the build hermetic. It also removes a third-party request
 * from every page load, which is one fewer thing between a rider on Lagos
 * mobile data and a rendered page.
 *
 * These are the two Latin subsets of the variable font, so all four weights
 * come from one file per subset rather than four static cuts.
 */
const brandSans = localFont({
  variable: "--font-brand",
  display: "swap",
  src: [
    {
      path: "./fonts/PlusJakartaSans-latin.woff2",
      style: "normal",
      // A variable font: one file covers the whole 400-700 range mobile uses.
      weight: "400 700",
    },
    {
      path: "./fonts/PlusJakartaSans-latin-ext.woff2",
      style: "normal",
      weight: "400 700",
    },
  ],
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
    <html
      lang="en"
      className={brandSans.variable}
      // The waitlist intro sets `data-intro` on <html> before hydration, so
      // the server's markup and the live element legitimately differ there.
      suppressHydrationWarning
    >
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
        <Providers>
          <PrivyProvider>{children}</PrivyProvider>
          {/*
            One global toaster for the whole app. Styled with this file's own
            design tokens (`--color-success*`/`--color-danger*`/etc. from
            globals.css) rather than sonner's defaults, on `--font-sans` (set
            on <html>, so it reaches sonner's body-level portal too — unlike
            the waitlist route's own Mona Sans/Geist, which are scoped to a
            div inside that route and would not reach a portaled toast).
            top-center so it never collides with the waitlist dialog, which
            is a bottom sheet on mobile.
          */}
          <Toaster
            position="top-center"
            toastOptions={{
              unstyled: true,
              classNames: {
                toast:
                  "flex w-[calc(100vw-32px)] max-w-[380px] items-start gap-3 rounded-[10px] border bg-surface px-4 py-3 font-sans text-sm text-text shadow-[0_12px_32px_rgba(0,0,0,0.12)] border-border",
                title: "font-semibold leading-[20px]",
                description: "text-text-soft leading-[18px]",
                success: "border-success-border bg-success-tint text-success-strong",
                error: "border-danger-border bg-danger-tint text-danger",
              },
            }}
          />
        </Providers>
      </body>
    </html>
  );
}
