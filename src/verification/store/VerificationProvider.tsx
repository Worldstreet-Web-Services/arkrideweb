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
  update: <S extends Section>(section: S, value: Partial<VerificationData[S]>) => void;
  updateGuarantor: (
    index: number,
    value: Partial<VerificationData["guarantors"][number]>
  ) => void;
  setStatus: (status: VerificationData["status"]) => void;
  reset: () => void;
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

  // Hydrate once from storage (client only).
  useEffect(() => {
    if (didHydrate.current) return;
    didHydrate.current = true;
    const saved = config.storage.load();
    if (saved) dispatch({ type: "hydrate", data: saved });
    setHydrated(true);
  }, [config.storage]);

  // Persist after hydration, on every change.
  useEffect(() => {
    if (!hydrated) return;
    config.storage.save(data);
  }, [data, hydrated, config.storage]);

  const value = useMemo<VerificationContextValue>(
    () => ({
      data,
      config,
      hydrated,
      update: (section, val) => dispatch({ type: "patch", section, value: val }),
      updateGuarantor: (index, val) => dispatch({ type: "setGuarantor", index, value: val }),
      setStatus: (status) => dispatch({ type: "setStatus", status }),
      reset: () => {
        config.storage.clear();
        dispatch({ type: "reset", data: createEmptyData(config.guarantorCount) });
      },
    }),
    [data, config, hydrated]
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
