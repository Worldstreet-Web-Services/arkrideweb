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

const JOINED = "You're on the list. We'll email you when Ark Ride launches.";

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

  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  // The API only insists on a non-empty string. Seven digits is the shortest
  // real subscriber number anywhere, so fewer is a typo worth catching here.
  if ((phoneNumber.match(/\d/g) ?? []).length < 7) {
    return { status: "error", message: "Enter a valid phone number." };
  }

  // Anything other than an explicit "driver" is a rider: the dropdown only
  // offers the two, and a tampered value should not become a third.
  const userType = formData.get("userType") === "driver" ? "driver" : "user";
  const feature =
    String(formData.get("feature") ?? "")
      .trim()
      .slice(0, 500) || undefined;

  try {
    await joinWaitlist({ email, phoneNumber, userType, feature });
    return { status: "joined", message: JOINED };
  } catch (error) {
    if (error instanceof ApiError) {
      // 409: the address is already on the list. For the person at the
      // keyboard that is the outcome they came for, so it reads as success.
      if (error.code === "CONFLICT") {
        return {
          status: "joined",
          message: "You're already on the list. We'll email you when Ark Ride launches.",
        };
      }
      if (error.isRateLimited) {
        return {
          status: "error",
          message: "Too many attempts. Wait a minute and try again.",
        };
      }
      if (error.code === "VALIDATION_FAILED") {
        const fields = error.toFieldMap();
        return {
          status: "error",
          message:
            fields.email ??
            fields.feature ??
            fields.phoneNumber ??
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
