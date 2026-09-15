"use client";

import { useEffect, useRef } from "react";
import { ArkRideMark } from "@/components/brand/ArkRideMark";
import { INTRO_SEEN_KEY } from "./intro";

/**
 * The splash the app opens with, played once on the waitlist page.
 *
 * FROM THE FILE
 * "welcome screen 16" → "welcome screen 4" is the mark's only prototyped
 * motion: after a 2.0s timeout, a 300ms Smart Animate with Figma's
 * ease-in-and-out, cubic-bezier(0.42, 0, 0.58, 1).
 *
 *   start   white mark on black. On a phone the mark is 143 of 393 wide,
 *           centred, its middle 45.614% down. The landscape brand frame
 *           ("Ark ride load", 2160 × 1040) sets it at 1099 wide, centred on
 *           52.523% across and 49.543% down; that is used from md.
 *   hold    2.0s.
 *   move    300ms: the mark shrinks onto its resting place, which here is
 *           the page's own header logo, measured live. Along the way the ARK
 *           letters settle onto RIDE: at the start they sit 2.04 left and
 *           1.0 up of their resting place, in the mark's own 122-unit
 *           drawing. That is the difference between the two logo frames'
 *           layer positions, scaled to this drawing.
 *
 * FOR THE WEB
 * The splash's backdrop is black and the page is #F9F9F9, so the backdrop
 * fades out as the mark flies, and the mark goes from white to the header's
 * black. The page content comes up 24px and fades in over the same 300ms,
 * the web form of the file's content sliding up into place.
 *
 * A marketing page cannot make everyone wait two seconds every time, so:
 * it plays once per browser session, never for reduced-motion users, and
 * any tap, click or key skips straight to the move. The overlay swallows
 * that first click so nothing under it gets pressed by accident.
 *
 * WHY THE MOVE ANIMATES left / top / width, NOT A SCALE TRANSFORM
 * A `scale()` transition hands the SVG to the compositor, which rasterises it
 * once at its large starting size and shrinks that bitmap every frame. The
 * shrunk edges come out heavier and softer than the header logo drawn at its
 * real size, so the frame where one is swapped for the other visibly pops, and
 * the thin diagonal crosswalk strokes shimmer on the way down. Measured before
 * this change: 12.8% of the stripe pixels changed at the swap. Animating the
 * box itself re-draws the vector natively every frame (one fixed element in its
 * own overlay, so the layout cost is trivial) and the last frame is drawn
 * exactly as the header logo is, so the swap is invisible.
 */

const HOLD_MS = 2000;
const MOVE_MS = 300;
const EASE = "cubic-bezier(0.42, 0, 0.58, 1)";

declare global {
  interface Window {
    __arkIntroAt?: number;
  }
}

export function LogoIntro({ targetId }: { targetId: string }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (root.getAttribute("data-intro") !== "hold") return;

    try {
      sessionStorage.setItem(INTRO_SEEN_KEY, "1");
    } catch {
      // Storage refused: the intro still plays this once.
    }

    const timers: number[] = [];
    let revealed = false;

    const reveal = () => {
      if (revealed) return;
      revealed = true;
      window.removeEventListener("pointerdown", reveal, true);
      window.removeEventListener("keydown", reveal, true);

      const overlay = overlayRef.current;
      const mark = overlay?.querySelector<SVGSVGElement>("svg");
      const ark = mark?.querySelector<SVGGElement>("[data-ark]");
      const target = document.getElementById(targetId);

      if (overlay && mark && target) {
        const from = mark.getBoundingClientRect();
        const to = target.getBoundingClientRect();
        const origin = overlay.getBoundingClientRect();
        const transition = `${MOVE_MS}ms ${EASE}`;

        // Pin the mark where it already is, in plain pixels and without the
        // centring translate, so the move can run on left / top / width.
        mark.style.transition = "none";
        mark.style.translate = "none";
        mark.style.left = `${from.left - origin.left}px`;
        mark.style.top = `${from.top - origin.top}px`;
        mark.style.width = `${from.width}px`;
        // Commit that starting box before the transition is declared.
        void mark.getBoundingClientRect();

        mark.style.transition = [
          `left ${transition}`,
          `top ${transition}`,
          `width ${transition}`,
          `color ${transition}`,
        ].join(", ");
        mark.style.left = `${to.left - origin.left}px`;
        mark.style.top = `${to.top - origin.top}px`;
        mark.style.width = `${to.width}px`;
        mark.style.color = getComputedStyle(target).color;
        if (ark) {
          ark.style.transition = `transform ${transition}`;
          ark.style.transform = "translate(0px, 0px)";
        }
        overlay.style.transition = `background-color ${transition}`;
        overlay.style.backgroundColor = "transparent";
      }

      root.setAttribute("data-intro", "reveal");
      timers.push(
        window.setTimeout(() => root.removeAttribute("data-intro"), MOVE_MS + 40),
      );
    };

    const shownFor = performance.now() - (window.__arkIntroAt ?? performance.now());
    timers.push(window.setTimeout(reveal, Math.max(0, HOLD_MS - shownFor)));
    window.addEventListener("pointerdown", reveal, true);
    window.addEventListener("keydown", reveal, true);

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
      window.removeEventListener("pointerdown", reveal, true);
      window.removeEventListener("keydown", reveal, true);
    };
  }, [targetId]);

  return (
    <div
      ref={overlayRef}
      aria-hidden
      className="fixed inset-0 z-[70] hidden bg-black [html[data-intro]_&]:block [html[data-intro=hold]_&]:pointer-events-auto [html[data-intro=reveal]_&]:pointer-events-none"
    >
      <ArkRideMark
        className="absolute top-[45.614%] left-1/2 h-auto w-[36.387%] origin-top-left -translate-x-1/2 -translate-y-1/2 text-white md:top-[49.543%] md:left-[52.523%] md:w-[50.88%]"
        arkProps={{ style: { transform: "translate(-2.04px, -1px)" } }}
      />
    </div>
  );
}
