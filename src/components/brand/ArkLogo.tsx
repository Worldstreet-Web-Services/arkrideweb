/**
 * The ARK RIDE logo.
 *
 * Ported from `arkride-mobile/src/components/brand/ArkLogo.tsx` (Figma node
 * 153:6983, 78 × 28): the ARK wordmark with the speed swoosh rising over it,
 * and the slanted RIDE beneath. This replaced the older ARK-only wordmark
 * (node 4:3059, 185 × 37) that this file used to carry.
 *
 * ONE DELIBERATE DIFFERENCE FROM THE MOBILE SOURCE
 *
 * Mobile positions the two groups with `<G translate="0, 1">` and
 * `<G translate="29.1, 20">`. That works in react-native-svg, which accepts
 * `translate` as a prop — but `translate` IS NOT AN SVG ATTRIBUTE. A browser
 * ignores it silently, and copying it verbatim would stack RIDE on top of ARK
 * at the origin with no error anywhere.
 *
 * The web mark therefore uses `transform="translate(x y)"`. Same geometry,
 * valid SVG: ARK occupies y 2.94–15.22 and RIDE y 20–27.75, both inside the
 * 78 × 28 box.
 *
 * Colour is `currentColor`, so the mark inherits from whatever contains it —
 * ink in the navbar, white over the dark panel, black on the amber splash.
 * Mobile threads a `color` prop for the same reason; on web the cascade does it.
 */
/**
 * `title` is deliberately NOT defaulted. Most placements sit beside a visible
 * "Arkride" wordmark in text, where a second accessible name is noise — those
 * pass `aria-hidden`. A standalone mark (the navbar link, the footer) passes a
 * title and gets `role="img"`. Defaulting it would make every `aria-hidden`
 * call site contradict itself.
 */
export function ArkLogo({
  className,
  title,
  ...props
}: React.SVGProps<SVGSVGElement> & { title?: string }) {
  return (
    <svg
      viewBox="0 0 78 28"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {title ? <title>{title}</title> : null}

      {/* ARK, with the swoosh sweeping up to the right. */}
      <g transform="translate(0 1)" fill="currentColor">
        <path d="M0 14.216L9.69231 1.93906H14L23.9077 14.216H18.9538L17.8769 12.4929L9.04615 10.3391H16.1538L11.8462 5.16983L4.52308 14.216H0Z" />
        <path d="M25.2 2.15313V14.2147H29.2923V4.30697H39.6827C40.2864 4.30697 40.8311 4.66901 41.0648 5.22556C41.1914 5.52753 41.1919 5.83212 41.0674 6.13969C40.8292 6.72424 40.261 7.10634 39.6297 7.10634C37.5592 7.10699 31.2308 7.10697 31.2308 7.10697L40.4923 14.2147H45.6615L38.9846 9.26082H42C42 9.26082 45.1375 8.94549 45.0154 5.59928C44.8928 2.2382 41.5692 2.15313 41.5692 2.15313H25.2Z" />
        <path d="M48.677 2.15313V9.26082L52.9847 7.32236V2.15313H48.677Z" />
        <path d="M48.6771 9.90769C57.6642 6.1012 67.3001 2.81077 77.5386 0L52.9847 10.9846V14.2154H48.6771V9.90769Z" />
        <path d="M56.6461 10.3387L60.0923 8.61563L68.2769 14.2156H62.4615L56.6461 10.3387Z" />
      </g>

      {/* RIDE — five slanted strokes, set beneath and right-aligned. */}
      <g transform="translate(29.1 20)" fill="currentColor">
        <path d="M9.90769 0H13.5692L6.24615 7.75385H0L9.90769 0Z" />
        <path d="M16.3691 0H20.0306L16.5845 7.75385H10.9845L16.3691 0Z" />
        <path d="M22.8306 0H26.4921L26.9229 7.75385H21.1075L22.8306 0Z" />
        <path d="M29.0769 0H32.7384L37.9076 7.75385H31.8769L29.0769 0Z" />
        <path d="M35.5383 0.00078125H39.4153L48.8922 7.75463H42.4306L35.5383 0.00078125Z" />
      </g>
    </svg>
  );
}
