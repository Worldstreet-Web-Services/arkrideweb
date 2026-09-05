import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Verification Review | Arkride",
  description: "Review and decide on driver verification applications.",
  // Not a security control — it only asks well-behaved crawlers not to index.
  // The actual gate is `requireAdmin()` in the (dashboard) layout.
  robots: { index: false, follow: false },
};

/**
 * Outer /admin layout: metadata only, deliberately unguarded.
 *
 * The authorisation check lives in `(dashboard)/layout.tsx` rather than here
 * because `/admin/login` is also under `/admin`, and a guard at this level
 * would redirect the sign-in page to itself forever. The route group keeps the
 * URLs identical while letting the two halves have different layouts.
 */
export default function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
