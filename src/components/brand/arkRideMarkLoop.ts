/**
 * The crosswalk loop the ark ride Figma prototype plays on the waitlist logo.
 *
 * The file's REST data carries no animation for that layer, so this was
 * measured from the prototype itself: change-driven screencasts of the logo
 * over five full loops, each element's presence read against its own vector
 * shape frame by frame, and phase-matched side by side with this page.
 *
 *   loop       2000 ms (measured 1994 / 2005 / 1998 / 2000 / 2001)
 *   at 0       the row resets instantly: stripes gone, RIDE light grey
 *   stripes    each fades in, then rises about 2.5px into place, both on
 *              Figma's "Slow" spring (mass 1, stiffness 80, damping 20): 50%
 *              at 200ms, 83% at 400, 94% at 600, 98% at 800. The fade starts
 *              first: in the prototype a stripe is already visible before it
 *              reaches its resting shape.
 *                                   fade starts   rise starts
 *                middle                 150           511
 *                rightmost              200           438
 *                leftmost               280           640
 *                second from right      560           680
 *                second from left       800          1005
 *              Both were calibrated against the prototype in two measures:
 *              when each stripe first shows and is half visible (the fade),
 *              and when it fills its resting shape (the rise).
 *   RIDE       from 38% to full, from 1100ms, on Figma's "Gentle" spring
 *              (mass 1, stiffness 100, damping 15)
 *
 * It is expressed as SVG <animate> tracks rather than CSS keyframes because a
 * CSS opacity or transform animation on SVG parts is composited and resampled:
 * the stripes and RIDE rendered visibly softer than the static mark, and the
 * intro's handoff to the header logo popped again. SMIL attribute animation is
 * painted in place, so every frame is as crisp as the static logo.
 */

export const LOOP_MS = 2000;
const STEP_MS = 40;

interface Spring {
  mass: number;
  stiffness: number;
  damping: number;
}

/** Figma's spring presets, as its prototype settings define them. */
export const SPRING_SLOW: Spring = { mass: 1, stiffness: 80, damping: 20 };
export const SPRING_GENTLE: Spring = { mass: 1, stiffness: 100, damping: 15 };

/** Step response of a damped spring released from 0 towards 1, at `t` seconds. */
export function springAt(t: number, { mass, stiffness, damping }: Spring): number {
  const w0 = Math.sqrt(stiffness / mass);
  const zeta = damping / (2 * Math.sqrt(stiffness * mass));
  const decay = Math.exp(-zeta * w0 * t);
  if (zeta < 1) {
    const wd = w0 * Math.sqrt(1 - zeta * zeta);
    return 1 - decay * (Math.cos(wd * t) + ((zeta * w0) / wd) * Math.sin(wd * t));
  }
  if (zeta === 1) return 1 - decay * (1 + w0 * t);
  const wd = w0 * Math.sqrt(zeta * zeta - 1);
  return 1 - decay * (Math.cosh(wd * t) + ((zeta * w0) / wd) * Math.sinh(wd * t));
}

const clamp01 = (v: number) => Math.min(1, Math.max(0, v));

/** `keyTimes` and `values` for one SMIL track across the loop. */
function track(startMs: number, spring: Spring, value: (p: number) => string) {
  const keyTimes: string[] = [];
  const values: string[] = [];
  for (let ms = 0; ms <= LOOP_MS; ms += STEP_MS) {
    const p = ms < startMs ? 0 : springAt((ms - startMs) / 1000, spring);
    keyTimes.push((ms / LOOP_MS).toFixed(3));
    values.push(value(p));
  }
  return { keyTimes: keyTimes.join(";"), values: values.join(";") };
}

/** Where a stripe starts, in the mark's own 122-unit drawing (1 page px ≈ 1.151 units at 106px). */
const RISE_DX = 1.73;
const RISE_DY = 2.88;

function stripe(fadeMs: number, riseMs: number) {
  return {
    opacity: track(fadeMs, SPRING_SLOW, (p) => clamp01(p).toFixed(3)),
    translate: track(riseMs, SPRING_SLOW, (p) =>
      `${(RISE_DX * (1 - p)).toFixed(3)} ${(RISE_DY * (1 - p)).toFixed(3)}`,
    ),
  };
}

/** In file order, right to left, matching the five stripe paths in ArkRideMark. */
export const STRIPE_TRACKS = [
  stripe(200, 438), // rightmost
  stripe(560, 680), // second from right
  stripe(150, 511), // middle
  stripe(800, 1005), // second from left
  stripe(280, 640), // leftmost
];

export const RIDE_TRACK = track(1100, SPRING_GENTLE, (p) =>
  (0.38 + 0.62 * clamp01(p)).toFixed(3),
);
