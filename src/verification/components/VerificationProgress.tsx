"use client";

import { cn } from "@/lib/utils";
import { useVerification } from "../store/VerificationProvider";
import { STEPS, isStepComplete } from "../steps";
import { CheckIcon } from "./icons";

/**
 * Step indicator (neutral / black).
 *  - Desktop: a horizontal row of numbered nodes joined by connector lines.
 *    Completed nodes show a check, the active node is filled and ringed,
 *    upcoming nodes are outlined grey.
 *  - Mobile: a compact "Step X of N" label, the current title, and a thin
 *    progress bar — far cleaner than wrapping seven labels.
 */
export function VerificationProgress({ activeIndex }: { activeIndex: number }) {
  const { data } = useVerification();
  const total = STEPS.length;
  const pct = Math.round(((activeIndex + 1) / total) * 100);

  return (
    /*
      `aria-label` alone on a bare <div> is ignored — an accessible name needs
      a role to attach to, and this had none. The mobile bar is now a real
      progressbar and the desktop list marks its current step, so "where am I
      in this nine-step form" is answerable without sight.
    */
    <div role="group" aria-label="Verification progress">
      {/* Mobile */}
      <div className="lg:hidden">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[13px] font-semibold text-text">
            Step {activeIndex + 1} of {total}
          </span>
          <span className="text-[13px] font-medium text-text-muted">{STEPS[activeIndex]?.title}</span>
        </div>
        <div
          role="progressbar"
          aria-valuemin={1}
          aria-valuemax={total}
          aria-valuenow={activeIndex + 1}
          aria-valuetext={`Step ${activeIndex + 1} of ${total}: ${STEPS[activeIndex]?.title ?? ""}`}
          className="h-1.5 overflow-hidden rounded-full bg-surface-sunken"
        >
          <div
            className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Desktop */}
      <ol className="hidden items-center lg:flex">
        {STEPS.map((s, i) => {
          const complete = isStepComplete(data, s.id);
          const active = i === activeIndex;
          const isLast = i === total - 1;
          return (
            <li
              key={s.id}
              aria-current={active ? "step" : undefined}
              className={cn("flex items-center", !isLast && "flex-1")}
            >
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border-[1.5px] text-[13px] font-bold transition-colors",
                    active
                      ? "border-primary bg-primary text-on-primary ring-4 ring-primary/25"
                      : complete
                        ? "border-primary bg-primary text-on-primary"
                        : "border-border-input bg-surface text-text-subtle"
                  )}
                >
                  {complete && !active ? <CheckIcon size={14} aria-hidden /> : i + 1}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap text-[13px] transition-colors",
                    active
                      ? "font-semibold text-text"
                      : complete
                        ? "font-medium text-text-soft"
                        : "font-medium text-text-subtle"
                  )}
                >
                  {s.title}
                </span>
              </div>
              {!isLast && (
                <span
                  className={cn(
                    "mx-3 h-px flex-1 transition-colors",
                    complete ? "bg-primary" : "bg-border-input"
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
