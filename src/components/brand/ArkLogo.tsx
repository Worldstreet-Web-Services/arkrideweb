/**
 * The ARK wordmark.
 *
 * The same five paths the mobile app renders (`arkride-mobile/src/components/
 * brand/ArkLogo.tsx`, extracted from Figma node 4:3059), so web and app show a
 * byte-identical mark rather than two traced approximations.
 *
 * Colour comes from `currentColor`, so it inherits from whatever it sits in —
 * black on the amber splash, white over photography, ink in the navbar. Mobile
 * threads a `color` prop for the same reason; on web the cascade already does
 * it.
 *
 * NOTE: mobile sets `preserveAspectRatio="none"`, which lets the mark stretch.
 * That is not wanted here — the web mark keeps its ratio and is sized by width
 * alone.
 */
interface ArkLogoProps {
  /** Rendered width in px. Height follows the 185.665 x 37 ratio. */
  width?: number;
  className?: string;
  /** Decorative when a text label sits beside it. */
  title?: string;
}

const RATIO = 37 / 185.665;

export function ArkLogo({ width = 120, className, title }: ArkLogoProps) {
  return (
    <svg
      width={width}
      height={Math.round(width * RATIO * 100) / 100}
      viewBox="0 0 185.665 37"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
    >
      {title ? <title>{title}</title> : null}
      <path d="M138.141 21.491L130.497 26.0329L146.117 36.7784H159.078L138.141 21.491Z" fill="currentColor" />
      <path d="M112.994 37V25.1467C129.301 13.3599 168.236 3.47106 185.665 0C155.71 8.24192 130.719 22.7834 121.967 29.024V37H112.994Z" fill="currentColor" />
      <path d="M113.216 22.3772V4.54192H121.967V17.503L113.216 22.3772Z" fill="currentColor" />
      <path d="M59.488 36.7784H67.9072V10.1916H89.9521C92.3382 10.1916 94.2725 12.1259 94.2725 14.512C94.2725 16.898 92.3382 18.8323 89.9521 18.8323H72.6707L95.1587 36.7784H106.015L89.8413 24.3713H93.9955C99.4101 24.3713 103.799 19.9819 103.799 14.5674V14.2904C103.799 9.02883 99.534 4.76347 94.2725 4.76347H59.488V36.7784Z" fill="currentColor" />
      <path d="M10.4132 36.7784L27.1407 12.7395L37.1108 26.476H19.2754L41.8742 33.012L45.0868 36.7784H54.503L30.4641 4.87425H23.1527L0 36.7784H10.4132Z" fill="currentColor" />
    </svg>
  );
}
