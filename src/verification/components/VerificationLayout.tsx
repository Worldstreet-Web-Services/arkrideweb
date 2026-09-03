"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { STEPS } from "../steps";
import { HelpIcon, LockIcon, UserIcon } from "./icons";
import { VerificationProgress } from "./VerificationProgress";
import { VerificationSummaryCard } from "./VerificationSummaryCard";

/**
 * Portal frame — light neutral layout:
 *  - top header bar (logo · Help · avatar)
 *  - step routes: numbered stepper above a two-column body
 *    (form left, summary card right; single column on mobile)
 *  - landing/success: a single centered column, no stepper.
 */
export function VerificationLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const activeIndex = STEPS.findIndex((s) => s.path === pathname);
  const isStep = activeIndex >= 0;

  return (
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-white text-neutral-900">
      <BrandBar />

      {!isStep ? (
        <div className="mx-auto w-full max-w-160 flex-1 px-6 py-8">{children}</div>
      ) : (
        <div className="mx-auto w-full max-w-280 flex-1 px-6 py-8">
          <div className="mb-8">
            <VerificationProgress activeIndex={activeIndex} />
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
            <main className="min-w-0 max-w-155">{children}</main>
            <aside className="sticky top-6 hidden min-w-0 lg:block">
              <VerificationSummaryCard />
            </aside>
          </div>
        </div>
      )}
    </div>
  );
}

function BrandBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-neutral-200 bg-white/90 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-2.5">
        <span
          aria-hidden
          className="grid size-7.5 place-items-center rounded-[9px] bg-neutral-900 text-[15px] font-extrabold text-white"
        >
          A
        </span>
        <span className="flex items-baseline gap-1.5">
          <span className="text-lg font-extrabold tracking-tight">Arkride</span>
          <span className="text-xs font-semibold text-neutral-400">Driver Verification</span>
        </span>
      </div>

      <div className="flex items-center gap-4 sm:gap-5">
        <span className="hidden items-center gap-1.5 text-xs font-semibold text-neutral-500 sm:inline-flex">
          <LockIcon size={15} /> Secure
        </span>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 text-[15px] font-semibold text-neutral-600 transition-colors hover:text-neutral-900"
        >
          <HelpIcon size={18} /> Help
        </button>
        <span
          aria-hidden
          className="grid size-8.5 place-items-center rounded-full border border-neutral-200 bg-neutral-50 text-neutral-500"
        >
          <UserIcon size={18} />
        </span>
      </div>
    </header>
  );
}
