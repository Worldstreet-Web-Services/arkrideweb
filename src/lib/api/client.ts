import "server-only";

import { ApiError, type ApiFailure, type ApiSuccess } from "./types";

/**
 * The ArkRide API client.
 *
 * `server-only` at the top is load-bearing, not decoration. This module reads
 * the access token out of an httpOnly cookie; importing it from a Client
 * Component would be a build error rather than a silent token leak into the
 * browser bundle. Browser code talks to Route Handlers and Server Actions,
 * which talk to this.
 *
 * WHY THE TOKEN IS IN AN httpOnly COOKIE
 *
 * The obvious alternative — `localStorage` — is readable by any script on the
 * page, so one XSS anywhere hands an attacker a live session. The reference
 * frontend we studied does exactly that (`localStorage.setItem("token", …)`),
 * and it is the single most common way a ride-hailing account gets taken over.
 * An httpOnly cookie cannot be read by JavaScript at all.
 *
 * The backend authenticates with `Authorization: Bearer` and has no cookie
 * support of its own, so the cookie is OUR storage and the header is attached
 * here, server-side, on the way out.
 */

const BASE_URL = (
  process.env.ARKRIDE_API_URL ?? "http://localhost:4010"
).replace(/\/+$/, "");

const API_PREFIX = "/api/v1";

export const ACCESS_COOKIE = "ark_at";
export const REFRESH_COOKIE = "ark_rt";

interface RequestOptions {
  method?: "GET" | "POST" | "PATCH" | "PUT" | "DELETE";
  body?: unknown;
  /**
   * Send the caller's access token. Defaults to true — opting OUT is the
   * unusual case (sign-in, public stats), so the safe default is to attach it.
   */
  auth?: boolean;
  /** Explicit token, for flows that have one but no cookie yet. */
  token?: string;
  /** Next's fetch cache options. Defaults to no-store. */
  cache?: RequestCache;
  revalidate?: number;
  tags?: string[];
  headers?: Record<string, string>;
  /** Abort if the API does not answer. Defaults to 15s. */
  timeoutMs?: number;
}

/**
 * Read the access token from the request's cookies.
 *
 * Imported lazily so that a call with `auth: false` — which includes every
 * request made during a static prerender — never touches `cookies()` and so
 * never opts the caller into dynamic rendering.
 */
async function readAccessToken(): Promise<string | undefined> {
  const { cookies } = await import("next/headers");
  // Async in Next 16. Awaiting it is not optional.
  const store = await cookies();
  return store.get(ACCESS_COOKIE)?.value;
}

export async function apiFetch<T>(
  path: string,
  options: RequestOptions = {},
): Promise<ApiSuccess<T>> {
  const {
    method = "GET",
    body,
    auth = true,
    token,
    cache,
    revalidate,
    tags,
    headers = {},
    timeoutMs = 15_000,
  } = options;

  const url = `${BASE_URL}${API_PREFIX}${path.startsWith("/") ? path : `/${path}`}`;

  const requestHeaders: Record<string, string> = {
    Accept: "application/json",
    ...headers,
  };

  if (body !== undefined) {
    requestHeaders["Content-Type"] = "application/json";
  }

  if (auth) {
    const bearer = token ?? (await readAccessToken());
    if (bearer) requestHeaders.Authorization = `Bearer ${bearer}`;
  }

  // A hung API must not hang the page render. Without this the request
  // inherits the platform default, which can be minutes.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  let response: Response;
  try {
    response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal: controller.signal,
      cache: cache ?? (revalidate === undefined ? "no-store" : undefined),
      next: revalidate !== undefined || tags ? { revalidate, tags } : undefined,
    });
  } catch (cause) {
    // DNS failure, connection refused, timeout. Surfaced as an ApiError so
    // callers have ONE error type to handle rather than two.
    throw new ApiError({
      statusCode: 0,
      message:
        (cause as Error)?.name === "AbortError"
          ? "The request timed out. Please try again."
          : "Could not reach ArkRide. Check your connection and try again.",
      code: "NETWORK_ERROR",
      path,
      timestamp: new Date().toISOString(),
    });
  } finally {
    clearTimeout(timeout);
  }

  // 204 carries no body by contract, so parsing it would throw.
  if (response.status === 204) {
    return {
      success: true,
      statusCode: 204,
      message: "No content",
      data: undefined as T,
      timestamp: new Date().toISOString(),
    };
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    // A non-JSON body means something upstream answered instead of the API —
    // a proxy error page, a 502 from a load balancer.
    throw new ApiError({
      statusCode: response.status,
      message: "ArkRide returned an unreadable response.",
      code: response.status >= 500 ? "INTERNAL_ERROR" : "NETWORK_ERROR",
      path,
      timestamp: new Date().toISOString(),
    });
  }

  if (!response.ok || !isSuccessEnvelope(payload)) {
    throw new ApiError(toFailure(payload, response.status, path));
  }

  return payload as ApiSuccess<T>;
}

/** `apiFetch` when you only want the payload. */
export async function api<T>(
  path: string,
  options?: RequestOptions,
): Promise<T> {
  return (await apiFetch<T>(path, options)).data;
}

function isSuccessEnvelope(payload: unknown): payload is ApiSuccess<unknown> {
  return (
    typeof payload === "object" &&
    payload !== null &&
    (payload as { success?: unknown }).success === true &&
    "data" in payload
  );
}

/**
 * Coerce whatever came back into the failure shape.
 *
 * The API is consistent, but a proxy in front of it may not be — so this never
 * assumes the body is well-formed, and always produces a usable message.
 */
function toFailure(
  payload: unknown,
  status: number,
  path: string,
): Omit<ApiFailure, "success"> {
  const candidate = (payload ?? {}) as Partial<ApiFailure>;

  return {
    statusCode: candidate.statusCode ?? status,
    message:
      typeof candidate.message === "string" && candidate.message
        ? candidate.message
        : "Something went wrong. Please try again.",
    code: candidate.code ?? (status >= 500 ? "INTERNAL_ERROR" : "NETWORK_ERROR"),
    errors: Array.isArray(candidate.errors) ? candidate.errors : undefined,
    path: candidate.path ?? path,
    timestamp: candidate.timestamp ?? new Date().toISOString(),
    requestId: candidate.requestId,
  };
}
