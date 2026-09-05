import "server-only";

import { apiFetch } from "./client";
import { storeSession } from "./session";
import type { Role, Session } from "./types";

/**
 * Auth calls against the ArkRide API.
 *
 * Every one of these stores the session in httpOnly cookies before resolving,
 * so a caller never handles a raw token.
 *
 * THE PROFILE IS CACHED IN A COOKIE, AND THAT IS NOT LAZINESS
 *
 * The API has no `GET /users/me`. There is no users controller at all — the
 * user object returned by sign-in is the ONLY place a name or email is ever
 * exposed. The access token's claims are `{sub, role, type}` and nothing else,
 * so decoding it cannot produce a display name.
 *
 * That leaves one option: persist what sign-in returned. It goes in an
 * httpOnly cookie alongside the tokens, and it will go stale if the user is
 * edited elsewhere. That is a real limitation of the API, not a design choice,
 * and it should be deleted the moment a `/users/me` endpoint exists.
 */

/**
 * The API returns the signed-in identity under THREE different keys depending
 * on which door you came through, with different fields on each:
 *
 *   POST /auth/register, /auth/login   -> `user`     (+ a `token` alias)
 *   POST /auth/privy                   -> `profile`  (no `token`, + privyDid)
 *   POST /drivers/register, /login     -> `driver`   (no `token`)
 *
 * Normalising here means the rest of the app sees one shape. Doing it anywhere
 * else means every caller reimplements this and one of them gets it wrong.
 */
export interface Principal {
  id: string;
  name: string;
  email: string;
  role: Role;
  isVerified?: boolean;
  privyDid?: string | null;
  walletAddressEvm?: string | null;
  /** Drivers only: `pending` until an admin approves them. */
  verificationStatus?: "pending" | "approved" | "rejected";
  isActive?: boolean;
}

interface SessionResponse extends Session {
  message?: string;
  user?: Partial<Principal>;
  driver?: Partial<Principal>;
  profile?: Partial<Principal>;
  isNewAccount?: boolean;
}

/** Pull the identity out of whichever key this endpoint happens to use. */
function principalFrom(
  data: SessionResponse,
  fallbackRole: Role,
): Principal | null {
  const raw = data.user ?? data.profile ?? data.driver;
  if (!raw || typeof raw.id !== "string") return null;

  return {
    id: raw.id,
    name: raw.name ?? "",
    email: raw.email ?? "",
    role: raw.role ?? fallbackRole,
    isVerified: raw.isVerified,
    privyDid: raw.privyDid ?? null,
    walletAddressEvm: raw.walletAddressEvm ?? null,
    verificationStatus: raw.verificationStatus,
    isActive: raw.isActive,
  };
}

/** Sign-in result, after normalisation. */
export interface SignInResult {
  principal: Principal | null;
  session: Session;
  isNewAccount?: boolean;
}

async function completeSignIn(
  data: SessionResponse,
  fallbackRole: Role,
): Promise<SignInResult> {
  const principal = principalFrom(data, fallbackRole);
  await storeSession(data, principal);
  return { principal, session: data, isNewAccount: data.isNewAccount };
}

/* ------------------------------------------------------------------ riders */

/**
 * Rider registration.
 *
 * `phone` must be BARE DIGITS, 10-15 of them — `^[0-9]{10,15}$`. No `+`, no
 * spaces. Note that driver registration uses a completely different and
 * incompatible regex; see `registerDriver`. Normalise before calling.
 *
 * The API sets `isVerified: true` at creation and stores a null OTP, so the
 * returned session is immediately usable and the verify-OTP step must be
 * skipped — calling it would fail with "Account is already verified".
 */
