import type { ReactNode } from "react";
import { errorCls, hintCls, labelCls } from "../../ui";

/** Label + optional hint + error message wrapper for a single control. */
export function FormField({
  label,
  htmlFor,
  hint,
  error,
  required,
  children,
}: {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <div>
      {label && (
        <label className={labelCls} htmlFor={htmlFor}>
          {label}
          {required && <span className="text-neutral-400"> *</span>}
        </label>
      )}
      {children}
      {error ? <p className={errorCls}>{error}</p> : hint ? <p className={hintCls}>{hint}</p> : null}
    </div>
  );
}
