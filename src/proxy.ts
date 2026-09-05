import { NextResponse, type NextRequest } from "next/server";

/**
 * Edge gate for the admin dashboard.
 *
 * In Next 16 this file is `proxy.ts`. It was called `middleware.ts` until the
 * convention was renamed; the stale comments elsewhere in this repo that point
 * at `middleware.ts` are describing a file that never existed and, on this
 * version, would never run.
 *
 * WHAT THIS IS AND IS NOT
 *
 * This is a cheap bouncer, not the lock. It only answers "is there a session
 * cookie at all?", which is enough to send an anonymous visitor to the sign-in
 * page instead of rendering an empty dashboard at them.
 *
 * It deliberately does NOT decide whether the holder is an admin. It cannot:
 * the proxy has no access to the signing secret, and a role claim read out of
 * an unverified token is worth exactly nothing — anyone can mint a cookie that
 * says `role: admin`. Authorisation happens in `src/app/admin/layout.tsx`,
 * which asks the API, and the API enforces it against the signed token.
 *
 * Treating an edge check as the security boundary is how these get bypassed.
 * The boundary is the backend. This is a redirect.
 */

const ACCESS_COOKIE = "ark_at";

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  // The sign-in page itself must stay reachable, or this is a redirect loop.
  if (pathname === "/admin/login") {
    return NextResponse.next();
  }

  if (!request.cookies.has(ACCESS_COOKIE)) {
    const login = new URL("/admin/login", request.url);
    // Come back to where they were headed once they are signed in. Only the
    // path is carried, never an absolute URL from the request, so this cannot
    // be turned into an open redirect to another host.
    login.searchParams.set("next", `${pathname}${search}`);
    return NextResponse.redirect(login);
  }

  return NextResponse.next();
}

export const config = {
  // Scoped to /admin only. Without a matcher this runs on every request
  // including static assets, which is both wasteful and a good way to
  // accidentally block your own CSS.
  matcher: ["/admin/:path*"],
};
