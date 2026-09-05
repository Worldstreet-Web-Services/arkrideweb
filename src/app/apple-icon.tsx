import { ImageResponse } from "next/og";

/**
 * iOS home-screen icon.
 *
 * Generated rather than shipped as `apple-icon.svg`, because Next only accepts
 * png/jpg for this convention — an SVG here is silently ignored and no icon
 * ships at all, with nothing in the build output to say so.
 *
 * Square with NO corner radius on purpose: iOS applies its own mask, and a
 * pre-rounded icon is rounded twice, leaving amber corners outside the mask.
 * The tab favicon (`icon.svg`) does carry a radius, because nothing masks it.
 */
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#f3ba3f",
        }}
      >
        {/* 63% of the canvas — Apple's guidance is roughly 60-70%. */}
        <svg width="113" height="58" viewBox="0 0 23.9077 12.27694" fill="none">
          <g transform="translate(0 -1.93906)" fill="#152531">
            <path d="M0 14.216L9.69231 1.93906H14L23.9077 14.216H18.9538L17.8769 12.4929L9.04615 10.3391H16.1538L11.8462 5.16983L4.52308 14.216H0Z" />
          </g>
        </svg>
      </div>
    ),
    size,
  );
}
