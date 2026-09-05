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
      <div className="pop-in grid size-20 place-items-center rounded-full bg-surface-inverse text-white shadow-lg">
        <ShieldCheckIcon size={40} />
      </div>

      <h1 className="mt-6 text-[26px] font-bold tracking-tight text-text">
        Verification Submitted
      </h1>
      <p className="mt-3 max-w-md leading-relaxed text-text-muted">
        Your information has been successfully submitted and is currently being reviewed. We&apos;ll
        notify you once the review is complete.
      </p>

      <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-warning-tint px-4 py-2 text-sm font-semibold text-primary-ink ring-1 ring-warning/35">
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
