"use client";

import { useEffect, useState } from "react";
import { applicationsStore } from "./store/applicationsStore";
import type { Application } from "./types";

/**
 * Client-only subscription to the applications store. Returns `null` until
 * mounted (avoids SSR/hydration mismatch since data lives in localStorage).
 */
export function useApplications(): Application[] | null {
  const [apps, setApps] = useState<Application[] | null>(null);
  useEffect(() => {
    setApps(applicationsStore.list());
    return applicationsStore.subscribe(() => setApps(applicationsStore.list()));
  }, []);
  return apps;
}

/** Single application by id. `undefined` = not found; `null` = still loading. */
export function useApplication(id: string): Application | null | undefined {
  const [app, setApp] = useState<Application | null | undefined>(null);
  useEffect(() => {
    const read = () => setApp(applicationsStore.get(id) ?? undefined);
    read();
    return applicationsStore.subscribe(read);
  }, [id]);
  return app;
}
