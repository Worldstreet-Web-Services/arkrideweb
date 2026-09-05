"use client";

import { useCallback, useMemo, type ReactNode } from "react";
import { applicationsStore } from "@/admin/store/applicationsStore";
import { VerificationProvider } from "@/verification/store/VerificationProvider";
import type { VerificationData } from "@/verification/types";

/**
 * App-level wrapper that injects the real `onSubmit`.
 *
 * A completed verification is appended to the applications store so it appears
 * in the `/admin` review queue. That store is still browser-local: the API has
 * no endpoint for a driver application and no file upload at all — no
 * multipart handling, no storage SDK, no document columns on any entity — so
 * there is nowhere to send the eighteen scans this flow collects. The three
 * steps the backend does cover (personal details, licence numbers, vehicle)
 * are wired through `registerDriver`; the rest waits on backend work.
 *
 * `onSubmit` is wrapped in `useCallback` and the config object in `useMemo` on
 * purpose. The provider memoises its context value on the config identity, so
 * a fresh `{ onSubmit }` literal each render meant a new context value each
 * render — re-rendering every consumer of a nine-step form holding eighteen
 * base64 images on every keystroke.
 */
export function VerifyProvider({ children }: { children: ReactNode }) {
  const onSubmit = useCallback(async (data: VerificationData) => {
    applicationsStore.add(data, new Date().toISOString());
  }, []);

  const config = useMemo(() => ({ onSubmit }), [onSubmit]);

  return <VerificationProvider config={config}>{children}</VerificationProvider>;
}
