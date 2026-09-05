/**
 * The ArkRide logomark — the "A" from the wordmark, cropped square.
 *
 * WHY THIS IS A CROP AND NOT A NEW DRAWING
 *
 * The mobile app ships no icon: `icon.png`, `splash-icon.png`,
 * `android-icon-foreground.png` and `favicon.png` are all 1×1 pixel
 * placeholders. The only real brand artwork anywhere is the wordmark
 * (`assets/ark-logo.svg`), so there was nothing square to inherit and a mark
 * had to be derived rather than copied.
 *
 * Inventing one would have produced a symbol with no relationship to the
 * wordmark. This is instead the wordmark's own "A" — path 4 of five, verbatim
 * — so the icon and the logotype are literally the same letter, and the mark
 * stays correct if the wordmark is ever redrawn.
 *
 * It also replaces the hand-typed "A" in a rounded square that stood in for a
 * logo in the admin and verification headers.
 *
 * THE TRANSFORM
 *
 * The glyph occupies x 0→23.908, y 1.939→14.216 in the logo's coordinate
 * space — wider than it is tall. Scaled by 1.67312 it becomes 40×20.54, and
 * translating by (12, 18.485) centres it in a 64×64 box with 21.73 above and
 * 21.73 below. Optically centred, not just numerically.
 */
export function ArkMark({
  className,
  title,
  ...props
}: React.SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {title ? <title>{title}</title> : null}
      <g transform="translate(12 18.485) scale(1.67312)">
        <path
          fill="currentColor"
          d="M0 14.216L9.69231 1.93906H14L23.9077 14.216H18.9538L17.8769 12.4929L9.04615 10.3391H16.1538L11.8462 5.16983L4.52308 14.216H0Z"
        />
      </g>
    </svg>
  );
}
