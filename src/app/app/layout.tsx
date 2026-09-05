import type { Metadata } from "next";
import { AppNav } from "@/components/app/AppNav";
import { requireRider } from "@/lib/api/guards";

export const metadata: Metadata = {
  title: "Your rides | Arkride",
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/app", label: "Book" },
  { href: "/app/rides", label: "Trips" },
  { href: "/app/account", label: "Account" },
];

export default async function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const principal = await requireRider("/app");

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-text">
      <AppNav name={principal.name || principal.email || "You"} links={LINKS} />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-200 flex-1 px-5 py-7 outline-none">
        {children}
      </main>
    </div>
  );
}
