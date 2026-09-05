"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { useVerification } from "../store/VerificationProvider";
import { STEPS, stepIndexById } from "../steps";
import type { FieldErrors } from "../types";
import { btnLinkCls, btnPrimaryCls } from "../ui";
import { ArrowRightIcon, LockIcon } from "./icons";

/**
 * Wraps a single verification step: renders the title, the form fields (given
 * the current errors), and the Back/Continue nav. Continue runs the step's
 * validator — on failure it surfaces inline errors and moves focus to the
 * error summary rather than advancing; on success it routes to the next step
 * (or Review at the end).
 *
 * ACCESSIBILITY NOTES
 *
 * Failing validation used to only call `window.scrollTo`. For anyone not
 * looking at the screen, pressing Continue did nothing observable: focus
 * stayed on a button that no longer did anything, nothing was announced, and
 * the page did not move. The error summary is now focusable and focused on
 * failure, and carries `role="alert"` so it is read out.
 *
 * On success, focus moves to the new step's heading. Next's client-side
 * navigation leaves focus on the unmounted button, which drops the user back
 * to the top of the document — so a keyboard user re-tabbed the entire header
 * on each of the nine steps.
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
  const { data, saveError } = useVerification();
  const router = useRouter();
  const [errors, setErrors] = useState<FieldErrors>({});
  const headingRef = useRef<HTMLHeadingElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

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
      return;
    }
    // Focus lands on the summary so it is both announced and scrolled into
    // view; `preventScroll` then a smooth scroll avoids the jarring instant
    // jump the browser would otherwise do.
    errorRef.current?.focus({ preventScroll: true });
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const hasErrors = Object.keys(errors).length > 0;

  // Move focus to the heading whenever the step changes, so each step starts
  // at its own beginning rather than wherever the previous one left off.
  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true });
  }, [stepId]);

  return (
    <div key={stepId} className="step-in">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-text-subtle">
        Step {idx + 1} of {STEPS.length}
      </p>
      <h1
        ref={headingRef}
        tabIndex={-1}
        className="mt-1 text-2xl font-bold tracking-tight text-text outline-none"
      >
        {step.title}
      </h1>
      {subtitle && <p className="mt-1.5 text-[15px] text-text-muted">{subtitle}</p>}

      <div
        ref={errorRef}
        tabIndex={-1}
        role="alert"
        aria-live="assertive"
        className="outline-none empty:hidden"
      >
        {hasErrors && (
          <div className="mt-5 rounded-2xl border border-danger-border bg-danger-tint px-4 py-3 text-sm font-medium text-danger">
            {Object.keys(errors).length === 1
              ? "One field needs attention before you can continue."
              : `${Object.keys(errors).length} fields need attention before you can continue.`}
          </div>
        )}
      </div>

      {/*
        A failed autosave is reported where the driver is working, not
        silently discarded. `role="status"` rather than "alert": it is
        important, but it should not interrupt someone mid-sentence.
      */}
      {saveError && (
        <p
          role="status"
          className="mt-5 rounded-2xl border border-warning/30 bg-warning-tint px-4 py-3 text-sm font-medium text-text"
        >
          {saveError}
        </p>
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

      <p className="mt-6 flex items-center gap-2 text-xs text-text-subtle">
        <LockIcon size={14} /> Saved on this device as you go.
      </p>
    </div>
  );
}
