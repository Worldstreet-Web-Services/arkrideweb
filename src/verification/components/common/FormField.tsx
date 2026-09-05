"use client";

import { createContext, useContext, useId, type ReactNode } from "react";
import { errorCls, hintCls, labelCls } from "../../ui";

/**
 * Label + optional hint + error message wrapper for a single control.
 *
 * WHY THE ID COMES FROM CONTEXT
 *
 * This component used to accept an `htmlFor` prop. No caller anywhere passed
 * it, and no control was ever given an `id`, so all ~40 labels in the
 * verification flow were orphans — a screen reader announced the field asking
 * for a NIN number as "edit, blank". There was no `aria-label` fallback and no
 * `aria-describedby`, so `aria-invalid` announced "invalid" with no reason.
 *
 * An optional prop that must be passed correctly forty times will not be
 * passed correctly forty times. So the id is generated here and published on a
 * context that `Input`, `Select`, `Textarea` and `DateField` read
 * automatically. Every existing call site became correctly labelled without
 * changing a line of it, and a new field is labelled by default rather than by
 * remembering.
 */

interface FieldContextValue {
  /** Goes on the control, and on the label's `htmlFor`. */
  id: string;
  /**
   * Id of the label element itself.
   *
   * A composite control — a radiogroup, a file dropzone — cannot be named by
   * `<label for>`, because `for` addresses one control and these are several.
   * Such a control names itself with `aria-labelledby={labelId}` instead.
   */
  labelId: string;
  /** Ids of the hint and/or error text — only those actually rendered. */
  describedBy?: string;
  invalid: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

/**
 * Read the field wiring, if there is any.
 *
 * Returns null outside a `FormField` so the controls stay usable standalone
 * rather than throwing.
 */
export function useFieldContext(): FieldContextValue | null {
  return useContext(FieldContext);
}

export function FormField({
  label,
  hint,
  error,
  required,
  group = false,
  children,
}: {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  /**
   * True when the child is a composite control — a radio group, a file
   * dropzone — rather than one input.
   *
   * The label then omits `htmlFor`, because a `for` pointing at an id that no
   * element carries is invalid and gives assistive tech a dead reference. Such
   * a control names itself with `aria-labelledby={labelId}` instead.
   *
   * This is an explicit prop rather than something the child registers at
   * runtime: a child can only report upward in an effect, which is after the
   * server has already rendered the broken attribute.
   */
  group?: boolean;
  children: ReactNode;
}) {
  const id = useId();
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  const labelId = `${id}-label`;


  // Reference only ids that are actually in the DOM — pointing at a missing
  // element makes assistive tech announce nothing at all.
  const describedBy =
    [error ? errorId : null, !error && hint ? hintId : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <FieldContext.Provider value={{ id, labelId, describedBy, invalid: Boolean(error) }}>
      <div>
        {label && (
          <label id={labelId} className={labelCls} htmlFor={group ? undefined : id}>
            {label}
            {required && (
              <>
                <span className="text-text-subtle" aria-hidden>
                  {" "}
                  *
                </span>
                <span className="sr-only"> (required)</span>
              </>
            )}
          </label>
        )}
        {children}
        {error ? (
          <p id={errorId} className={errorCls}>
            {error}
          </p>
        ) : hint ? (
          <p id={hintId} className={hintCls}>
            {hint}
          </p>
        ) : null}
      </div>
    </FieldContext.Provider>
  );
}
