"use client";

import { useRouter } from "next/navigation";
import { useVerification } from "../store/VerificationProvider";
import { completionPercent } from "../steps";
import { IdCardIcon, LockIcon } from "./icons";
import { cardCls } from "../ui";

/**
 * Right-column context card — mirrors the reference's listing summary. Shows the
 * applicant's photo, name, completion, and address as they fill the flow.
 */
export function VerificationSummaryCard() {
  const { data, config } = useVerification();
  const router = useRouter();
  const p = data.personal;
  const pct = completionPercent(data);
  const name = [p.firstName, p.lastName].filter(Boolean).join(" ") || "Your application";
  const photo = p.profilePhoto?.dataUrl;

  return (
    <div>
      <div className={`overflow-hidden ${cardCls} p-4`}>
        <div className="grid aspect-square w-full place-items-center overflow-hidden rounded-xl bg-neutral-100 text-neutral-300">
          {photo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={photo} alt={name} className="size-full object-cover" />
          ) : (
            <IdCardIcon size={48} />
          )}
        </div>

        <p className="mt-3.5 text-lg font-bold text-neutral-900">{name}</p>
        <p className="mt-0.5 text-sm text-neutral-500">Driver applicant</p>

        {/* Completion */}
        <div className="mt-3">
          <div className="mb-1.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-500">Application progress</span>
            <span className="text-xs font-bold text-neutral-900">{pct}%</span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-neutral-100">
            <div
              className="h-full rounded-full bg-neutral-900 transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {p.residentialAddress && (
          <p className="mt-3.5 border-t border-neutral-100 pt-3.5 text-sm leading-normal text-neutral-500">
            {p.residentialAddress}
          </p>
        )}
      </div>

      {/* Trust row */}
      <div className="mt-3.5 flex items-center gap-2 px-1 text-xs text-neutral-500">
        <LockIcon size={14} />
        <span>Your information is encrypted and kept private.</span>
      </div>

      <button
        type="button"
        onClick={() => router.push(config.dashboardUrl)}
        className="mt-3 text-sm font-medium text-neutral-900 underline underline-offset-4 transition-opacity hover:opacity-70"
      >
        Save &amp; exit
      </button>
    </div>
  );
}
