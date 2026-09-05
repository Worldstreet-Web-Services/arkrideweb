"use server";

import { revalidatePath } from "next/cache";
import { requestFuelSupport, requestPayout } from "@/lib/api/wallet";
import { ApiError } from "@/lib/api/types";
import type { FormState } from "./auth";

/**
 * Money movements.
 *
 * The amount limits below mirror the API's and exist to give an answer without
 * a round trip; the API's are the ones that count. Both are stated in the UI
 * so a refusal is never a surprise.
 */

const MIN_PAYOUT = 500;
const MIN_FUEL = 100;

function fail(error: unknown): FormState {
  if (error instanceof ApiError) {
    if (error.code === "VALIDATION_FAILED") {
      return {
        error: "Please check the highlighted fields.",
        fieldErrors: error.toFieldMap(),
      };
    }
    return { error: error.message };
  }
  return { error: "Something went wrong. Please try again." };
}

export async function requestPayoutAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const amount = Number(formData.get("amount"));
  const accountNumber = String(formData.get("accountNumber") ?? "").replace(/\D/g, "");
  const bankCode = String(formData.get("bankCode") ?? "").trim();
  const accountName = String(formData.get("accountName") ?? "").trim();

  if (!Number.isFinite(amount) || amount < MIN_PAYOUT) {
    return {
      error: `The minimum payout is ₦${MIN_PAYOUT}.`,
      fieldErrors: { amount: `Enter ₦${MIN_PAYOUT} or more.` },
    };
  }

  // NUBAN is exactly 10 digits. Checking here means a typo is caught before it
  // becomes a failed transfer.
  if (!/^\d{10}$/.test(accountNumber)) {
    return {
      error: "That account number doesn't look right.",
      fieldErrors: { accountNumber: "Enter the 10-digit account number." },
    };
  }

  if (!bankCode) {
    return {
      error: "Choose your bank.",
      fieldErrors: { bankCode: "Choose your bank." },
    };
  }

  try {
    await requestPayout({
      amount,
      bankAccount: {
        accountNumber,
        bankCode,
        ...(accountName ? { accountName } : {}),
      },
    });
  } catch (error) {
    return fail(error);
  }

  revalidatePath("/driver/earnings");
  return {};
}

export async function requestFuelSupportAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const amount = Number(formData.get("amount"));

  if (!Number.isFinite(amount) || amount < MIN_FUEL) {
    return {
      error: `The minimum request is ₦${MIN_FUEL}.`,
      fieldErrors: { amount: `Enter ₦${MIN_FUEL} or more.` },
    };
  }

  try {
    await requestFuelSupport(amount);
  } catch (error) {
    return fail(error);
  }

  revalidatePath("/driver/earnings");
  return {};
}
