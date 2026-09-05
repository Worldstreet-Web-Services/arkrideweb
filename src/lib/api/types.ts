/**
 * The shapes the ArkRide API actually returns.
 *
 * The backend wraps EVERY response — success or failure — in one of the two
 * envelopes below (`common/interceptors/response-envelope.interceptor.ts` and
 * `common/filters/all-exceptions.filter.ts`). There are no exceptions and no
 * per-endpoint shapes, which is what makes a single typed client possible.
 */

/** Any 2xx that carries a body. */
export interface ApiSuccess<T> {
  success: true;
  statusCode: number;
  message: string;
  data: T;
  /** Present on list endpoints only. */
  meta?: PaginationMeta;
  timestamp: string;
}

/** Any 4xx or 5xx. */
export interface ApiFailure {
  success: false;
  statusCode: number;
  /** ALWAYS a single string. Field detail lives in `errors`. */
  message: string;
  code: ApiErrorCode;
  /** Validation failures only. */
  errors?: FieldError[];
  path: string;
  timestamp: string;
  /** 5xx only — quote it when reporting a fault. */
  requestId?: string;
}

export interface FieldError {
  /** Dotted path, e.g. `pickup.lat`. */
  field: string;
  messages: string[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Branch on this, never on `message` — the message is written for humans and
 * will change. The list mirrors `codeFor()` in the backend's exception filter.
 */
export type ApiErrorCode =
  | "VALIDATION_FAILED"
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "DUPLICATE_VALUE"
  | "INVALID_REFERENCE"
  | "MALFORMED_IDENTIFIER"
  | "RATE_LIMITED"
  | "DATABASE_ERROR"
  | "INTERNAL_ERROR"
  /** Not from the server: the request never completed. */
  | "NETWORK_ERROR";

/**
 * A failed request, as an Error subclass.
 *
 * Carrying the code and field errors on the error object means a caller can
 * `catch (e) { if (e instanceof ApiError && e.code === "VALIDATION_FAILED") }`
 * instead of inspecting an untyped response — and a form can map
 * `e.fieldErrors` straight onto its inputs.
 */
export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;
  readonly fieldErrors: FieldError[];
  readonly requestId?: string;
  readonly path?: string;

  constructor(failure: Omit<ApiFailure, "success">) {
    super(failure.message);
    this.name = "ApiError";
    this.statusCode = failure.statusCode;
    this.code = failure.code;
    this.fieldErrors = failure.errors ?? [];
    this.requestId = failure.requestId;
    this.path = failure.path;
  }

  /** True when re-authenticating would plausibly fix it. */
  get isAuthError(): boolean {
    return this.code === "UNAUTHENTICATED";
  }

  /** True when the caller should back off rather than retry immediately. */
  get isRateLimited(): boolean {
    return this.code === "RATE_LIMITED";
  }

  /** Messages for one field, for rendering under an input. */
  messagesFor(field: string): string[] {
    return this.fieldErrors.find((e) => e.field === field)?.messages ?? [];
  }

  /** `{ email: "must be an email" }`, for seeding a form's error state. */
  toFieldMap(): Record<string, string> {
    return Object.fromEntries(
      this.fieldErrors
        .filter((e) => e.field)
        .map((e) => [e.field, e.messages[0]]),
    );
  }
}

/** What every sign-in path returns. */
export interface Session {
  accessToken: string;
  refreshToken: string;
  /** Seconds until the ACCESS token expires. Currently 3600. */
  expiresIn: number;
  tokenType: "Bearer";
  /** Alias for accessToken, kept by the API for older clients. */
  token?: string;
}

export type Role = "user" | "driver" | "admin";
