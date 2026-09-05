"use client";

import { cn } from "@/lib/utils";
import { CheckIcon } from "../icons";
import { useFieldContext } from "./FormField";

interface Option {
  value: string;
  label: string;
}

/**
 * Selectable cards used for ID type, gender, etc. Keyboard + click.
 *
 * The real `<input type="radio">` is `sr-only` and the visible card is drawn
 * as a sibling. That is a normal pattern, but it moves focus onto an element
 * that is visually hidden — so the global `:focus-visible` ring lands on
 * something nobody can see, and keyboard focus in this group was completely
 * invisible. `peer-focus-visible:` on the card restores it, which is why the
 * input has to come FIRST in the DOM: `peer-*` is a following-sibling
 * selector and cannot reach backwards.
 */
export function RadioGroup({
  name,
  value,
  onChange,
  options,
  columns = 1,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  columns?: number;
}) {
  const field = useFieldContext();

  const gridCols =
    columns === 3 ? "grid-cols-3" : columns === 2 ? "grid-cols-2" : "grid-cols-1";

  return (
    <div
      role="radiogroup"
      // Without this the group is announced as an unnamed "radio group" — the
      // question it is asking is only in a <label> that points nowhere.
      aria-labelledby={field?.labelId}
      aria-describedby={field?.describedBy}
      className={cn("grid gap-2.5", gridCols)}
    >
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <label
            key={o.value}
            className="cursor-pointer"
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={selected}
              onChange={() => onChange(o.value)}
              className="peer sr-only"
            />
            <span
              className={cn(
                "flex items-center gap-2.5 rounded-2xl border bg-surface px-3.5 py-3.5 transition-all",
                "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-primary",
                selected
                  ? "border-text bg-surface-hover ring-1 ring-text"
                  : "border-border-input hover:border-border-strong",
              )}
            >
              <span
                className={cn(
                  "grid size-4.5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                  selected ? "border-text" : "border-border-strong",
                )}
                aria-hidden
              >
                {selected && <span className="size-2 rounded-full bg-text" />}
              </span>
              <span
                className={cn(
                  "flex-1 text-[15px]",
                  selected ? "font-semibold text-text" : "text-text-soft",
                )}
              >
                {o.label}
              </span>
              {selected && (
                <CheckIcon size={17} className="shrink-0 text-text" aria-hidden />
              )}
            </span>
          </label>
        );
      })}
    </div>
  );
}
