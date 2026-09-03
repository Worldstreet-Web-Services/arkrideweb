"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { getCurrentReviewer } from "../auth";

/** Page title shown in the header, derived from the route. */
function titleFor(pathname: string): string {
  if (pathname === "/admin") return "Driver applications";
  if (pathname.startsWith("/admin/")) return "Review application";
  return "";
}

export function AdminHeader() {
  const pathname = usePathname();
  const reviewer = getCurrentReviewer();
  const title = titleFor(pathname);
  const initials =
    reviewer.name
      .split(" ")
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "R";

  return (
    <header className="sticky top-0 z-30 border-b border-neutral-200 bg-white/90 px-6 py-3.5 backdrop-blur">
      <div className="mx-auto flex w-full max-w-320 items-center gap-3.5">
        <Link href="/admin" className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="grid size-7.5 place-items-center rounded-[9px] bg-neutral-900 text-[15px] font-extrabold text-white"
          >
            A
          </span>
          <span className="text-lg font-extrabold tracking-tight text-neutral-900">Arkride</span>
        </Link>

        {title && (
          <>
            <span className="hidden h-5 w-px bg-neutral-200 sm:block" aria-hidden />
            <h1 className="truncate text-[15px] font-semibold text-neutral-600">{title}</h1>
          </>
        )}

        <span
          title={reviewer.name}
          className="ml-auto grid size-9 shrink-0 place-items-center rounded-full bg-neutral-900 text-xs font-bold text-white"
        >
          {initials}
        </span>
      </div>
    </header>
  );
}
