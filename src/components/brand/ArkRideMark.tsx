/**
 * The ARK RIDE lock-up as the website design draws it.
 *
 * This is the exported vector of the logo frame on the waitlist page
 * (`Frame 2147230545`, 122 × 38 including the RIDE strokes), path for path.
 * It is NOT the same drawing as `ArkLogo` — that one is ported from the
 * mobile app's 78 × 28 mark and has different letter geometry; the website
 * design was drawn against this one, so the website uses this one. Keeping
 * both is deliberate: swapping the marketing site's mark is a brand decision,
 * not a side effect of building one page.
 *
 * The five RIDE letters carry a 0.29px outline in the source, which is why
 * they take a `stroke` here and the ARK letters do not.
 *
 * Colour is `currentColor`, same convention as `ArkLogo`: the design shows it
 * black on white, and the container's `color` decides.
 */
import { LOOP_MS, RIDE_TRACK, STRIPE_TRACKS } from "./arkRideMarkLoop";

/** SMIL tracks wait for `beginElement()`; see WaitlistLogo. */
const loopTiming = {
  begin: "indefinite",
  dur: `${LOOP_MS}ms`,
  repeatCount: "indefinite",
  calcMode: "linear",
} as const;

export function ArkRideMark({
  className,
  title,
  arkProps,
  loop = false,
  ...props
}: React.SVGProps<SVGSVGElement> & {
  title?: string;
  /**
   * Include the crosswalk loop the Figma prototype runs on the waitlist logo:
   * the stripes spring up into place one by one, RIDE darkens, and the row
   * resets every 2 seconds. The tracks are inert until something calls
   * `beginElement()` on them, so the mark renders static without JavaScript.
   * Timings and the reasoning live in arkRideMarkLoop.ts.
   */
  loop?: boolean;
  /**
   * Props for the group holding the A, R, K and the swoosh — the part the
   * splash animation settles onto RIDE. Rendering is unchanged without it.
   */
  arkProps?: React.SVGProps<SVGGElement>;
}) {
  const outlined = { stroke: "currentColor", strokeWidth: 0.293186 };
  return (
    <svg
      viewBox="0 0 122 38"
      role={title ? "img" : "presentation"}
      aria-hidden={title ? undefined : true}
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      {...props}
    >
      {title ? <title>{title}</title> : null}

      {/* A R K with the swoosh. */}
      <g data-ark {...arkProps}>
        <path d="M93.4194 13.9251L88.8225 16.6567L98.2162 23.119H106.011L93.4194 13.9251Z" />
        <path d="M78.2959 23.2537V16.1251C88.1027 9.03649 111.518 3.08933 122 1.00182C103.986 5.95853 88.9555 14.7038 83.6923 18.4569V23.2537H78.2959Z" />
        <path d="M78.4292 14.4608V3.73455H83.6924V11.5294L78.4292 14.4608Z" />
        <path d="M48.4839 23.1213H53.5473V7.13188H66.8051C68.2401 7.13188 69.4034 8.29517 69.4034 9.73016C69.4034 11.1651 68.2401 12.3284 66.8051 12.3284H56.412L69.9364 23.1213H76.4654L66.7385 15.6596H69.2369C72.4932 15.6596 75.1329 13.0198 75.1329 9.76347V9.59691C75.1329 6.43258 72.5677 3.86738 69.4034 3.86738H48.4839V23.1213Z" />
        <path d="M20.1542 23.1189L30.2142 8.66179L36.2102 16.923H25.484L39.075 20.8537L41.0071 23.1189H46.67L32.2129 3.93159H27.8158L13.8917 23.1189H20.1542Z" />
      </g>

      {/* The five slanted strokes beneath, in file order right to left. */}
      <path d="M60.5973 30.8236L54.5851 25.3681H49.4079L59.3169 36.9472H67.9456L60.5973 30.8236Z" {...outlined}>
        {loop ? (
          <>
            <animate attributeName="opacity" {...loopTiming} keyTimes={STRIPE_TRACKS[0].opacity.keyTimes} values={STRIPE_TRACKS[0].opacity.values} />
            <animateTransform attributeName="transform" type="translate" {...loopTiming} keyTimes={STRIPE_TRACKS[0].translate.keyTimes} values={STRIPE_TRACKS[0].translate.values} />
          </>
        ) : null}
      </path>
      <path d="M44.5092 25.3681L41.6421 25.4414H38.9424L41.0058 30.7193L43.1175 37.0029H47.237L51.0225 36.8359L47.6824 30.7926L44.5092 25.3681Z" {...outlined}>
        {loop ? (
          <>
            <animate attributeName="opacity" {...loopTiming} keyTimes={STRIPE_TRACKS[1].opacity.keyTimes} values={STRIPE_TRACKS[1].opacity.values} />
            <animateTransform attributeName="transform" type="translate" {...loopTiming} keyTimes={STRIPE_TRACKS[1].translate.keyTimes} values={STRIPE_TRACKS[1].translate.values} />
          </>
        ) : null}
      </path>
      <path d="M35.8316 25.3687L33.5427 25.3681H31.0376L29.9242 30.5944L28.5325 36.8915H32.4293H36.1591L35.8316 25.3687Z" {...outlined}>
        {loop ? (
          <>
            <animate attributeName="opacity" {...loopTiming} keyTimes={STRIPE_TRACKS[2].opacity.keyTimes} values={STRIPE_TRACKS[2].opacity.values} />
            <animateTransform attributeName="transform" type="translate" {...loopTiming} keyTimes={STRIPE_TRACKS[2].translate.keyTimes} values={STRIPE_TRACKS[2].translate.values} />
          </>
        ) : null}
      </path>
      <path d="M28.0868 25.3681H25.5544H22.9653L19.3468 30.935L15.5613 36.8915H19.4935H22.9653L25.359 31.269L28.0868 25.3681Z" {...outlined}>
        {loop ? (
          <>
            <animate attributeName="opacity" {...loopTiming} keyTimes={STRIPE_TRACKS[3].opacity.keyTimes} values={STRIPE_TRACKS[3].opacity.values} />
            <animateTransform attributeName="transform" type="translate" {...loopTiming} keyTimes={STRIPE_TRACKS[3].translate.keyTimes} values={STRIPE_TRACKS[3].translate.values} />
          </>
        ) : null}
      </path>
      <path d="M17.0162 25.37L14.755 25.37L8.28527 30.6929L0.419969 36.9473H5.48583H9.49399L19.7927 25.3681L17.0162 25.37Z" {...outlined}>
        {loop ? (
          <>
            <animate attributeName="opacity" {...loopTiming} keyTimes={STRIPE_TRACKS[4].opacity.keyTimes} values={STRIPE_TRACKS[4].opacity.values} />
            <animateTransform attributeName="transform" type="translate" {...loopTiming} keyTimes={STRIPE_TRACKS[4].translate.keyTimes} values={STRIPE_TRACKS[4].translate.values} />
          </>
        ) : null}
      </path>

      {/* R I D E */}
      <g>
        {loop ? (
          <animate attributeName="opacity" {...loopTiming} keyTimes={RIDE_TRACK.keyTimes} values={RIDE_TRACK.values} />
        ) : null}
      <path d="M73.29 37.0009V25.37H78.4465C78.8878 25.37 79.288 25.4126 79.6472 25.4977C80.0166 25.5828 80.345 25.7104 80.6323 25.8806C80.9196 26.0508 81.1608 26.2635 81.3558 26.5188C81.5507 26.7634 81.6995 27.0506 81.8021 27.3803C81.9048 27.6994 81.9561 28.061 81.9561 28.4652C81.9561 29.1778 81.7816 29.7841 81.4327 30.284C81.0941 30.7733 80.5912 31.1137 79.9242 31.3051V31.4009C80.3655 31.4753 80.7144 31.6136 80.9709 31.8157C81.2377 32.0071 81.4276 32.2624 81.5405 32.5815C81.6636 32.9006 81.7252 33.2835 81.7252 33.7302V35.7724C81.7252 35.9639 81.7303 36.1606 81.7406 36.3627C81.7611 36.5648 81.8175 36.7775 81.9099 37.0009H80.5861C80.5143 36.8307 80.463 36.6446 80.4322 36.4425C80.4117 36.2404 80.4014 36.0011 80.4014 35.7245V33.9695C80.4014 33.5441 80.3398 33.1931 80.2167 32.9165C80.1038 32.6294 79.8934 32.4166 79.5856 32.2784C79.2777 32.1294 78.8416 32.055 78.2772 32.055H74.429V30.9222H78.1695C79.052 30.9222 79.6779 30.7148 80.0474 30.3C80.4271 29.8745 80.6169 29.3321 80.6169 28.6726C80.6169 28.3003 80.5605 27.9813 80.4476 27.7153C80.3347 27.4388 80.1654 27.2154 79.9396 27.0453C79.7241 26.8644 79.4676 26.7368 79.17 26.6623C78.8724 26.5773 78.5389 26.5347 78.1695 26.5347H74.5983V37.0009H73.29Z" />
      <path d="M84.1581 37.0009V25.37H85.4665V37.0009H84.1581Z" />
      <path d="M88.0514 37.0009V25.37H92.4537C93.5209 25.37 94.4291 25.6147 95.1782 26.1039C95.9273 26.5826 96.4969 27.258 96.8868 28.1302C97.287 29.0023 97.4871 30.0234 97.4871 31.1934C97.4871 32.0656 97.3742 32.858 97.1485 33.5707C96.9227 34.2833 96.5943 34.8949 96.1633 35.4054C95.7323 35.916 95.2039 36.3095 94.5779 36.5861C93.9622 36.8626 93.2541 37.0009 92.4537 37.0009H88.0514ZM89.3597 35.8043H92.2998C92.8847 35.8043 93.4132 35.7086 93.8852 35.5171C94.3573 35.315 94.7626 35.0172 95.1012 34.6237C95.4399 34.2301 95.6964 33.7462 95.8709 33.1718C96.0556 32.5868 96.148 31.9167 96.148 31.1615C96.148 30.1404 95.9838 29.2895 95.6554 28.6088C95.3373 27.9281 94.8909 27.4175 94.3162 27.0772C93.7416 26.7368 93.0694 26.5666 92.2998 26.5666H89.3597V35.8043Z" />
      <path d="M99.5208 37.0009V25.37H107.233V26.5666H100.521L100.829 26.2475V36.1074L100.521 35.7884H107.248V37.0009H99.5208ZM100.521 31.6083V30.4914H106.478V31.6083H100.521Z" />
      </g>
    </svg>
  );
}
