import type { NextConfig } from "next";

/**
 * Security headers.
 *
 * There were none before this: /admin renders scanned government IDs and was
 * framable by any site, with no CSP and a default referrer policy that leaked
 * application URLs to third parties.
 *
 * Every relaxation below is one the app genuinely breaks without. In
 * particular the Privy entries are not optional — the first version of this
 * file allowed only `'self'` and the API in `connect-src`, which blocked
 * Privy's call to `auth.privy.io` for its app config. The SDK's `ready` flag
 * therefore never flipped, and the sign-in button sat on "Loading…" forever
 * with only `TypeError: Failed to fetch` in the console. A CSP that silently
 * disables your login button is worse than no CSP, so these are enumerated
 * rather than left to be discovered.
 */

/** Hosts the Privy SDK contacts, taken from the shipped bundle, not guessed. */
const PRIVY = {
  // Auth API and the embedded-wallet iframe.
  auth: "https://auth.privy.io",
  // RPC endpoints. Wildcarded because the SDK picks a per-chain subdomain.
  rpc: "https://*.rpc.privy.systems wss://*.rpc.privy.systems",
  // Cloudflare Turnstile — Privy's captcha, loaded in a script and an iframe.
  captcha: "https://challenges.cloudflare.com",
  // WalletConnect, reached only if someone picks an external wallet.
  walletconnect:
    "https://explorer-api.walletconnect.com wss://relay.walletconnect.com https://verify.walletconnect.com",
};

function csp(): string {
  const dev = process.env.NODE_ENV !== "production";
  const api = process.env.ARKRIDE_API_URL ?? "http://localhost:4010";

  return [
    "default-src 'self'",
    // 'unsafe-inline': Next injects inline bootstrap and flight data.
    // Removing it needs per-request nonces — worth doing, not a one-liner.
    // 'unsafe-eval' in development only, for Turbopack's HMR runtime.
    `script-src 'self' 'unsafe-inline'${dev ? " 'unsafe-eval'" : ""} ${PRIVY.captcha}`,
    "style-src 'self' 'unsafe-inline'",
    // Document previews are data: URLs; blob: covers the canvas re-encode.
    // The remote hosts serve the Privy modal's app icon (Cloudflare Images,
    // which is where the app config's `icon_url` points) and wallet icons.
    `img-src 'self' data: blob: https://auth.privy.io https://imagedelivery.net https://explorer-api.walletconnect.com`,
    "font-src 'self' data:",
    [
      "connect-src 'self'",
      api,
      PRIVY.auth,
      PRIVY.rpc,
      PRIVY.walletconnect,
      dev ? "ws: http://localhost:*" : "",
    ]
      .filter(Boolean)
      .join(" "),
    // What this page may EMBED. Privy renders its embedded wallet and its
    // captcha in iframes, so 'none' here breaks sign-in.
    `frame-src 'self' ${PRIVY.auth} ${PRIVY.captcha} https://verify.walletconnect.com`,
    // What may embed THIS page. Stays 'none' — /admin showing identity
    // documents inside someone else's page is the clickjacking case, and
    // nothing here is ever legitimately framed.
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    // Privy's iframe needs its own origin as a worker/child context.
    `worker-src 'self' blob:`,
    ...(dev ? [] : ["upgrade-insecure-requests"]),
  ].join("; ");
}

const nextConfig: NextConfig = {
  /**
   * Standalone output for containers.
   *
   * Next traces the modules actually reached and copies them, plus a minimal
   * server, into `.next/standalone`. The runtime image then needs neither the
   * source nor `node_modules` — which matters here, because Privy pulls in
   * roughly 990 packages and a naive image ships all of them.
   */
  output: "standalone",

  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp() },
          // Redundant with frame-ancestors on modern browsers, kept for old ones.
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Send the origin cross-site, never the path — an /admin URL can
          // carry an application id.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            // Camera stays allowed same-origin: the document upload uses it.
            // `publickey-credentials-get` is Privy's passkey support.
            value:
              "camera=(self), microphone=(), geolocation=(self), payment=(), publickey-credentials-get=(self)",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
