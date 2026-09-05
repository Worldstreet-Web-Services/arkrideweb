"use client";

import { useRouter } from "next/navigation";
import { useVerification } from "@/verification/store/VerificationProvider";
import { STEPS, completionPercent, isStepComplete } from "@/verification/steps";
import { btnPrimaryCls } from "@/verification/ui";
import { ArrowRightIcon, CheckIcon, ClockIcon, LockIcon } from "@/verification/components/icons";

export default function VerificationWelcome() {
  const router = useRouter();
  const { data, hydrated } = useVerification();

  const pct = completionPercent(data);
  const firstIncomplete = STEPS.find((s) => !isStepComplete(data, s.id));
  const started = pct > 0;
  const resumePath = firstIncomplete ? firstIncomplete.path : "/verify/review";

  return (
    <div className="step-in pt-4">
      <p className="text-sm font-semibold uppercase tracking-wide text-text-subtle">Driver Verification</p>
      <h1 className="mt-2 text-3xl font-bold leading-tight tracking-tight text-text">
        Complete your verification
      </h1>
      <p className="mt-3 text-base leading-relaxed text-text-muted">
        Provide your details and documents so we can verify your identity and vehicle before you start
        accepting rides.
      </p>

      {/* Meta chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-sunken px-3 py-1.5 text-xs font-semibold text-text-muted">
          <ClockIcon size={14} /> About 10 minutes
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-sunken px-3 py-1.5 text-xs font-semibold text-text-muted">
          <LockIcon size={14} /> Private to you on this device
        </span>
      </div>

      {started && (
        <div className="mt-6">
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-semibold text-text">Your progress</span>
            <span className="text-sm font-semibold text-text">{pct}% Complete</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-surface-sunken">
            <div
              className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      <ul className="mt-6 flex flex-col gap-2">
        {STEPS.map((s, i) => {
          const done = isStepComplete(data, s.id);
          return (
            <li
              key={s.id}
              className="flex items-center gap-3 rounded-2xl border border-border-input bg-surface px-4 py-3.5 shadow-sm"
            >
              {done ? (
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-surface-inverse text-white">
                  <CheckIcon size={14} />
                </span>
              ) : (
                <span className="grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] border-border-input text-[12px] font-bold text-text-subtle">
                  {i + 1}
                </span>
              )}
              <span className="text-[15px] font-medium text-text">{s.title}</span>
            </li>
          );
        })}
      </ul>

      <button
        type="button"
        className={`${btnPrimaryCls} mt-7 w-full`}
        onClick={() => router.push(resumePath)}
        disabled={!hydrated}
      >
        {started ? "Continue Verification" : "Start Verification"} <ArrowRightIcon size={17} />
      </button>
    </div>
  );
}
