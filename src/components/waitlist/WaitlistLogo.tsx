"use client";

import { useEffect, useRef } from "react";
import { ArkRideMark } from "@/components/brand/ArkRideMark";

/** How long the whole mark shows before the first reset. */
const FIRST_RESET_MS = 400;

/**
 * The waitlist page's header logo, running the Figma crosswalk loop.
 *
 * The loop's SMIL tracks are inert until started here, for three reasons:
 * - The logo intro flies a static mark onto this one. Starting only after the
 *   intro has finished means the handoff lands on an identical, un-animated
 *   drawing, and the first visible change is the loop's own designed reset,
 *   0.4s later.
 * - People who prefer reduced motion get the static mark.
 * - Without JavaScript it simply stays static, instead of looping from a
 *   blank row before the page is interactive.
 */
export function WaitlistLogo({ className }: { className?: string }) {
  const ref = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = ref.current;
    if (!svg) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const tracks = [...svg.querySelectorAll<SVGAnimationElement>("animate, animateTransform")];
    let timer = 0;
    // Every track begins in the same turn, so they share one timeline.
    const start = () => {
      timer = window.setTimeout(() => tracks.forEach((t) => t.beginElement()), FIRST_RESET_MS);
    };

    const root = document.documentElement;
    if (!root.hasAttribute("data-intro")) {
      start();
      return () => window.clearTimeout(timer);
    }
    const observer = new MutationObserver(() => {
      if (root.hasAttribute("data-intro")) return;
      observer.disconnect();
      start();
    });
    observer.observe(root, { attributes: true, attributeFilter: ["data-intro"] });
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return <ArkRideMark ref={ref} id="waitlist-logo" title="Ark Ride" className={className} loop />;
}
