"use client";

import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { useVerification } from "../store/VerificationProvider";
import { STEPS, stepIndexById } from "../steps";
import type { FieldErrors } from "../types";
import { btnLinkCls, btnPrimaryCls } from "../ui";
import { ArrowRightIcon, LockIcon } from "./icons";

/**
 * Wraps a single verification step: renders the title, the form fields (given
 * the current errors), and the Back/Continue nav. Continue runs the step's
 * validator — on failure it surfaces inline errors and scrolls to top rather
 * than advancing; on success it routes to the next step (or Review at the end).
 */
export function StepScreen({
  stepId,
  subtitle,
  children,
}: {
  stepId: string;
  subtitle?: string;
  children: (errors: FieldErrors) => ReactNode;
}) {
  const { data } = useVerification();
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});

  const idx = stepIndexById(stepId);
  const step = STEPS[idx];
  const prev = STEPS[idx - 1];
  const next = STEPS[idx + 1];

  const handleBack = () => router.push(prev ? prev.path : "/verify");

  const handleContinue = () => {
    const found = step.validate(data);
    setErrors(found);
    if (Object.keys(found).length === 0) {
      router.push(next ? next.path : "/verify/review");
    } else if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  return (
    <div key={stepId} className="step-in">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-neutral-400">
        Step {idx + 1} of {STEPS.length}
      </p>
      <h1 className="mt-1 text-2xl font-bold tracking-tight text-neutral-900">{step.title}</h1>
      {subtitle && <p className="mt-1.5 text-[15px] text-neutral-500">{subtitle}</p>}

      {hasErrors && (
        <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          Please fix the highlighted fields below to continue.
        </div>
      )}

      <div className="mt-6 flex flex-col gap-4.5">{children(errors)}</div>

      <div className="mt-10 flex items-center gap-2">
        <button type="button" className={`${btnPrimaryCls} min-w-37.5`} onClick={handleContinue}>
          Continue <ArrowRightIcon size={17} />
        </button>
        <button type="button" className={btnLinkCls} onClick={handleBack}>
          Back
        </button>
      </div>

      <p className="mt-6 flex items-center gap-2 text-xs text-neutral-400">
        <LockIcon size={14} /> Your progress is saved automatically.
      </p>
    </div>
  );
}
