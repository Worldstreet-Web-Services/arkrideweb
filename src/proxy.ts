import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge gate for the signed-in surfaces.
 *
 * In Next 16 this file is `proxy.ts`. It was `middleware.ts` until the
 * convention was renamed; comments elsewhere in this repo that point at
 * `middleware.ts` describe a file that never existed and would not run here.
 *
 * WHAT THIS IS AND IS NOT
 *
 * A cheap bouncer, not the lock. It only answers "is there a session cookie at
 * all?", which is enough to send an anonymous visitor to the right sign-in
 * page instead of rendering an empty dashboard at them.
 *
 * It deliberately does NOT decide who anyone is. It cannot: the proxy has no
 * access to the signing secret, and a role claim read from an unverified token
 * is worth nothing — anyone can mint a cookie saying `role: admin`.
 * Authorisation happens in the layouts, and for /admin it is delegated to the
 * API, which enforces it against the signed token.
 *
 * Treating an edge check as the security boundary is how these get bypassed.
 * The boundary is the backend. This is a redirect.
 */

const ACCESS_COOKIE = "ark_at";

/** Which sign-in page each guarded area sends people to. */
const SIGN_IN_FOR: { prefix: string; login: string }[] = [
  { prefix: "/admin", login: "/admin/login" },
  { prefix: "/driver", login: "/driver-login" },
  { prefix: "/app", login: "/login" },
];

/** Pages inside a guarded prefix that must stay public. */
const PUBLIC_PATHS = new Set(["/admin/login"]);

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // The sign-in pages themselves must stay reachable, or this loops.
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next();

  const area = SIGN_IN_FOR.find(
    (a) => pathname === a.prefix || pathname.startsWith(`${a.prefix}/`),
  );
  if (!area) return NextResponse.next();

  if (!request.cookies.has(ACCESS_COOKIE)) {
    const login = new URL(area.login, request.url);
    // Only the path is carried, never an absolute URL from the request, so
    // this cannot be turned into an open redirect to another host. The target
    // page validates it again before rendering it into a form.
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  // Scoped to the signed-in areas. Without a matcher this runs on every
  // request including static assets, which is wasteful and a good way to
  // accidentally block your own CSS.
  matcher: ["/admin/:path*", "/driver/:path*", "/app/:path*"],
};
