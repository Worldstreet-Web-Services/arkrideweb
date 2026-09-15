import "server-only";

import { api } from "./client";

/**
 * The pre-launch waitlist, `POST /api/v1/waitlist`.
 *
 * Anonymous by design — nobody on the waitlist has an account yet. The API
 * stores the address once and answers the same way whether it was new or
 * already there, so this endpoint cannot be used to check who has signed up.
 */
export interface WaitlistSignup {
  email: string;
  joined: true;
}

export interface JoinWaitlistInput {
  email: string;
  /** Who is joining. The API defaults to `user` when this is absent. */
  role?: "user" | "driver";
  /** The feature they would most like to see. Optional, up to 500 characters. */
  feature?: string;
  /** Where the sign-up came from, for the ops team. This page sends `web`. */
  source?: string;
}

export function joinWaitlist(input: JoinWaitlistInput): Promise<WaitlistSignup> {
  return api<WaitlistSignup>("/waitlist", {
    method: "POST",
    body: input,
    auth: false,
  });
}
