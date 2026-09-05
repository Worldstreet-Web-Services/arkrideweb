import "server-only";

import { cookies } from "next/headers";
import { ACCESS_COOKIE, REFRESH_COOKIE, apiFetch } from "./client";
import { ApiError, type Role, type Session } from "./types";
import type { Principal } from "./auth";

/**
 * Session storage and renewal.
 *
 * Both tokens live in httpOnly cookies — see `client.ts` for why they are not
 * in localStorage. The refresh token additionally gets a narrow `path` so it is
 * only ever sent to the one route that can spend it: a token attached to every
 * request has a much larger attack surface than it needs.
 */

/** Matches the backend's access-token TTL (`ACCESS_TOKEN_TTL = '1h'`). */
const ACCESS_MAX_AGE = 60 * 60;

/** Matches `REFRESH_TOKEN_TTL_DAYS = 30`. */
const REFRESH_MAX_AGE = 60 * 60 * 24 * 30;

/** The only path the refresh cookie is sent to. */
const REFRESH_PATH = "/api/auth";

/**
 * The cached identity. httpOnly like the others: it holds an email address and
 * a role, and nothing in the browser has a reason to read it directly — the
 * server renders what depends on it.
 */
const PROFILE_COOKIE = "ark_me";

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

/**
 * Persist a session, and optionally the identity that came with it.
 *
 * `principal` is deliberately optional and deliberately NOT cleared when
 * absent. `POST /auth/refresh` returns tokens and nothing else — no user
 * object — so a renewal must leave the cached identity alone. Wiping it here
 * would sign the user's own name out of the header every hour.
 */
export async function storeSession(
  session: Session,
  principal?: Principal | null,
): Promise<void> {
  const store = await cookies();

  store.set(ACCESS_COOKIE, session.accessToken, {
    ...baseCookie,
    path: "/",
    // Deliberately shorter than the token's own life. An expired cookie makes
    // the app treat the user as signed out and refresh, rather than sending a
    // token the API will reject.
    maxAge: Math.max((session.expiresIn ?? ACCESS_MAX_AGE) - 30, 60),
  });

  store.set(REFRESH_COOKIE, session.refreshToken, {
    ...baseCookie,
    path: REFRESH_PATH,
    maxAge: REFRESH_MAX_AGE,
  });

  if (principal) {
    store.set(PROFILE_COOKIE, JSON.stringify(principal), {
      ...baseCookie,
      path: "/",
      // Outlives the access token so it survives a refresh, but dies with the
      // refresh token so it cannot outlive the session it describes.
      maxAge: REFRESH_MAX_AGE,
    });
  }
}

export async function clearSession(): Promise<void> {
  const store = await cookies();
  store.set(ACCESS_COOKIE, "", { ...baseCookie, path: "/", maxAge: 0 });
  store.set(REFRESH_COOKIE, "", { ...baseCookie, path: REFRESH_PATH, maxAge: 0 });
  store.set(PROFILE_COOKIE, "", { ...baseCookie, path: "/", maxAge: 0 });
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
    // No principal argument: refresh returns no user object, and the cached
    // one must survive.
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
 *
 * The API answers 204 with an empty body, which `apiFetch` handles.
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

/**
 * The signed-in principal.
 *
 * Read from the cached profile cookie, but the ID AND ROLE ALWAYS COME FROM
 * THE TOKEN. The profile cookie supplies only display fields — name, email,
 * wallet. That split matters: the token is signed and the server minted it,
 * whereas the profile cookie is just something we wrote down. If the two ever
 * disagree about who this is, the token wins and the cache is discarded.
 *
 * The token's signature is NOT verified here, so this is safe only because of
 * how it is used: to decide what to render. Every action that matters is
 * authorised by the API against the real token. Never gate anything
 * security-relevant on this — if a page must not be seen by a non-admin, the
 * data behind it has to come from an endpoint that enforces that.
 */
export async function getPrincipal(): Promise<Principal | null> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) return null;

  const payload = decodeJwtPayload(token);
  if (!payload || typeof payload.sub !== "string") return null;

  // Expired by its own claim — treat as signed out rather than sending it.
  if (typeof payload.exp === "number" && payload.exp * 1000 < Date.now()) {
    return null;
  }

  const id = payload.sub;
  const role = (payload.role as Role) ?? "user";

  const cached = readProfileCookie(store.get(PROFILE_COOKIE)?.value);

  // A cache describing a different user is a stale cookie from a previous
  // session, not this one. Ignore it rather than render someone else's name.
  if (cached && cached.id === id) {
    return { ...cached, id, role };
  }

  return { id, role, name: "", email: "" };
}

function readProfileCookie(raw: string | undefined): Principal | null {
  if (!raw) return null;
  try {
    const parsed: unknown = JSON.parse(raw);
    if (
      typeof parsed === "object" &&
      parsed !== null &&
      typeof (parsed as Principal).id === "string"
    ) {
      return parsed as Principal;
    }
  } catch {
    // Truncated or hand-edited. Fall back to the token.
  }
  return null;
}

function decodeJwtPayload(token: string): Record<string, unknown> | null {
  const segments = token.split(".");
  if (segments.length !== 3) return null;

  try {
    // base64url -> base64, then pad. Decoders reject unpadded input.
    const b64 = segments[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = b64.padEnd(b64.length + ((4 - (b64.length % 4)) % 4), "=");
    return JSON.parse(Buffer.from(padded, "base64").toString("utf8"));
  } catch {
    return null;
  }
}
