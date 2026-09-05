"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useVerification } from "../../store/VerificationProvider";
import { STEPS, isStepComplete } from "../../steps";
import { btnLinkCls, btnPrimaryCls } from "../../ui";
import { Checkbox } from "../common/Checkbox";
import { CheckIcon, WarningIcon } from "../icons";

function mask(value: string): string {
  if (!value) return "—";
  const last4 = value.slice(-4);
  return `${"•".repeat(Math.max(0, value.length - 4))}${last4}`;
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 text-sm">
      <span className="text-text-muted">{label}</span>
      <span className="text-right font-medium text-text">{value || "—"}</span>
    </div>
  );
}

function SummaryCard({
  title,
  editPath,
  children,
}: {
  title: string;
  editPath: string;
  children: React.ReactNode;
}) {
  const router = useRouter();
  return (
    <div className="rounded-2xl border border-border-input bg-surface px-4.5 py-4">
      <div className="mb-3 flex justify-between">
        <p className="font-bold text-text">{title}</p>
        <button
          type="button"
          onClick={() => router.push(editPath)}
          className="text-[13px] font-semibold text-text underline underline-offset-4 hover:opacity-70"
        >
          Edit
        </button>
      </div>
      <div className="flex flex-col gap-2">{children}</div>
    </div>
  );
}

export function ReviewDetails() {
  const { data, config, setStatus, update, purge } = useVerification();
  const router = useRouter();
  const [agreed, setAgreed] = useState(data.consent.agreed);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const firstIncomplete = useMemo(() => STEPS.find((s) => !isStepComplete(data, s.id)), [data]);

  const p = data.personal;
  const idLabel = {
    nin: "NIN",
    passport: "International Passport",
    drivers_license: "Driver's License",
    "": "—",
  }[data.identity.idType];
  const docCheck = (ok: boolean, label: string) => (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="text-text-muted">{label}</span>
      {ok ? (
        <span className="inline-flex items-center gap-1.5 font-medium text-success-strong">
          <CheckIcon size={15} /> Uploaded
        </span>
      ) : (
        <span className="inline-flex items-center gap-1.5 font-medium text-danger">
          <WarningIcon size={15} /> Missing
        </span>
      )}
    </div>
  );

  const handleSubmit = async () => {
    setError(null);
    // Already sent. Without this, returning to /verify/review and pressing
    // submit again appends a second copy of the same application to the queue.
    if (submitting || data.status === "submitted") return;
    if (firstIncomplete) {
      setError(`Please complete "${firstIncomplete.title}" before submitting.`);
      return;
    }
    if (!agreed) {
      setError("Please confirm the declaration to submit.");
      return;
    }
    setSubmitting(true);
    try {
      await config.onSubmit(data);
      setStatus("submitted");
      // Erase the identity documents from this device now that they have been
      // handed off. Nothing did this before: `reset()` existed but was never
      // called, so a completed application left a full set of ID scans, a
      // proof-of-address bill and a face photo in browser storage for good —
      // on a shared or public machine, indefinitely.
      await purge();
      router.push("/verify/success");
    } catch {
      setError("We couldn't submit your verification. Please check your connection and try again.");
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight text-text">Review your details</h1>
      <p className="mt-1.5 text-[15px] text-text-muted">Check everything is correct before you submit.</p>

      <div className="mt-6 flex flex-col gap-3.5">
        <SummaryCard title="Personal Information" editPath="/verify/personal">
          <Row label="Name" value={[p.firstName, p.middleName, p.lastName].filter(Boolean).join(" ")} />
          <Row label="Phone" value={p.phone} />
          <Row label="Email" value={p.email} />
        </SummaryCard>

        <SummaryCard title="Identification" editPath="/verify/identity">
          <Row label="Type" value={idLabel} />
          <Row label="Number" value={mask(data.identity.idNumber)} />
        </SummaryCard>

        <SummaryCard title="Address" editPath="/verify/address">
          <Row label="Address" value={data.address.residentialAddress} />
          <Row label="State / LGA" value={[data.address.state, data.address.lga].filter(Boolean).join(" / ")} />
        </SummaryCard>

        <SummaryCard title="Guarantor" editPath="/verify/guarantor">
          {data.guarantors.map((g, i) => (
            <Row key={i} label={data.guarantors.length > 1 ? `Guarantor ${i + 1}` : "Name"} value={g.fullName} />
          ))}
        </SummaryCard>

        <SummaryCard title="Driver's License" editPath="/verify/license">
          <Row label="Number" value={data.license.number} />
          <Row label="Expiry" value={data.license.expiryDate} />
        </SummaryCard>

        <SummaryCard title="Vehicle" editPath="/verify/vehicle">
          <Row label="Vehicle" value={[data.vehicle.make, data.vehicle.model].filter(Boolean).join(" ")} />
          <Row label="Year" value={data.vehicle.year} />
          <Row label="Plate" value={data.vehicle.plateNumber} />
        </SummaryCard>

        <SummaryCard title="Documents" editPath="/verify/documents">
          {docCheck(!!data.identity.document, "Identity document")}
          {docCheck(!!data.address.proofOfAddress, "Proof of address")}
          {docCheck(!!data.license.front, "Driver's license")}
          {docCheck(!!data.vehicleDocuments.registration, "Vehicle registration")}
          {docCheck(!!data.vehicleDocuments.insurance, "Insurance")}
          {docCheck(Object.values(data.vehicleDocuments.photos).every(Boolean), "Vehicle photos")}
        </SummaryCard>
      </div>

      <div className="mt-5 rounded-2xl border border-border-input bg-surface px-4.5 py-4">
        <Checkbox
          checked={agreed}
          onChange={(v) => {
            setAgreed(v);
            update("consent", { agreed: v });
          }}
        >
          I confirm that the information and documents provided are accurate and belong to me.
        </Checkbox>
      </div>

      {error && <p className="mt-3.5 text-sm text-danger">{error}</p>}

      <div className="mt-6 flex items-center gap-2">
        <button
          type="button"
          className={btnPrimaryCls}
          onClick={handleSubmit}
          disabled={submitting || !agreed}
        >
          {submitting ? "Submitting…" : "Submit for Verification"}
        </button>
        <button type="button" className={btnLinkCls} onClick={() => router.push(STEPS[STEPS.length - 1].path)}>
          Back
        </button>
      </div>
    </div>
  );
}
