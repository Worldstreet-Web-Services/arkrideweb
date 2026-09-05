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
      <p className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Driver Verification</p>
      <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900">
        Complete your verification
      </h1>
      <p className="mt-3 text-base leading-relaxed text-neutral-500">
        Provide your details and documents so we can verify your identity and vehicle before you start
        accepting rides.
      </p>

      {/* Meta chips */}
      <div className="mt-5 flex flex-wrap gap-2">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-600">
          <ClockIcon size={14} /> About 10 minutes
        </span>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-neutral-100 px-3 py-1.5 text-xs font-semibold text-neutral-600">
          <LockIcon size={14} /> Private to you on this device
        </span>
      </div>

      {started && (
        <div className="mt-6">
          <div className="mb-2 flex justify-between">
            <span className="text-sm font-semibold text-neutral-900">Your progress</span>
            <span className="text-sm font-semibold text-neutral-900">{pct}% Complete</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-neutral-900 transition-[width] duration-500 ease-out"
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
              className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(0,0,0,0.04)]"
            >
              {done ? (
                <span className="grid size-6 shrink-0 place-items-center rounded-full bg-neutral-900 text-white">
                  <CheckIcon size={14} />
                </span>
              ) : (
                <span className="grid size-6 shrink-0 place-items-center rounded-full border-[1.5px] border-neutral-200 text-[12px] font-bold text-neutral-400">
                  {i + 1}
                </span>
              )}
              <span className="text-[15px] font-medium text-neutral-900">{s.title}</span>
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
