import "server-only";

import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE, apiFetch } from "./client";
import { ApiError, type Role, type Session } from "./types";

/**
 * Session storage and renewal.
 *
 * Both tokens live in httpOnly cookies — see `client.ts` for why they are not
 * in localStorage. The refresh token additionally gets a narrow `path` so it is
 * only ever sent to the one route that can spend it: a token that is attached
 * to every request is a token with a much larger attack surface than it needs.
 */

/** Matches the backend's access-token TTL (`ACCESS_TOKEN_TTL = '1h'`). */
const ACCESS_MAX_AGE = 60 * 60;

/** Matches `REFRESH_TOKEN_TTL_DAYS = 30`. */
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

/** The only path the refresh cookie is sent to. */
const REFRESH_PATH = "/api/auth";

const isProduction = process.env.NODE_ENV === "production";

const baseCookie = {
  httpOnly: true,
  // Not settable over plain HTTP in dev, or local sign-in silently fails.
  secure: isProduction,
  // `lax` rather than `strict`: `strict` drops the cookie on any top-level
  // navigation from another site, so a user arriving from an email link would
  // appear signed out. `lax` still blocks the cross-site POSTs that matter.
  sameSite: "lax" as const,
};

export async function storeSession(session: Session): Promise<void> {
  const store = await cookies();

  store.set(ACCESS_COOKIE, session.accessToken, {
    ...baseCookie,
    path: "/",
    // Deliberately shorter than the token's own life. An expired cookie makes
    // the app treat the user as signed out and refresh, rather than sending a
    // token the API will reject.
    maxAge: Math.max(session.expiresIn - 30, 60),
  });

  store.set(REFRESH_COOKIE, session.refreshToken, {
    ...baseCookie,
    path: REFRESH_PATH,
    maxAge: REFRESH_MAX_AGE,
  });
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, "", { ...baseCookie, path: "/", maxAge: 0 });
  store.set(REFRESH_COOKIE, "", { ...baseCookie, path: REFRESH_PATH, maxAge: 0 });
}

export async function getAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function getRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}

export async function isSignedIn(): Promise<boolean> {
  return Boolean(await getAccessToken());
}

/**
 * Spend the refresh token for a new session.
 *
 * IMPORTANT: the backend ROTATES on every use and revokes the entire token
 * family if a consumed token is presented again — so this must never be called
 * concurrently for the same user. Two parallel refreshes are indistinguishable
 * from theft on the server and will sign the user out of everything.
 *
 * That is why there is no automatic retry-on-401 inside `apiFetch`: a page with
 * four Server Components would fire four refreshes at once and lock the user
 * out. Renewal is an explicit, single-caller operation.
 *
 * Returns null rather than throwing when the session is simply over, because
 * "your session expired" is a normal state, not an error condition.
 */
export async function refreshSession(): Promise<Session | null> {
  const refreshToken = await getRefreshToken();
  if (!refreshToken) return null;

  try {
    const { data } = await apiFetch<Session>("/auth/refresh", {
      method: "POST",
      auth: false,
      body: { refreshToken },
    });
    await storeSession(data);
    return data;
  } catch (error) {
    // An invalid or already-spent token means the session is finished. Clear
    // the cookies so the user is not left in a half-signed-in state that keeps
    // producing 401s.
    if (error instanceof ApiError) {
      await clearSession();
      return null;
    }
    throw error;
  }
}

/**
 * Sign out.
 *
 * Tells the backend first so the refresh-token family is actually revoked
 * server-side, then clears the cookies. If the call fails the cookies are still
 * cleared — the user asked to sign out, and leaving them signed in because the
 * network blipped is the wrong answer.
 */
export async function signOut(): Promise<void> {
  const refreshToken = await getRefreshToken();

  if (refreshToken) {
    try {
      await apiFetch("/auth/logout", {
        method: "POST",
        auth: false,
        body: { refreshToken },
      });
    } catch {
      // Intentionally swallowed — see above.
    }
  }

  await clearSession();
}

/** The signed-in principal, as far as the client can tell. */
export interface Principal {
  id: string;
  role: Role;
  name?: string;
  email?: string;
}

/**
 * Decode the principal from the access token.
 *
 * This reads the JWT payload WITHOUT verifying the signature, which is safe
 * only because of how it is used: purely to decide what to render — a name in
 * a header, which nav items to show. Every action that matters is authorised by
 * the API against the real token.
 *
 * Never gate anything security-relevant on this. If a page must not be seen by
 * a non-admin, the data behind it has to come from an endpoint that enforces
 * that, not from a client-side check on an unverified claim.
 */
export async function getPrincipal(): Promise<Principal | null> {
  const token = await getAccessToken();
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.sub !== "string") return null;

  // Expired by its own claim — treat as signed out rather than sending it.
  if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
    return null;
  }

  return {
    id: payload.sub,
    role: (payload.role as Role) ?? "user",
    name: typeof payload.name === "string" ? payload.name : undefined,
    email: typeof payload.email === "string" ? payload.email : undefined,
  };
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const segments = token.split(".");
  if (segments.length !== 3) return null;

  try {
    // base64url → base64, then pad. `atob` rejects unpadded input.
    const b64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}
