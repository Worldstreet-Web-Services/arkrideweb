"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";

export const ROLE_OPTIONS = [
  { value: "user", label: "User" },
  { value: "driver", label: "Driver" },
] as const;

export type WaitlistRole = (typeof ROLE_OPTIONS)[number]["value"];

/**
 * "User" / "Driver" — who is joining the waitlist.
 *
 * The closed control is the design's Dropdown instance: 149 × 40, white, 1px
 * #E1E1E1 inside stroke, radius 10, 10px padding, the label (Mona Sans 500,
 * 12/16.92) and the exported chevron 10px apart and centred. Its prototype
 * click swaps to the component's "Expanded" variant.
 *
 * That variant is EMPTY in the file — the component set has no drawn children
 * for either state — so the open list has no design. It is built from the
 * closed control's own tokens (same border, radius, face and size) and holds
 * the two roles the rest of the product already has: a rider books, a driver
 * drives. The chevron does not rotate, because nothing in the file says it does.
 *
 * Keyboard: a select-only combobox. Arrow keys open and move, Enter or Space
 * picks, Escape closes, Tab closes and moves on.
 */
export function RoleDropdown({
  name,
  disabled,
}: {
  name: string;
  disabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState<WaitlistRole>("user");
  const [active, setActive] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const listId = useId();

  const selectedIndex = ROLE_OPTIONS.findIndex((o) => o.value === value);
  const selected = ROLE_OPTIONS[selectedIndex];

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  function openList() {
    setActive(selectedIndex);
    setOpen(true);
  }

  function choose(index: number) {
    setValue(ROLE_OPTIONS[index].value);
    setOpen(false);
    buttonRef.current?.focus();
  }

  function onKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    const count = ROLE_OPTIONS.length;
    if (!open) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        openList();
      }
      return;
    }
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive((i) => (i + 1) % count);
        break;
      case "ArrowUp":
        event.preventDefault();
        setActive((i) => (i - 1 + count) % count);
        break;
      case "Enter":
      case " ":
        // Stops the button's own click, which would toggle the list shut
        // again straight after the choice.
        event.preventDefault();
        choose(active);
        break;
      case "Escape":
        event.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  return (
    <div ref={rootRef} className="relative w-full xl:w-[149px] xl:shrink-0">
      <input type="hidden" name={name} value={value} />
      <button
        ref={buttonRef}
        type="button"
        role="combobox"
        aria-label="Joining as"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        aria-activedescendant={open ? `${listId}-${ROLE_OPTIONS[active].value}` : undefined}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : openList())}
        onKeyDown={onKeyDown}
        onKeyUp={(event) => {
          // Space activates a button on key UP; swallow it while the list is
          // open so the choice made on key down is not undone.
          if (event.key === " " && open) event.preventDefault();
        }}
        className="flex h-12 w-full items-center justify-center gap-[10px] rounded-[10px] border border-[#E1E1E1]! bg-white p-[10px] font-(family-name:--font-mona-sans) text-[16px] leading-[16.92px] font-medium text-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-60 xl:h-10 xl:text-[12px]"
      >
        {/*
          The browser sets this label 0.62px higher than the render. Chrome
          snaps text baselines to whole pixels, so a 0.6px nudge rounds to
          nothing; 1px lands it 0.38px low, the closer of the two.
        */}
        <span className="relative xl:top-px">{selected.label}</span>
        <Image
          src="/waitlist/icons/chevron.svg"
          alt=""
          width={11}
          height={6}
          unoptimized
          // The vector is 9.5 × 4.75 in layout; its exported canvas is 11 × 6
          // with the stroke overhanging by 0.28 left/top. Negative margins
          // give layout the 9.5 the file uses.
          className="relative top-[0.34px] -mr-[1.22px] -ml-[0.28px] h-[6px] w-[11px] shrink-0"
        />
      </button>

      <ul
        id={listId}
        role="listbox"
        aria-label="Joining as"
        hidden={!open}
        className="absolute top-[calc(100%+4px)] left-0 z-30 w-full overflow-hidden rounded-[10px] border border-[#E1E1E1]! bg-white py-1"
      >
        {ROLE_OPTIONS.map((option, index) => (
          <li
            key={option.value}
            id={`${listId}-${option.value}`}
            role="option"
            aria-selected={option.value === value}
            // Keep focus on the combobox while the pointer picks.
            onPointerDown={(event) => event.preventDefault()}
            onPointerEnter={() => setActive(index)}
            onClick={() => choose(index)}
            className={`flex h-10 cursor-pointer items-center justify-center font-(family-name:--font-mona-sans) text-[16px] leading-[16.92px] text-black xl:h-8 xl:text-[12px] ${
              index === active ? "bg-[#F9F9F9]" : ""
            } ${option.value === value ? "font-semibold" : "font-medium"}`}
          >
            {option.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
