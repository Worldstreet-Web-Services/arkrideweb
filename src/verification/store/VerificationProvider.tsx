"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type ReactNode,
} from "react";
import type { VerificationConfig } from "../config";
import { defaultConfig } from "../config";
import { createEmptyData } from "../defaults";
import type { VerificationData } from "../types";
import type { SaveResult } from "./storage";

/**
 * Holds the whole verification draft. State lives here (Context + useReducer),
 * hydrates from the configured storage adapter on mount, and persists on every
 * change — so Back never loses data and the driver can close and resume.
 *
 * `update` takes a section key and a partial patch, e.g.
 *   update("personal", { firstName: "Ada" })
 */

type Section = Exclude<keyof VerificationData, "status">;

type Action =
  | { type: "hydrate"; data: VerificationData }
  | { type: "patch"; section: Section; value: Partial<VerificationData[Section]> }
  | { type: "setGuarantor"; index: number; value: Partial<VerificationData["guarantors"][number]> }
  | { type: "setStatus"; status: VerificationData["status"] }
  | { type: "reset"; data: VerificationData };

function reducer(state: VerificationData, action: Action): VerificationData {
  switch (action.type) {
    case "hydrate":
      return action.data;
    case "patch": {
      const next = {
        ...state,
        [action.section]: { ...state[action.section], ...action.value },
      } as VerificationData;
      if (next.status === "not_started") next.status = "in_progress";
      return next;
    }
    case "setGuarantor": {
      const guarantors = state.guarantors.map((g, i) =>
        i === action.index ? { ...g, ...action.value } : g
      );
      const status = state.status === "not_started" ? "in_progress" : state.status;
      return { ...state, guarantors, status };
    }
    case "setStatus":
      return { ...state, status: action.status };
    case "reset":
      return action.data;
    default:
      return state;
  }
}

interface VerificationContextValue {
  data: VerificationData;
  config: VerificationConfig;
  hydrated: boolean;
  /**
   * Set when the last autosave failed.
   *
   * This used to be swallowed in an empty catch while the UI kept saying
   * "Your progress is saved automatically" — so a driver whose storage was
   * full was told, continuously and falsely, that their work was safe. The
   * failure is now surfaced and the step screen shows it.
   */
  saveError: string | null;
  update: <S extends Section>(section: S, value: Partial<VerificationData[S]>) => void;
  updateGuarantor: (
    index: number,
    value: Partial<VerificationData["guarantors"][number]>
  ) => void;
  setStatus: (status: VerificationData["status"]) => void;
  reset: () => void;
  /**
   * Erase the persisted draft, keeping the in-memory copy.
   *
   * Called once a submission has succeeded. `reset()` cannot be used there —
   * it also clears state, and the success screen still renders from it — which
   * is part of why the draft was never purged at all: `reset()` had no call
   * sites anywhere, so a completed application left a full set of identity
   * scans on the device forever.
   */
  purge: () => Promise<void>;
}

const VerificationContext = createContext<VerificationContextValue | null>(null);

export function VerificationProvider({
  children,
  config: configOverride,
}: {
  children: ReactNode;
  config?: Partial<VerificationConfig>;
}) {
  const config = useMemo<VerificationConfig>(
    () => ({ ...defaultConfig, ...configOverride }),
    [configOverride]
  );

  const [data, dispatch] = useReducer(reducer, config.guarantorCount, createEmptyData);
  const [hydrated, setHydrated] = useState(false);
  const didHydrate = useRef(false);

  const [saveError, setSaveError] = useState<string | null>(null);

  // Hydrate once from storage (client only). Async because the documents come
  // from IndexedDB.
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;

    let cancelled = false;
    void config.storage
      .load()
      .then((saved) => {
        if (cancelled) return;
        if (saved) dispatch({ type: "hydrate", data: saved });
      })
      .catch(() => {
        // A draft that cannot be read is not a reason to block the form —
        // starting fresh is still usable.
      })
      .finally(() => {
        if (!cancelled) setHydrated(true);
      });

    return () => {
      cancelled = true;
    };
  }, [config.storage]);

  // Persist after hydration, on every change.
  //
  // Saves are serialised through `saveChain`: writes are async now, and typing
  // fires them faster than IndexedDB completes them. Without ordering, an
  // earlier keystroke's write can land after a later one and silently undo it.
  const saveChain = useRef<Promise<unknown>>(Promise.resolve());

  useEffect(() => {
    if (!hydrated) return;

    let cancelled = false;
    saveChain.current = saveChain.current
      .then(() => config.storage.save(data))
      .then((result: SaveResult) => {
        if (cancelled) return;
        setSaveError(result.ok ? null : result.message);
      })
      .catch(() => {
        if (cancelled) return;
        setSaveError(
          "Your progress could not be saved on this device. It will be lost if you close this tab.",
        );
      });

    return () => {
      cancelled = true;
    };
  }, [data, hydrated, config.storage]);

  const value = useMemo<VerificationContextValue>(
    () => ({
      data,
      config,
      hydrated,
      saveError,
      update: (section, val) => dispatch({ type: "patch", section, value: val }),
      updateGuarantor: (index, val) => dispatch({ type: "setGuarantor", index, value: val }),
      setStatus: (status) => dispatch({ type: "setStatus", status }),
      purge: async () => {
        await config.storage.clear();
        setSaveError(null);
      },
      reset: () => {
        // Fire-and-forget by design: the caller has already moved on to the
        // success screen, and the in-memory state is cleared regardless.
        void config.storage.clear();
        setSaveError(null);
        dispatch({ type: "reset", data: createEmptyData(config.guarantorCount) });
      },
    }),
    [data, config, hydrated, saveError]
  );

  return <VerificationContext.Provider value={value}>{children}</VerificationContext.Provider>;
}

export function useVerification(): VerificationContextValue {
  const ctx = useContext(VerificationContext);
  if (!ctx) {
    throw new Error("useVerification must be used within a <VerificationProvider>.");
  }
  return ctx;
}
