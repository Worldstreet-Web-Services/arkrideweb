import { ImageResponse } from "next/og";

/**
 * The social card.
 *
 * This exists because `metadata.twitter.card` was already set to
 * `summary_large_image` with NO image anywhere — which is worse than declaring
 * nothing. A large-image card with a missing image renders as a broken panel,
 * so every share of the site looked like a dead link.
 *
 * Next serves this at a hashed URL and injects the `og:image` and
 * `twitter:image` tags automatically, so no metadata entry has to name a file
 * that might later stop existing.
 *
 * Drawn rather than shipped as a PNG: the mark is vector, the palette is in
 * the design tokens, and a rendered card cannot drift from either the way a
 * hand-exported image does.
 */
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ArkRide — move at the speed of now";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          // Brand ink. Satori has no CSS variables, so the tokens are
          // written out here — the only place in the app that repeats them.
          background: "#152531",
          padding: "72px 80px",
        }}
      >
        {/* The swoosh, enlarged as a ground graphic. It is the one gesture in
            the mark that carries motion, so it earns the space. */}
        <div
          style={{
            position: "absolute",
            top: -80,
            right: -120,
            display: "flex",
            opacity: 0.16,
          }}
        >
          <svg width="900" height="450" viewBox="0 0 78 28" fill="none">
            <path
              d="M48.6771 9.90769C57.6642 6.1012 67.3001 2.81077 77.5386 0L52.9847 10.9846V14.2154H48.6771V9.90769Z"
              fill="#f3ba3f"
            />
            <path
              d="M56.6461 10.3387L60.0923 8.61563L68.2769 14.2156H62.4615L56.6461 10.3387Z"
              fill="#f3ba3f"
            />
          </svg>
        </div>

        <div style={{ display: "flex" }}>
          <svg width="234" height="84" viewBox="0 0 78 28" fill="none">
            <g transform="translate(0 1)" fill="#f3ba3f">
              <path d="M0 14.216L9.69231 1.93906H14L23.9077 14.216H18.9538L17.8769 12.4929L9.04615 10.3391H16.1538L11.8462 5.16983L4.52308 14.216H0Z" />
              <path d="M25.2 2.15313V14.2147H29.2923V4.30697H39.6827C40.2864 4.30697 40.8311 4.66901 41.0648 5.22556C41.1914 5.52753 41.1919 5.83212 41.0674 6.13969C40.8292 6.72424 40.261 7.10634 39.6297 7.10634C37.5592 7.10699 31.2308 7.10697 31.2308 7.10697L40.4923 14.2147H45.6615L38.9846 9.26082H42C42 9.26082 45.1375 8.94549 45.0154 5.59928C44.8928 2.2382 41.5692 2.15313 41.5692 2.15313H25.2Z" />
              <path d="M48.677 2.15313V9.26082L52.9847 7.32236V2.15313H48.677Z" />
              <path d="M48.6771 9.90769C57.6642 6.1012 67.3001 2.81077 77.5386 0L52.9847 10.9846V14.2154H48.6771V9.90769Z" />
              <path d="M56.6461 10.3387L60.0923 8.61563L68.2769 14.2156H62.4615L56.6461 10.3387Z" />
            </g>
            <g transform="translate(29.1 20)" fill="#f3ba3f">
              <path d="M9.90769 0H13.5692L6.24615 7.75385H0L9.90769 0Z" />
              <path d="M16.3691 0H20.0306L16.5845 7.75385H10.9845L16.3691 0Z" />
              <path d="M22.8306 0H26.4921L26.9229 7.75385H21.1075L22.8306 0Z" />
              <path d="M29.0769 0H32.7384L37.9076 7.75385H31.8769L29.0769 0Z" />
              <path d="M35.5383 0.00078125H39.4153L48.8922 7.75463H42.4306L35.5383 0.00078125Z" />
            </g>
          </svg>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              display: "flex",
              fontSize: 76,
              fontWeight: 800,
              color: "#ffffff",
              letterSpacing: "-0.03em",
              lineHeight: 1.05,
            }}
          >
            Move at the speed of now.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 32,
              color: "rgba(255,255,255,0.66)",
              letterSpacing: "-0.01em",
            }}
          >
            Keke, okada and cars across Lagos — and 95% of every fare to the
            people driving.
          </div>
        </div>

        {/* A rule in the brand amber, anchoring the card. */}
        <div
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: "100%",
            height: 12,
            background: "#f3ba3f",
            display: "flex",
          }}
        />
      </div>
    ),
    size,
  );
}
