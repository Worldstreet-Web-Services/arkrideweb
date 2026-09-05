"use client";

import { useId } from "react";

/**
 * A labelled form control.
 *
 * WHY THIS EXISTS
 *
 * The verification portal has ~40 inputs and not one of them is associated
 * with its label: its `FormField` accepts an `htmlFor` prop that no caller
 * ever passes, and no input is given an `id`. A screen reader announces the
 * NIN number field as "edit, blank".
 *
 * Making the association impossible to forget is the only fix that holds. This
 * component generates the id itself with `useId` and wires `htmlFor`,
 * `aria-describedby` and `aria-invalid` from one place, so a caller cannot
 * produce an unlabelled input even by accident.
 */

export interface FieldProps {
  label: string;
  name: string;
  type?: "text" | "email" | "password" | "tel" | "number" | "date";
  autoComplete?: string;
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
  /** Rendered under the input, and announced with it. */
  hint?: string;
  inputMode?: "text" | "numeric" | "tel" | "email";
}

export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  placeholder,
  required,
  defaultValue,
  error,
  hint,
  inputMode,
}: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;

  // Only reference ids that are actually rendered — pointing at a missing
  // element makes AT announce nothing at all.
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-text">
        {label}
        {required && (
          <span className="ml-0.5 text-danger" aria-hidden>
            *
          </span>
        )}
        {required && <span className="sr-only"> (required)</span>}
      </label>

      <input
        id={id}
        name={name}
        type={type}
        inputMode={inputMode}
        autoComplete={autoComplete}
        placeholder={placeholder}
        required={required}
        defaultValue={defaultValue}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy || undefined}
        className="h-12 w-full rounded-2xl border border-border-input bg-surface px-4 text-[15px] text-text outline-none transition placeholder:text-text-subtle focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/25 aria-[invalid=true]:border-danger aria-[invalid=true]:focus-visible:ring-danger/25"
      />

      {hint && !error && (
        <p id={hintId} className="text-xs text-text-muted">
          {hint}
        </p>
      )}

      {error && (
        <p id={errorId} className="text-xs font-medium text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
