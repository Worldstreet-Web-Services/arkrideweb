"use server";

import { signInWithPrivy } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/types";
import type { ActionState } from "./rides";

/**
 * Exchange Privy tokens for an ArkRide session.
 *
 * The browser gets Privy tokens from the Privy SDK and hands them here. This
 * is the only place they are used: the server calls the API, the API verifies
 * them against Privy's public key, and the resulting ArkRide session comes
 * back as httpOnly cookies. The Privy tokens are never stored.
 *
 * The identity token is sent so the SERVER can verify it — never so it can be
 * trusted. It carries the verified email and the embedded wallet address.
 * Passing an email directly was an account-takeover vector and the API no
 * longer has that field at all.
 */
export async function privySignInAction(params: {
  accessToken: string;
  identityToken?: string;
  audience: "rider" | "driver";
  name?: string;
}): Promise<ActionState<{ role: string }>> {
  if (!params.accessToken) {
    return { error: "Sign-in did not complete. Please try again." };
  }

  try {
    const result = await signInWithPrivy(params);
    return { ok: true, data: { role: result.principal?.role ?? "user" } };
  } catch (error) {
    if (error instanceof ApiError) {
      // 503 means the server has no Privy verification key configured. Saying
      // "invalid token" there would send someone chasing their own account.
      if (error.statusCode === 503) {
        return { error: "Privy sign-in isn't available right now." };
      }
      return { error: error.message };
    }
    return { error: "Something went wrong. Please try again." };
  }
}
