"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ArkLogo } from "@/components/brand/ArkLogo";
import { SignOutButton } from "./SignOutButton";

/** Page title shown in the header, derived from the route. */
function titleFor(pathname: string): string {
  if (pathname === "/admin") return "Driver applications";
  if (pathname.startsWith("/admin/")) return "Review application";
  return "";
}

function initialsFor(name: string): string {
  return (
    name
      .split(" ")
      .map((w) => w[0])
      .filter(Boolean)
      .slice(0, 2)
      .join("")
      .toUpperCase() || "R"
  );
}

/**
 * `reviewerName` is a prop rather than a hook call: the identity comes from
 * the server session, and client code has no way to read that.
 */
export function AdminHeader({ reviewerName }: { reviewerName: string }) {
  const pathname = usePathname();
  const title = titleFor(pathname);

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-surface/90 px-6 py-3.5 backdrop-blur">
      <div className="mx-auto flex w-full max-w-320 items-center gap-3.5">
        <Link
          href="/admin"
          className="flex items-center gap-2.5 rounded-pill focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <ArkLogo className="h-6 w-auto text-text" aria-hidden />
          <span className="sr-only">Arkride admin — back to applications</span>
          <span aria-hidden className="text-lg font-extrabold tracking-tight text-text">
            Arkride
          </span>
        </Link>

        {title && (
          <>
            <span className="hidden h-5 w-px bg-border sm:block" aria-hidden />
            <h1 className="truncate text-[15px] font-semibold text-text-muted">{title}</h1>
          </>
        )}

        <div className="ml-auto flex items-center gap-3">
          {reviewerName && (
            <span
              title={reviewerName}
              className="grid size-9 shrink-0 place-items-center rounded-full bg-surface-inverse text-xs font-bold text-white"
            >
              <span aria-hidden>{initialsFor(reviewerName)}</span>
              <span className="sr-only">Signed in as {reviewerName}</span>
            </span>
          )}
          <SignOutButton />
        </div>
      </div>
    </header>
  );
}
