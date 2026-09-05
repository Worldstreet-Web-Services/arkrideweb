"use client";

import { useId } from "react";

/** A labelled select, wired the same way `Field` wires an input. */
export function SelectField({
  label,
  name,
  options,
  placeholder,
  required,
  defaultValue,
  error,
  hint,
}: {
  label: string;
  name: string;
  options: { value: string; label: string }[];
  placeholder?: string;
  required?: boolean;
  defaultValue?: string;
  error?: string;
  hint?: string;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const describedBy = [hint ? hintId : null, error ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="grid gap-1.5">
      <label htmlFor={id} className="text-[13px] font-semibold text-text">
        {label}
        {required && (
          <>
            <span className="ml-0.5 text-danger" aria-hidden>
              *
            </span>
            <span className="sr-only"> (required)</span>
          </>
        )}
      </label>

      <div className="relative">
        <select
          id={id}
          name={name}
          required={required}
          defaultValue={defaultValue ?? ""}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
          className="h-12 w-full appearance-none rounded-2xl border border-border-input bg-surface pl-4 pr-10 text-base text-text outline-none transition focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/25 aria-[invalid=true]:border-danger"
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <svg
          className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-text-muted"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>

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
