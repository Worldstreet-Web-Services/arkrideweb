import Link from "next/link";
import { ArkLogo } from "@/components/brand/ArkLogo";

/**
 * Shell for every sign-in and sign-up page.
 *
 * Split layout: the form on the left at a comfortable reading width, and a
 * brand panel on the right that is hidden below `lg`. The panel is decorative,
 * so on a phone — where most of these drivers and riders actually are — it
 * costs nothing and the form gets the whole screen.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-5 py-8 sm:px-10">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2.5 rounded-pill focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <ArkLogo className="h-6 w-auto text-text" aria-hidden />
          <span className="text-lg font-extrabold tracking-tight text-text">
            Arkride
          </span>
        </Link>

        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-96">{children}</div>
        </div>
      </div>

      {/* Decorative only — carries no content, so it is hidden from AT. */}
      <aside
        aria-hidden
        className="relative hidden overflow-hidden bg-surface-inverse lg:block"
      >
        <div className="absolute -right-24 -top-24 size-96 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-32 -left-20 size-96 rounded-full bg-primary/10 blur-3xl" />
        <div className="relative flex h-full flex-col justify-end p-12">
          <p className="max-w-100 text-3xl font-bold leading-tight text-on-inverse">
            Move at the speed of now.
          </p>
          <p className="mt-3 max-w-95 text-[15px] leading-relaxed text-on-inverse-muted">
            Keke, okada and cars across Lagos. Fair fares for riders, and 95% of
            every fare for the people driving.
          </p>
        </div>
      </aside>
    </div>
  );
}
