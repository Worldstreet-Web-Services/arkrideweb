"use server";

import { redirect } from "next/navigation";
import {
  loginRider,
  loginDriver,
  registerRider,
  registerDriver,
} from "@/lib/api/auth";
import { signOut as endSession } from "@/lib/api/session";
import { ApiError } from "@/lib/api/types";

/**
 * Server Actions for signing in and out.
 *
 * These exist so the browser never holds a token. A form posts here, this runs
 * on the server, the API is called, and the session comes back as an httpOnly
 * cookie the page cannot read.
 */

export interface FormState {
  /** Shown above the form. Empty when there is nothing to report. */
  error?: string;
  /** Per-input messages, keyed by field name. */
  fieldErrors?: Record<string, string>;
}

/**
 * Turn any thrown failure into something safe to render.
 *
 * Deliberately does not distinguish "no such account" from "wrong password" —
 * the API already returns one message for both, and reproducing that here
 * keeps the frontend from leaking which emails are registered.
 */
function toFormState(error: unknown): FormState {
  if (error instanceof ApiError) {
    if (error.isRateLimited) {
      return { error: "Too many attempts. Wait a minute and try again." };
    }
    if (error.code === "VALIDATION_FAILED") {
      return {
        error: "Please check the highlighted fields.",
        fieldErrors: error.toFieldMap(),
      };
    }
    return { error: error.message };
  }
  return { error: "Something went wrong. Please try again." };
}

/**
 * Only allow redirects to a path on this site.
 *
 * A `next` parameter taken at face value is an open redirect: an attacker
 * sends `/admin/login?next=https://evil.example` and the victim is bounced
 * off-site straight after authenticating. Requiring a single leading slash —
 * and rejecting `//host`, which browsers read as protocol-relative — keeps the
 * destination on this origin.
 */
function safeNext(next: unknown, fallback: string): string {
  if (typeof next !== "string") return fallback;
  if (!next.startsWith("/") || next.startsWith("//")) return fallback;
  return next;
}

export async function signInAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const audience = formData.get("audience") === "driver" ? "driver" : "rider";
  const next = safeNext(
    formData.get("next"),
    audience === "driver" ? "/driver" : "/app",
  );

  if (!email || !password) {
    return {
      error: "Enter your email and password.",
      fieldErrors: {
        ...(email ? {} : { email: "Enter your email address." }),
        ...(password ? {} : { password: "Enter your password." }),
      },
    };
  }

  try {
    if (audience === "driver") {
      await loginDriver(email, password);
    } else {
      await loginRider(email, password);
    }
  } catch (error) {
    return toFormState(error);
  }

  // Outside the try: `redirect` signals by throwing, so a catch above would
  // swallow it and the user would sit on the sign-in page having succeeded.
  redirect(next);
}

/**
 * Admin sign-in.
 *
 * There is no separate admin login endpoint — an admin is a user whose record
 * carries `role: 'admin'`, so this is the ordinary rider login. Whether they
 * are actually an admin is decided by `requireAdmin()` on the next page load,
 * against the API. Succeeding here is not the same as being let in.
 */
export async function adminSignInAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const next = safeNext(formData.get("next"), "/admin");

  if (!email || !password) {
    return {
      error: "Enter your email and password.",
      fieldErrors: {
        ...(email ? {} : { email: "Enter your email address." }),
        ...(password ? {} : { password: "Enter your password." }),
      },
    };
  }

  try {
    await loginRider(email, password);
  } catch (error) {
    return toFormState(error);
  }

  redirect(next);
}

export async function registerRiderAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");

  // Checked here as well as on the API so the user gets the answer without a
  // round trip; the API check is the one that counts.
  if (password !== confirmPassword) {
    return {
      error: "Those passwords do not match.",
      fieldErrors: { confirmPassword: "Those passwords do not match." },
    };
  }

  if (formData.get("acceptTerms") !== "on") {
    return {
      error: "You need to accept the terms to continue.",
      fieldErrors: { acceptTerms: "Please accept the terms to continue." },
    };
  }

  try {
    await registerRider({
      name: String(formData.get("name") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      password,
      confirmPassword,
      acceptTerms: true,
    });
  } catch (error) {
    return toFormState(error);
  }

  redirect("/app");
}

/**
 * Driver registration.
 *
 * One call creates the driver AND their first vehicle — the vehicle fields are
 * not optional on the API. The licence expiry must be a future date, and the
 * phone must match `^(\+234|0)[789]\d{9}$`, which is NOT the rule rider
 * registration uses; `registerDriver` normalises before sending.
 *
 * The driver lands on /driver in `pending` state. They cannot go online until
 * an admin approves them, which is enforced server-side, so the dashboard
 * shows the wait rather than a toggle that would fail.
 */
export async function registerDriverAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = String(formData.get("password") ?? "");

  if (password.length < 8) {
    return {
      error: "Your password needs at least 8 characters.",
      fieldErrors: { password: "Use at least 8 characters." },
    };
  }

  const vehicleYear = Number(formData.get("vehicleYear"));
  if (!Number.isInteger(vehicleYear)) {
    return {
      error: "Enter the vehicle year as a number.",
      fieldErrors: { vehicleYear: "Enter a year, e.g. 2019." },
    };
  }

  const vehicleType = String(formData.get("vehicleType") ?? "");
  if (!["keke", "bike", "car", "courier"].includes(vehicleType)) {
    return {
      error: "Choose a vehicle type.",
      fieldErrors: { vehicleType: "Choose a vehicle type." },
    };
  }

  try {
    await registerDriver({
      name: String(formData.get("name") ?? "").trim(),
      phone: String(formData.get("phone") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      password,
      licenseNumber: String(formData.get("licenseNumber") ?? "").trim(),
      licenseExpiry: String(formData.get("licenseExpiry") ?? ""),
      vehicleType: vehicleType as "keke" | "bike" | "car" | "courier",
      plateNumber: String(formData.get("plateNumber") ?? "").trim().toUpperCase(),
      vehicleColor: String(formData.get("vehicleColor") ?? "").trim(),
      vehicleModel: String(formData.get("vehicleModel") ?? "").trim(),
      vehicleYear,
    });
  } catch (error) {
    return toFormState(error);
  }

  redirect("/driver");
}

export async function signOutAction(): Promise<void> {
  await endSession();
  redirect("/");
}
