"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { ArkLogo } from "@/components/brand/ArkLogo";
import { signOutAction } from "@/app/actions/auth";

/** Top bar for the signed-in rider and driver surfaces. */
export function AppNav({
  name,
  links,
}: {
  name: string;
  links: { href: string; label: string }[];
}) {
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-280 items-center gap-4 px-5 py-3.5">
        <Link
          href={links[0]?.href ?? "/"}
          className="flex shrink-0 items-center gap-2.5 rounded-pill focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <ArkLogo className="h-7 w-auto text-text" aria-hidden />
          <span className="text-lg font-extrabold tracking-tight text-text">
            Arkride
          </span>
        </Link>

        <nav aria-label="Main" className="ml-2 hidden items-center gap-1 sm:flex">
          {links.map((l) => {
            // Exact match on the root link, prefix match elsewhere, so /app
            // does not stay highlighted while you are on /app/rides.
            const active =
              l.href === links[0]?.href
                ? pathname === l.href
                : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-pill px-3.5 py-2 text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary ${
                  active
                    ? "bg-surface-hover text-text"
                    : "text-text-muted hover:text-text"
                }`}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-3">
          <span className="hidden text-sm font-semibold text-text-muted sm:inline">
            {name}
          </span>
          <form action={() => startTransition(() => void signOutAction())}>
            <button
              type="submit"
              disabled={pending}
              className="rounded-pill border border-border px-3.5 py-1.5 text-xs font-semibold text-text-muted transition hover:border-text-subtle hover:text-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60"
            >
              {pending ? "Signing out…" : "Sign out"}
            </button>
          </form>
        </div>
      </div>

      {/* The same nav on small screens, where it does not fit beside the logo. */}
      <nav aria-label="Main" className="flex gap-1 overflow-x-auto px-5 pb-2.5 sm:hidden">
        {links.map((l) => {
          const active =
            l.href === links[0]?.href
              ? pathname === l.href
              : pathname.startsWith(l.href);
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`shrink-0 rounded-pill px-3.5 py-1.5 text-sm font-semibold transition ${
                active ? "bg-surface-hover text-text" : "text-text-muted"
              }`}
            >
              {l.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
