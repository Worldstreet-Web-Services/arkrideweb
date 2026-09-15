import "server-only";

import { api } from "./client";

/**
 * The pre-launch waitlist: `POST /api/v1/public/waitlist`, served by
 * arkride-backend's `apps/api/src/public` module.
 *
 * Anonymous. The API stores one row per email address and answers a repeat
 * with a 409, which the server action turns into the same "you're on the
 * list" outcome the person wanted.
 */
export type WaitlistUserType = "user" | "driver";

/** The row the API returns on 201. */
export interface WaitlistEntry {
  id: string;
  email: string;
  userType: WaitlistUserType;
  feature: string | null;
  createdAt: string;
}

export interface JoinWaitlistInput {
  email: string;
  userType: WaitlistUserType;
  /** "What feature would you like to see?" Optional, up to 500 characters. */
  feature?: string;
  /** Required by the API. */
  phoneNumber: string;
  name?: string;
}

export function joinWaitlist(input: JoinWaitlistInput): Promise<WaitlistEntry> {
  return api<WaitlistEntry>("/public/waitlist", {
    method: "POST",
    body: input,
    auth: false,
  });
}
