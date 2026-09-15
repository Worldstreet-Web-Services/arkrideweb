"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  joinWaitlist,
  WaitlistApiError,
  type JoinWaitlistResult,
} from "@/services/waitlist.service";
import type { JoinWaitlistInput } from "@/lib/api/waitlist";

/**
 * Joins the waitlist and reports the exact outcome as a toast. Centralized
 * here so every caller gets the same, accurate feedback for every branch the
 * API can return: joined, already joined, a field-level validation problem,
 * or a message-level failure (rate limit, network, server error).
 */
export function useJoinWaitlist() {
  return useMutation<JoinWaitlistResult, WaitlistApiError, JoinWaitlistInput>({
    mutationFn: joinWaitlist,
    onSuccess: (data) => {
      toast.success(
        data.alreadyJoined
          ? "You’re already on the list — we’ll be in touch before launch."
          : "You’re on the list — we’ll email you when Ark Ride launches.",
      );
    },
    onError: (error) => {
      if (error instanceof WaitlistApiError && error.fieldErrors) {
        toast.error("Please check the highlighted fields and try again.");
        return;
      }
      toast.error(error.message || "Something went wrong. Please try again.");
    },
  });
}
