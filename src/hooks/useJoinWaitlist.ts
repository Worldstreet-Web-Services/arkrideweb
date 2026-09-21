"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  joinWaitlist,
  WaitlistApiError,
  type JoinWaitlistResult,
} from "@/services/waitlist.service";
import type { JoinWaitlistInput } from "@/lib/api/waitlist";
import { track } from "@/lib/analytics";
import { WAITLIST_TOASTER_ID } from "@/components/waitlist/WaitlistToaster";

// The waitlist form is a modal <dialog>, which covers the global toaster; these
// toasts go to the toaster that WaitlistDialog mounts above it.
const toastOptions = { toasterId: WAITLIST_TOASTER_ID };

/**
 * Joins the waitlist and reports the exact outcome as a toast. Centralized
 * here so every caller gets the same, accurate feedback for every branch the
 * API can return: joined, already joined, a field-level validation problem,
 * or a message-level failure (rate limit, network, server error).
 */
export function useJoinWaitlist() {
  return useMutation<JoinWaitlistResult, WaitlistApiError, JoinWaitlistInput>({
    mutationFn: joinWaitlist,
    onSuccess: (data, input) => {
      // Categorical only. Never the name, email, phone number or the typed
      // "feature" answer — see src/instrumentation-client.ts.
      track("waitlist_joined", {
        user_type: input.userType,
        already_joined: data.alreadyJoined,
        lga: input.lga ?? null,
        area: input.area ?? null,
      });
      toast.success(
        data.alreadyJoined
          ? "You’re already on the list — we’ll be in touch before launch."
          : "You’re on the list — we’ll email you when Ark Ride launches.",
        toastOptions,
      );
    },
    onError: (error, input) => {
      // Where people fail is where the form loses them, so it is worth a line
      // on a chart: a spike of VALIDATION_FAILED means a field is confusing.
      track("waitlist_join_failed", {
        user_type: input.userType,
        code: error instanceof WaitlistApiError ? error.code : "UNKNOWN",
        field_errors: error instanceof WaitlistApiError && !!error.fieldErrors,
      });
      if (error instanceof WaitlistApiError && error.fieldErrors) {
        toast.error(
          "Please check the highlighted fields and try again.",
          toastOptions,
        );
        return;
      }
      toast.error(
        error.message || "Something went wrong. Please try again.",
        toastOptions,
      );
    },
  });
}