export interface RegisterRiderInput {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export async function registerRider(
  input: RegisterRiderInput,
): Promise<SignInResult> {
  // Exactly the DTO fields, nothing more: the API runs
  // `forbidNonWhitelisted`, so one stray key is a 400, not a silent strip.
  const { data } = await apiFetch<SessionResponse>("/auth/register", {
    method: "POST",
    auth: false,
    body: {
      name: input.name,
      email: input.email,
      phone: normalizeRiderPhone(input.phone),
      password: input.password,
      confirmPassword: input.confirmPassword,
      acceptTerms: input.acceptTerms,
    },
  });

  return completeSignIn(data, "user");
}

export async function loginRider(
  email: string,
  password: string,
): Promise<SignInResult> {
  const { data } = await apiFetch<SessionResponse>("/auth/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });

  return completeSignIn(data, "user");
}

/* ----------------------------------------------------------------- drivers */

/**
 * Driver registration.
 *
 * This creates the driver AND their first vehicle in one call — the vehicle
 * fields are not optional. `licenseExpiry` must be a future ISO date or the
 * API rejects it.
 *
 * `phone` must match `^(\+234|0)[789]\d{9}$` — a Nigerian mobile number, with
 * either the `+234` country code or a leading `0`. This is NOT the same rule
 * as rider registration, which wants bare digits and would reject the `+`.
 */
export interface RegisterDriverInput {
  name: string;
  phone: string;
  email: string;
  password: string;
  licenseNumber: string;
  licenseExpiry: string;
  vehicleType: "keke" | "bike" | "car" | "courier";
  plateNumber: string;
  vehicleColor: string;
  vehicleModel: string;
  vehicleYear: number;
}

export async function registerDriver(
  input: RegisterDriverInput,
): Promise<SignInResult> {
  const { data } = await apiFetch<SessionResponse>("/drivers/register", {
    method: "POST",
    auth: false,
    body: {
      ...input,
      phone: normalizeDriverPhone(input.phone),
      // Implicit conversion is OFF on the API: "2019" fails @IsInt.
      vehicleYear: Number(input.vehicleYear),
    },
  });

  return completeSignIn(data, "driver");
}

export async function loginDriver(
  email: string,
  password: string,
): Promise<SignInResult> {
  const { data } = await apiFetch<SessionResponse>("/drivers/login", {
    method: "POST",
    auth: false,
    body: { email, password },
  });

  return completeSignIn(data, "driver");
}

/* ------------------------------------------------------------------- privy */

/**
 * Exchange a Privy access token for an ArkRide session.
 *
 * `audience` is required and is not a formality: Privy issues ONE DID, while
 * the backend keeps riders and drivers in separate tables with separate id
 * spaces, and one person may legitimately hold an account in each. The caller
 * states which side it wants.
 *
 * Riders are auto-provisioned on first sign-in. DRIVERS ARE NOT — a Privy
 * sign-in with `audience: "driver"` against an unlinked DID is a 400. A driver
 * must register with a password first and link Privy afterwards.
 *
 * The identity token carries the wallet and the verified email, and is sent so
 * the server can VERIFY it — never so the server can trust it. Passing an
 * email in the body instead was an account-takeover vector; the field no
 * longer exists on the API and sending one is now a 400.
 */
export async function signInWithPrivy(params: {
  accessToken: string;
  identityToken?: string;
  audience: "rider" | "driver";
  name?: string;
}): Promise<SignInResult> {
  const { data } = await apiFetch<SessionResponse>("/auth/privy", {
    method: "POST",
    auth: false,
    body: {
      accessToken: params.accessToken,
      ...(params.identityToken ? { identityToken: params.identityToken } : {}),
      audience: params.audience,
      ...(params.name ? { name: params.name } : {}),
    },
  });

  return completeSignIn(data, params.audience === "driver" ? "driver" : "user");
}

/* ---------------------------------------------------------------- password */

export async function requestPasswordReset(
  email: string,
  as: "rider" | "driver" = "rider",
): Promise<void> {
  await apiFetch(as === "driver" ? "/drivers/forgot-password" : "/auth/forgot-password", {
    method: "POST",
    auth: false,
    body: { email },
  });
}

/** The OTP is SIX digits. Anything else is rejected by the DTO. */
export async function resetPassword(
  input: { email: string; otp: string; newPassword: string },
  as: "rider" | "driver" = "rider",
): Promise<void> {
  await apiFetch(as === "driver" ? "/drivers/reset-password" : "/auth/reset-password", {
    method: "POST",
    auth: false,
    body: input,
  });
}

/* ------------------------------------------------------------------ phones */

/**
 * Rider phone: bare digits only.
 *
 * A Nigerian number is typed as `0801 234 5678` or `+234 801 234 5678`. Both
 * have to become digits for `^[0-9]{10,15}$`, so the `+` goes and everything
 * else is stripped. `+2348012345678` -> `2348012345678` (13 digits, valid).
 */
export function normalizeRiderPhone(phone: string): string {
  return phone.replace(/\D/g, "");
}

/**
 * Driver phone: `^(\+234|0)[789]\d{9}$`.
 *
 * Here the shape is load-bearing, so a bare-digit form has to be rebuilt
 * rather than stripped. `2348012345678` -> `+2348012345678`.
 */
export function normalizeDriverPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.startsWith("234")) return `+${digits}`;
  if (digits.startsWith("0")) return digits;
  // A 10-digit local number missing its trunk prefix: 8012345678.
  if (digits.length === 10) return `0${digits}`;
  return phone.trim();
}
