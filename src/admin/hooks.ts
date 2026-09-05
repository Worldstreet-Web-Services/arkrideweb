"use client";

import { useCallback, useSyncExternalStore } from "react";
import { applicationsStore } from "./store/applicationsStore";
import type { Application } from "./types";

/**
 * Client-only subscription to the applications store.
 *
 * `useSyncExternalStore` rather than `useState` + `useEffect`: the store
 * already exposes exactly the `subscribe`/`getSnapshot` pair this hook wants,
 * and the effect version set state synchronously inside the effect body — an
 * eslint `react-hooks/set-state-in-effect` error, a cascading extra render,
 * and a guaranteed flash of the loading state on every navigation.
 *
 * The third argument is the server snapshot. Returning null there (rather than
 * reading the store) is what keeps SSR and the first client render agreeing:
 * the data lives in browser storage and does not exist on the server.
 */
export function useApplications(): Application[] | null {
  return useSyncExternalStore(
    applicationsStore.subscribe,
    // `list()` sorts into a new array each call, and useSyncExternalStore
    // compares snapshots by identity — returning a fresh array every time
    // would re-render forever. The store caches, so this is stable between
    // actual changes.
    applicationsStore.list,
    () => null,
  );
}

/** Single application by id. `undefined` = not found; `null` = still loading. */
export function useApplication(id: string): Application | null | undefined {
  const getSnapshot = useCallback(
    () => applicationsStore.get(id) ?? undefined,
    [id],
  );

  return useSyncExternalStore(
    applicationsStore.subscribe,
    getSnapshot,
    () => null,
  );
}
