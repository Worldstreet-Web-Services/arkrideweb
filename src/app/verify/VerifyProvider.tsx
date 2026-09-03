"use client";

import type { ReactNode } from "react";
import { applicationsStore } from "@/admin/store/applicationsStore";
import { VerificationProvider } from "@/verification/store/VerificationProvider";
import type { VerificationData } from "@/verification/types";

/**
 * App-level wrapper that injects the real `onSubmit`: a completed driver
 * verification is appended to the admin applications store so it appears in the
 * `/admin` review queue (same browser — this is the no-backend simulation).
 * Swap this for an API call when the backend lands.
 */
export function VerifyProvider({ children }: { children: ReactNode }) {
  const onSubmit = async (data: VerificationData) => {
    await new Promise((r) => setTimeout(r, 900)); // simulate network
    applicationsStore.add(data, new Date().toISOString());
  };

  return <VerificationProvider config={{ onSubmit }}>{children}</VerificationProvider>;
}
