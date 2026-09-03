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
    <div aria-label={`Step ${activeIndex + 1} of ${total}`}>
      {/* Mobile */}
      <div className="lg:hidden">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="text-[13px] font-semibold text-neutral-900">
            Step {activeIndex + 1} of {total}
          </span>
          <span className="text-[13px] font-medium text-neutral-500">{STEPS[activeIndex]?.title}</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
          <div
            className="h-full rounded-full bg-neutral-900 transition-[width] duration-500 ease-out"
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
            <li key={s.id} className={cn("flex items-center", !isLast && "flex-1")}>
              <div className="flex shrink-0 items-center gap-2">
                <span
                  className={cn(
                    "grid size-7 shrink-0 place-items-center rounded-full border-[1.5px] text-[13px] font-bold transition-colors",
                    active
                      ? "border-neutral-900 bg-neutral-900 text-white ring-4 ring-neutral-900/10"
                      : complete
                        ? "border-neutral-900 bg-neutral-900 text-white"
                        : "border-neutral-200 bg-white text-neutral-400"
                  )}
                >
                  {complete && !active ? <CheckIcon size={14} /> : i + 1}
                </span>
                <span
                  className={cn(
                    "whitespace-nowrap text-[13px] transition-colors",
                    active
                      ? "font-semibold text-neutral-900"
                      : complete
                        ? "font-medium text-neutral-700"
                        : "font-medium text-neutral-400"
                  )}
                >
                  {s.title}
                </span>
              </div>
              {!isLast && (
                <span
                  className={cn(
                    "mx-3 h-px flex-1 transition-colors",
                    complete ? "bg-neutral-900" : "bg-neutral-200"
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
