import { NextResponse } from "next/server";

import { joinWaitlist, type WaitlistUserType } from "@/lib/api/waitlist";
import { ApiError } from "@/lib/api/types";

/**
 * Same-origin proxy for `POST /api/v1/public/waitlist` on arkride-backend.
 *
 * The client-side waitlist service (`src/services/waitlist.service.ts`) calls
 * THIS route rather than the backend directly, so the request never leaves
 * this app's own origin (no CORS dependency on the backend) and
 * `ARKRIDE_API_URL` — deliberately server-only, see `src/lib/api/client.ts` —
 * never has to be exposed to the browser.
 */

const WAITLIST_FIELDS = [
  "userType",
  "name",
  "email",
  "phoneNumber",
  "feature",
] as const;

interface WaitlistRequestBody {
  name?: unknown;
  email?: unknown;
  phoneNumber?: unknown;
  userType?: unknown;
  feature?: unknown;
}

export async function POST(request: Request) {
  let body: WaitlistRequestBody;
  try {
    body = (await request.json()) as WaitlistRequestBody;
  } catch {
    return NextResponse.json(
      {
        success: false,
        code: "VALIDATION_FAILED",
        message: "Send a valid JSON body.",
      },
      { status: 400 },
    );
  }

  const userType: WaitlistUserType | null =
    body.userType === "driver"
      ? "driver"
      : body.userType === "user"
        ? "user"
        : null;
  const email = typeof body.email === "string" ? body.email : "";
  const phoneNumber =
    typeof body.phoneNumber === "string" ? body.phoneNumber : "";

  if (!userType || !email || !phoneNumber) {
    return NextResponse.json(
      {
        success: false,
        code: "VALIDATION_FAILED",
        message: "Please check your details and try again.",
        fieldErrors: {
          ...(userType ? {} : { userType: "Choose whether you want to ride or drive." }),
          ...(email ? {} : { email: "Enter a valid email address." }),
          ...(phoneNumber ? {} : { phoneNumber: "Enter a valid phone number." }),
        },
      },
      { status: 400 },
    );
  }

  const name = typeof body.name === "string" ? body.name : undefined;
  const feature = typeof body.feature === "string" ? body.feature : undefined;

  try {
    const entry = await joinWaitlist({
      name: name || undefined,
      email,
      phoneNumber,
      userType,
      feature: feature || undefined,
    });
    return NextResponse.json(
      { success: true, alreadyJoined: false, data: entry },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof ApiError) {
      // The address is already on the list. For the person at the keyboard
      // that is the outcome they came for, so this is a domain SUCCESS.
      if (error.code === "CONFLICT") {
        return NextResponse.json(
          { success: true, alreadyJoined: true },
          { status: 200 },
        );
      }

      const fieldErrors =
        error.code === "VALIDATION_FAILED"
          ? Object.fromEntries(
              Object.entries(error.toFieldMap()).filter(([field]) =>
                (WAITLIST_FIELDS as readonly string[]).includes(field),
              ),
            )
          : undefined;

      return NextResponse.json(
        {
          success: false,
          code: error.code,
          message: error.message,
          fieldErrors:
            fieldErrors && Object.keys(fieldErrors).length > 0
              ? fieldErrors
              : undefined,
        },
        { status: error.statusCode || 400 },
      );
    }

    return NextResponse.json(
      {
        success: false,
        code: "INTERNAL_ERROR",
        message: "Something went wrong. Please try again.",
      },
      { status: 500 },
    );
  }
}
