import type { Metadata } from "next";
import localFont from "next/font/local";

/**
 * The waitlist page is set in three faces the rest of the site does not use:
 * Mona Sans for the headline, Geist for the body and the form, Inter for the
 * tag and the footer line. They are loaded HERE rather than in the root layout
 * so that only this route pays for them — every other page keeps shipping the
 * one brand face and nothing else.
 *
 * All three are committed as variable WOFF2 files, for the same reason the
 * brand face is (see the root layout): a build that fetches fonts is a build
 * that fails when the network does. Each ships with its SIL OFL licence text
 * beside it in `src/app/fonts`.
 */
const monaSans = localFont({
  src: "../fonts/MonaSans-latin.woff2",
  weight: "200 900",
  variable: "--font-mona-sans",
  display: "swap",
});

const geist = localFont({
  src: "../fonts/Geist-variable.woff2",
  weight: "100 900",
  variable: "--font-geist",
  display: "swap",
});

const inter = localFont({
  src: "../fonts/Inter-latin.woff2",
  weight: "100 900",
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Join the waitlist",
  description:
    "Ark Ride launches September 2026. Join the first wave for safer pickups, clearer prices, and a ride that keeps pace with your day.",
};

export default function WaitlistLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className={`${monaSans.variable} ${geist.variable} ${inter.variable} contents`}>
      {children}
    </div>
  );
}
