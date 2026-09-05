"use client";

import { useCallback, useEffect, useId, useRef, type ReactNode } from "react";

/**
 * A modal dialog that behaves like one.
 *
 * The previous version was a plain `<div>` with a click-to-dismiss backdrop:
 * no `role="dialog"`, no `aria-modal`, no accessible name, no focus trap, no
 * Escape handler and no focus restore. Tab walked straight out of the dialog
 * onto the approve and reject buttons behind it — so a keyboard user could
 * confirm a decision they could not see, on the screen that decides whether
 * someone is allowed to drive.
 */

/** Elements that can hold focus, in DOM order. */
const FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

export function Modal({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const titleId = useId();

  // Whatever had focus when the dialog opened, so it can be given back.
  const restoreTo = useRef<HTMLElement | null>(null);

  const focusables = useCallback(
    () =>
      Array.from(
        panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [],
      ).filter((el) => el.offsetParent !== null || el === document.activeElement),
    [],
  );

  useEffect(() => {
    restoreTo.current = document.activeElement as HTMLElement | null;

    // Move focus in. Prefer whatever the content marked autoFocus (the reason
    // textarea), else the panel itself so the title is announced.
    const auto = panelRef.current?.querySelector<HTMLElement>("[autofocus]");
    (auto ?? panelRef.current)?.focus();

    // The page behind must not scroll under the dialog.
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
      // Give focus back where it came from, or the user is dumped at the top
      // of the document every time they close a dialog.
      restoreTo.current?.focus?.();
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      // Cycle focus within the panel rather than letting it escape behind the
      // overlay onto the decision buttons.
      const items = focusables();
      if (items.length === 0) {
        event.preventDefault();
        return;
      }

      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;

      if (event.shiftKey && (active === first || active === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [onClose, focusables]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      {/*
        Backdrop dismiss stays mouse-only on purpose — it is a convenience, and
        Escape is the keyboard equivalent. A button here would land in the tab
        order ahead of the dialog's own content.
      */}
      <div
        className="absolute inset-0 bg-surface-inverse/40"
        onClick={onClose}
        aria-hidden
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="pop-in relative w-full max-w-md rounded-3xl border border-border bg-surface p-5 shadow-xl outline-none"
      >
        <h2 id={titleId} className="text-lg font-bold text-text">
          {title}
        </h2>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}
