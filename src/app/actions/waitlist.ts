"use server";

import { joinWaitlist, type WaitlistUserType } from "@/lib/api/waitlist";
import { ApiError } from "@/lib/api/types";

export type WaitlistField = "userType" | "email" | "phoneNumber" | "feature";

export interface WaitlistValues {
  userType: WaitlistUserType;
  email: string;
  phoneNumber: string;
  feature: string;
}

export interface WaitlistState {
  status: "idle" | "joined" | "error";
  /** The API said this address was already on the list. */
  alreadyJoined?: boolean;
  /** A failure that belongs to no single field: rate limit, network, server. */
  message?: string;
  /** Shown under the field each one belongs to. */
  fieldErrors?: Partial<Record<WaitlistField, string>>;
  /**
   * What was submitted. React resets an action form after it runs, so a
   * failed attempt hands these back as default values rather than making
   * the person type everything again.
   */
  values?: WaitlistValues;
}

/**
 * Loose on purpose: the point is to catch a typo before a round trip, not to
 * adjudicate RFC 5322. The API validates for real.
 */
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const API_FIELDS: readonly WaitlistField[] = [
  "userType",
  "email",
  "phoneNumber",
  "feature",
];

export async function joinWaitlistAction(
  _prev: WaitlistState,
  formData: FormData,
): Promise<WaitlistState> {
  const rawType = formData.get("userType");
  const userType: WaitlistUserType | null =
    rawType === "driver" ? "driver" : rawType === "user" ? "user" : null;
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const phoneNumber = String(formData.get("phoneNumber") ?? "").trim();
  const feature = String(formData.get("feature") ?? "")
    .trim()
    .slice(0, 500);

  const values: WaitlistValues = {
    userType: userType ?? "user",
    email,
    phoneNumber,
    feature,
  };

  const fieldErrors: WaitlistState["fieldErrors"] = {};
  if (!userType) {
    fieldErrors.userType = "Choose whether you want to ride or drive.";
  }
  if (!LOOKS_LIKE_EMAIL.test(email)) {
    fieldErrors.email = "Enter a valid email address.";
  }
  // The API only insists on a non-empty string. Seven digits is the shortest
  // real subscriber number anywhere, so fewer is a typo worth catching here.
  if ((phoneNumber.match(/\d/g) ?? []).length < 7) {
    fieldErrors.phoneNumber = "Enter a valid phone number.";
  }
  if (Object.keys(fieldErrors).length > 0) {
    return { status: "error", fieldErrors, values };
  }

  try {
    await joinWaitlist({
      email,
      phoneNumber,
      userType: values.userType,
      feature: feature || undefined,
    });
    return { status: "joined" };
  } catch (error) {
    if (error instanceof ApiError) {
      // 409: the address is already on the list. For the person at the
      // keyboard that is the outcome they came for.
      if (error.code === "CONFLICT") {
        return { status: "joined", alreadyJoined: true };
      }
      if (error.isRateLimited) {
        return {
          status: "error",
          message: "Too many attempts. Wait a minute and try again.",
          values,
        };
      }
      if (error.code === "VALIDATION_FAILED") {
        const map = error.toFieldMap();
        const mapped: WaitlistState["fieldErrors"] = {};
        for (const field of API_FIELDS) {
          if (map[field]) mapped[field] = map[field];
        }
        return Object.keys(mapped).length > 0
          ? { status: "error", fieldErrors: mapped, values }
          : {
              status: "error",
              message: "Please check your details and try again.",
              values,
            };
      }
      return { status: "error", message: error.message, values };
    }
    return {
      status: "error",
      message: "Something went wrong. Please try again.",
      values,
    };
  }
}
