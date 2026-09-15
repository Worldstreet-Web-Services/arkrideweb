"use server";

import { joinWaitlist } from "@/lib/api/waitlist";
import { ApiError } from "@/lib/api/types";

export interface WaitlistState {
  status: "idle" | "joined" | "error";
  /** Read out below the form. Empty while idle. */
  message?: string;
}

/**
 * Loose on purpose: the point is to catch a typo before a round trip, not to
 * adjudicate RFC 5322. The API validates for real.
 */
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function joinWaitlistAction(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!LOOKS_LIKE_EMAIL.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  // Anything other than an explicit "driver" is a rider — the dropdown only
  // offers the two, and a tampered value should not become a third.
  const role = formData.get("role") === "driver" ? "driver" : "user";
  const feature =
    String(formData.get("feature") ?? "")
      .trim()
      .slice(0, 500) || undefined;

  try {
    await joinWaitlist({ email, role, feature, source: "web" });
    return {
      status: "joined",
      message: "You're on the list. We'll email you when Ark Ride launches.",
    };
  } catch (error) {
    if (error instanceof ApiError) {
      if (error.isRateLimited) {
        return {
          status: "error",
          message: "Too many attempts. Wait a minute and try again.",
        };
      }
      if (error.code === "VALIDATION_FAILED") {
        return {
          status: "error",
          message:
            error.toFieldMap().email ??
            error.toFieldMap().feature ??
            "Please check the form and try again.",
        };
      }
      return { status: "error", message: error.message };
    }
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
    };
  }
}
