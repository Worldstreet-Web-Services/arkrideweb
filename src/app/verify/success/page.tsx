"use client";

import { useRouter } from "next/navigation";
import { useVerification } from "@/verification/store/VerificationProvider";
import { btnPrimaryCls } from "@/verification/ui";
import { ClockIcon, ShieldCheckIcon } from "@/verification/components/icons";

export default function SuccessPage() {
  const router = useRouter();
  const { config } = useVerification();

  return (
    <div className="flex flex-col items-center pt-12 text-center">
      <div className="pop-in grid size-20 place-items-center rounded-full bg-neutral-900 text-white shadow-lg">
        <ShieldCheckIcon size={40} />
      </div>

      <h1 className="mt-6 text-[26px] font-extrabold tracking-tight text-neutral-900">
        Verification Submitted
      </h1>
      <p className="mt-3 max-w-md leading-relaxed text-neutral-500">
        Your information has been successfully submitted and is currently being reviewed. We&apos;ll
        notify you once the review is complete.
      </p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-700 ring-1 ring-amber-200">
        <ClockIcon size={16} /> Status: Under Review
      </div>

      <button
        type="button"
        className={`${btnPrimaryCls} mt-8 min-w-55`}
        onClick={() => router.push(config.dashboardUrl)}
      >
        Back to Dashboard
      </button>
    </div>
  );
}
