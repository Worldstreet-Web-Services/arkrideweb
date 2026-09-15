import type {
  JoinWaitlistInput,
  WaitlistUserType,
} from "@/lib/api/waitlist";

/**
 * Client-side waitlist service.
 *
 * Talks to this app's own `POST /api/waitlist` Route Handler, never to
 * arkride-backend directly: `ARKRIDE_API_URL` is server-only on purpose (see
 * `src/lib/api/client.ts`), and routing through our own origin means this
 * request needs no CORS allowance from the backend.
 */

export type WaitlistField =
  | "userType"
  | "name"
  | "email"
  | "phoneNumber"
  | "feature";

export interface WaitlistFormValues {
  userType: WaitlistUserType | "";
  name: string;
  email: string;
  phoneNumber: string;
  feature: string;
}

export interface JoinWaitlistResult {
  alreadyJoined: boolean;
}

interface WaitlistRoutePayload {
  success: boolean;
  alreadyJoined?: boolean;
  code?: string;
  message?: string;
  fieldErrors?: Partial<Record<WaitlistField, string>>;
}

/**
 * A failed `/api/waitlist` call, as an Error subclass — mirrors the shape of
 * `ApiError` in `src/lib/api/types.ts` so callers branch on `code`, never on
 * `message`.
 */
export class WaitlistApiError extends Error {
  readonly code: string;
  readonly fieldErrors?: Partial<Record<WaitlistField, string>>;

  constructor(payload: {
    code: string;
    message: string;
    fieldErrors?: Partial<Record<WaitlistField, string>>;
  }) {
    super(payload.message);
    this.name = "WaitlistApiError";
    this.code = payload.code;
    this.fieldErrors = payload.fieldErrors;
  }

  get isRateLimited(): boolean {
    return this.code === "RATE_LIMITED";
  }
}

export async function joinWaitlist(
  input: JoinWaitlistInput,
): Promise<JoinWaitlistResult> {
  let response: Response;
  try {
    response = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
  } catch {
    throw new WaitlistApiError({
      code: "NETWORK_ERROR",
      message: "Could not reach ArkRide. Check your connection and try again.",
    });
  }

  let payload: WaitlistRoutePayload | undefined;
  try {
    payload = (await response.json()) as WaitlistRoutePayload;
  } catch {
    throw new WaitlistApiError({
      code: "NETWORK_ERROR",
      message: "ArkRide returned an unreadable response.",
    });
  }

  if (!response.ok || !payload.success) {
    throw new WaitlistApiError({
      code: payload.code ?? "UNKNOWN",
      message: payload.message ?? "Something went wrong. Please try again.",
      fieldErrors: payload.fieldErrors,
    });
  }

  return { alreadyJoined: Boolean(payload.alreadyJoined) };
}

/**
 * Loose on purpose: the point is to catch a typo before a round trip, not to
 * adjudicate RFC 5322. The API validates for real.
 */
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Read and lightly normalize the waitlist form's raw `FormData`. */
export function readWaitlistFormValues(formData: FormData): WaitlistFormValues {
  const rawType = formData.get("userType");
  const userType: WaitlistUserType | "" =
    rawType === "driver" ? "driver" : rawType === "user" ? "user" : "";

  return {
    userType,
    // Optional on the API, capped at 100 characters there too.
    name: String(formData.get("name") ?? "")
      .trim()
      .slice(0, 100),
    email: String(formData.get("email") ?? "")
      .trim()
      .toLowerCase(),
    phoneNumber: String(formData.get("phoneNumber") ?? "").trim(),
    feature: String(formData.get("feature") ?? "")
      .trim()
      .slice(0, 500),
  };
}

/**
 * Pre-flight validation, run client-side before the network round trip.
 * Kept intentionally light — the API is the real authority.
 */
export function validateWaitlistInput(
  values: WaitlistFormValues,
): Partial<Record<WaitlistField, string>> {
  const errors: Partial<Record<WaitlistField, string>> = {};

  if (!values.userType) {
    errors.userType = "Choose whether you want to ride or drive.";
  }
  if (!LOOKS_LIKE_EMAIL.test(values.email)) {
    errors.email = "Enter a valid email address.";
  }
  // The API only insists on a non-empty string. Seven digits is the shortest
  // real subscriber number anywhere, so fewer is a typo worth catching here.
  if ((values.phoneNumber.match(/\d/g) ?? []).length < 7) {
    errors.phoneNumber = "Enter a valid phone number.";
  }

  return errors;
}

export function toJoinWaitlistInput(
  values: WaitlistFormValues,
): JoinWaitlistInput {
  return {
    name: values.name || undefined,
    email: values.email,
    phoneNumber: values.phoneNumber,
    userType: (values.userType || "user") as WaitlistUserType,
    feature: values.feature || undefined,
  };
}
