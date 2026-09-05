import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * There were none. `/admin` renders scanned government IDs and was framable by
 * any site, with no CSP and a default referrer policy that leaked application
 * URLs to third parties.
 *
 * The CSP is written for what this app actually does, not copied from a
 * template — every relaxation below is one the app would break without:
 *
 *   'unsafe-inline' in script-src: Next injects inline bootstrap and flight
 *     data. Removing it needs per-request nonces, which is a worthwhile
 *     follow-up but is not a one-line change.
 *   'unsafe-eval' in development only: Turbopack's HMR runtime needs it.
 *   data: in img-src: the whole document flow renders previews from data URLs.
 *   connect-src: the API origin, so the browser can reach it.
 */
function csp(): string {
  const dev = process.env.NODE_ENV !== "production";
  const api = process.env.ARKRIDE_API_URL ?? "http://localhost:4010";

  return [
    "default-src 'self'",
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    // Document previews are data: URLs. blob: covers canvas re-encoding.
    "img-src 'self' data: blob:",
    "font-src 'self' data:",
    `connect-src 'self' ${api}${dev ? " ws: http://localhost:*" : ""}`,
    // Nothing here is ever legitimately framed, and /admin showing identity
    // documents inside someone else's page is the clickjacking case.
    "frame-ancestors 'none'",
    "frame-src 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp() },
          // Redundant with frame-ancestors for modern browsers, kept for old ones.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Send the origin cross-site, never the path — an /admin URL can
          // carry an application id.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            // Camera stays allowed on same-origin: the upload flow uses it.
            value: "camera=(self), microphone=(), geolocation=(self), payment=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
