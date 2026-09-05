import type { Metadata } from "next";
import { AppNav } from "@/components/app/AppNav";
import { requireDriver } from "@/lib/api/guards";

export const metadata: Metadata = {
  title: "Driver | Arkride",
  robots: { index: false, follow: false },
};

const LINKS = [
  { href: "/driver", label: "Drive" },
  { href: "/driver/trips", label: "Trips" },
  { href: "/driver/earnings", label: "Earnings" },
];

export default async function DriverLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const principal = await requireDriver("/driver");

  return (
    <div className="flex min-h-dvh flex-col bg-bg text-text">
      <AppNav name={principal.name || principal.email || "Driver"} links={LINKS} />
      <main id="main" tabIndex={-1} className="mx-auto w-full max-w-200 flex-1 px-5 py-7 outline-none">
        {children}
      </main>
    </div>
  );
}
