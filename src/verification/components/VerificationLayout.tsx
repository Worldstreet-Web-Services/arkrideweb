"use client";

import { usePathname } from "next/navigation";
import { ArkLogo } from "@/components/brand/ArkLogo";
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
    <div className="flex min-h-dvh flex-col overflow-x-clip bg-bg text-text">
      <BrandBar />

      {!isStep ? (
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-160 flex-1 px-6 py-8 outline-none">{children}</main>
      ) : (
        <div className="mx-auto w-full max-w-280 flex-1 px-6 py-8">
          <div className="mb-8">
            <VerificationProgress activeIndex={activeIndex} />
          </div>

          <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-12">
            <main id="main" tabIndex={-1} className="min-w-0 max-w-155 outline-none">{children}</main>
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
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-border-input bg-surface/90 px-6 py-4 backdrop-blur">
      <div className="flex items-center gap-2.5">
        <ArkLogo className="h-6 w-auto text-text" aria-hidden />
        <span className="flex items-baseline gap-1.5">
          <span className="text-lg font-extrabold tracking-tight">Arkride</span>
          <span className="text-xs font-semibold text-text-subtle">Driver Verification</span>
        </span>
      </div>

      <div className="flex items-center gap-4 sm:gap-5">
        <span className="hidden items-center gap-1.5 text-xs font-semibold text-text-muted sm:inline-flex">
          <LockIcon size={15} /> Secure
        </span>
        <a
          href="mailto:support@arkride.com?subject=Driver%20verification%20help"
          className="inline-flex items-center gap-1.5 rounded-pill text-[15px] font-semibold text-text-muted transition-colors hover:text-text focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary"
        >
          <HelpIcon size={18} aria-hidden /> Help
        </a>
        <span
          aria-hidden
          className="grid size-8.5 place-items-center rounded-full border border-border-input bg-surface-hover text-text-muted"
        >
          <UserIcon size={18} />
        </span>
      </div>
    </header>
  );
}
