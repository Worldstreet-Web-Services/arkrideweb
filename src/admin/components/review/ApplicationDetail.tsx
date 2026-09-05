"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import {
  ArrowRightIcon,
  CheckIcon,
  IdCardIcon,
  ReplaceIcon,
  WarningIcon,
} from "@/verification/components/icons";
import { VEHICLE_PHOTO_KEYS, type IdType } from "@/verification/types";
import { applicationsStore } from "@/admin/store/applicationsStore";
import { formatDateTime } from "@/admin/format";
import { applicantName, type Application, type SectionFlag } from "@/admin/types";
import { StatusBadge } from "../StatusBadge";
import { SectionCard, type Doc, type Row } from "./SectionCard";

const ID_LABEL: Record<IdType | "", string> = {
  nin: "NIN",
  passport: "International Passport",
  drivers_license: "Driver's License",
  "": "—",
};
const PHOTO_LABEL: Record<string, string> = {
  front: "Front",
  back: "Back",
  left: "Left side",
  right: "Right side",
  interior: "Interior",
  dashboard: "Dashboard",
  plate: "Plate",
};

type FlagMap = Record<string, { label: string; note: string }>;

export function ApplicationDetail({
  application: a,
  reviewerName,
}: {
  application: Application;
  reviewerName: string;
}) {
  const router = useRouter();
  const d = a.data;
  const decided = a.status !== "submitted";

  // Prefill flags when re-reviewing a "changes requested" application.
  const [flags, setFlags] = useState<FlagMap>(() => {
    const init: FlagMap = {};
    a.decision?.flags?.forEach((f) => (init[f.section] = { label: f.label, note: f.note }));
    return init;
  });
  const [dialog, setDialog] = useState<null | "approve" | "reject" | "changes">(null);
  const [reason, setReason] = useState("");

  const toggleFlag = (section: string, label: string) =>
    setFlags((prev) => {
      const next = { ...prev };
      if (next[section]) delete next[section];
      else next[section] = { label, note: "" };
      return next;
    });
  const setNote = (section: string, note: string) =>
    setFlags((prev) => ({ ...prev, [section]: { ...prev[section], note } }));

  const flagList: SectionFlag[] = useMemo(
    () =>
      Object.entries(flags)
        .map(([section, v]) => ({ section, label: v.label, note: v.note.trim() }))
        .filter((f) => f.note.length > 0),
    [flags]
  );

  const doApprove = () => {
    applicationsStore.approve(a.id, reviewerName);
    setDialog(null);
  };
  const doReject = () => {
    if (!reason.trim()) return;
    applicationsStore.reject(a.id, reason.trim(), reviewerName);
    setDialog(null);
  };
  const doRequestChanges = () => {
    if (flagList.length === 0) return;
    applicationsStore.requestChanges(a.id, flagList, reviewerName);
    setDialog(null);
  };

  const sectionProps = (key: string, label: string) => ({
    flagged: !!flags[key],
    note: flags[key]?.note ?? "",
    onToggleFlag: () => toggleFlag(key, label),
    onNoteChange: (v: string) => setNote(key, v),
  });

  const personalRows: Row[] = [
    { label: "Full name", value: applicantName(a) },
    { label: "Date of birth", value: d.personal.dob },
    { label: "Gender", value: d.personal.gender },
    { label: "Phone", value: d.personal.phone },
    { label: "Email", value: d.personal.email },
    { label: "Occupation", value: d.personal.occupation },
    { label: "Residential address", value: d.personal.residentialAddress },
  ];

  return (
    <div className="pb-28">
      {/* Back */}
      <Link
        href="/admin"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-neutral-500 transition-colors hover:text-neutral-900"
      >
        <ArrowRightIcon size={16} className="rotate-180" /> Applications
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-neutral-100 text-neutral-300">
            {d.personal.profilePhoto?.dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.personal.profilePhoto.dataUrl} alt="" className="size-full object-cover" />
            ) : (
              <IdCardIcon size={30} />
            )}
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900">{applicantName(a)}</h1>
            <p className="mt-0.5 text-sm text-neutral-500">
              {a.id} · Submitted {formatDateTime(a.submittedAt)}
            </p>
          </div>
        </div>
        <StatusBadge status={a.status} />
      </div>

      {/* Prior decision banner */}
      {decided && a.decision && (
        <div
          className={cn(
            "mt-5 rounded-xl border px-4 py-3 text-sm",
            a.status === "approved"
              ? "border-emerald-200 bg-emerald-50 text-emerald-800"
              : a.status === "rejected"
                ? "border-red-200 bg-red-50 text-red-800"
                : "border-blue-200 bg-blue-50 text-blue-800"
          )}
        >
          <p className="font-semibold">
            {a.status === "approved" && "Approved"}
            {a.status === "rejected" && "Rejected"}
            {a.status === "changes_requested" && "Changes requested"}
            {a.decision.reviewer && ` by ${a.decision.reviewer}`} · {formatDateTime(a.decision.reviewedAt)}
          </p>
          {a.decision.reason && <p className="mt-1">{a.decision.reason}</p>}
          {a.decision.flags && a.decision.flags.length > 0 && (
            <ul className="mt-1.5 list-inside list-disc space-y-0.5">
              {a.decision.flags.map((f, i) => (
                <li key={i}>
                  <span className="font-medium">{f.label}:</span> {f.note}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-1.5 text-xs opacity-70">You can still change this decision below.</p>
        </div>
      )}

      {/* Sections */}
      <div className="mt-6 flex flex-col gap-4">
        <SectionCard
          title="Personal Information"
          rows={personalRows}
          docs={[{ label: "Profile photo", file: d.personal.profilePhoto }]}
          {...sectionProps("personal", "Personal Information")}
        />

        <SectionCard
          title="Identity"
          rows={[
            { label: "ID type", value: ID_LABEL[d.identity.idType] },
            { label: "ID number", value: d.identity.idNumber },
            { label: "Expiry date", value: d.identity.expiryDate },
          ]}
          docs={[{ label: "ID document", file: d.identity.document }]}
          {...sectionProps("identity", "Identity")}
        />

        <SectionCard
          title="Address"
          rows={[
            { label: "Residential address", value: d.address.residentialAddress },
            { label: "State", value: d.address.state },
            { label: "LGA", value: d.address.lga },
            { label: "City", value: d.address.city },
          ]}
          docs={[{ label: "Proof of address", file: d.address.proofOfAddress }]}
          {...sectionProps("address", "Address")}
        />

        {d.guarantors.map((g, i) => (
          <SectionCard
            key={i}
            title={d.guarantors.length > 1 ? `Guarantor ${i + 1}` : "Guarantor"}
            rows={[
              { label: "Full name", value: g.fullName },
              { label: "Phone", value: g.phone },
              { label: "Relationship", value: g.relationship },
              { label: "Occupation", value: g.occupation },
              { label: "Address", value: g.address },
              { label: "ID", value: `${ID_LABEL[g.idType]} · ${g.idNumber}` },
            ]}
            docs={[
              { label: "Guarantor ID", file: g.idDocument },
              { label: "Guarantor photo", file: g.photograph },
            ]}
            {...sectionProps(`guarantor.${i}`, d.guarantors.length > 1 ? `Guarantor ${i + 1}` : "Guarantor")}
          />
        ))}

        <SectionCard
          title="Driver's License"
          rows={[
            { label: "License number", value: d.license.number },
            { label: "Category", value: d.license.category },
            { label: "Issue date", value: d.license.issueDate },
            { label: "Expiry date", value: d.license.expiryDate },
          ]}
          docs={[
            { label: "License front", file: d.license.front },
            { label: "License back", file: d.license.back },
          ]}
          {...sectionProps("license", "Driver's License")}
        />

        <SectionCard
          title="Vehicle"
          rows={[
            { label: "Type", value: d.vehicle.type },
            { label: "Make", value: d.vehicle.make },
            { label: "Model", value: d.vehicle.model },
            { label: "Year", value: d.vehicle.year },
            { label: "Color", value: d.vehicle.color },
            { label: "Plate number", value: d.vehicle.plateNumber },
            { label: "Registration number", value: d.vehicle.registrationNumber },
            { label: "Registration expiry", value: d.vehicle.registrationExpiry },
          ]}
          {...sectionProps("vehicle", "Vehicle")}
        />

        <SectionCard
          title="Vehicle Documents"
          docs={[
            { label: "Registration", file: d.vehicleDocuments.registration },
            { label: "Insurance", file: d.vehicleDocuments.insurance },
            { label: "Roadworthiness", file: d.vehicleDocuments.roadworthiness },
            { label: "FRSC", file: d.vehicleDocuments.frsc },
            ...VEHICLE_PHOTO_KEYS.map((k) => ({
              label: PHOTO_LABEL[k],
              file: d.vehicleDocuments.photos[k],
            })),
          ]}
          {...sectionProps("documents", "Vehicle Documents")}
        />
      </div>

      {/* Sticky decision bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-neutral-200 bg-white/95 px-6 py-3.5 backdrop-blur">
        <div className="mx-auto flex w-full max-w-320 items-center justify-between gap-3">
          <p className="hidden text-sm text-neutral-500 sm:block">
            {flagList.length > 0
              ? `${flagList.length} change${flagList.length > 1 ? "s" : ""} flagged`
              : "Review the details, then decide"}
          </p>
          <div className="flex flex-1 items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDialog("reject")}
              className="inline-flex items-center gap-1.5 rounded-full border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50"
            >
              <WarningIcon size={16} /> Reject
            </button>
            <button
              type="button"
              onClick={() => setDialog("changes")}
              disabled={flagList.length === 0}
              className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 px-4 py-2.5 text-sm font-semibold text-neutral-700 transition-colors hover:border-neutral-300 disabled:opacity-40 disabled:pointer-events-none"
            >
              <ReplaceIcon size={16} /> Request changes
            </button>
            <button
              type="button"
              onClick={() => setDialog("approve")}
              className="inline-flex items-center gap-1.5 rounded-full bg-neutral-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-neutral-800"
            >
              <CheckIcon size={16} /> Approve
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {dialog === "approve" && (
        <Modal title="Approve this application?" onClose={() => setDialog(null)}>
          <p className="text-sm text-neutral-600">
            {applicantName(a)} will be cleared to start accepting rides.
          </p>
          <DialogActions
            confirmLabel="Approve"
            confirmClass="bg-emerald-600 hover:bg-emerald-700"
            onCancel={() => setDialog(null)}
            onConfirm={doApprove}
          />
        </Modal>
      )}

      {dialog === "reject" && (
        <Modal title="Reject application" onClose={() => setDialog(null)}>
          <p className="text-sm text-neutral-600">Tell the driver why this was rejected.</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. The identity document didn't match the applicant's details."
            className="mt-3 min-h-24 w-full resize-y rounded-xl border border-neutral-200 bg-white px-3.5 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 outline-none focus:border-neutral-900 focus:ring-2 focus:ring-neutral-900/10"
            autoFocus
          />
          <DialogActions
            confirmLabel="Reject application"
            confirmClass="bg-red-600 hover:bg-red-700 disabled:opacity-40"
            confirmDisabled={!reason.trim()}
            onCancel={() => setDialog(null)}
            onConfirm={doReject}
          />
        </Modal>
      )}

      {dialog === "changes" && (
        <Modal title="Request changes" onClose={() => setDialog(null)}>
          <p className="text-sm text-neutral-600">
            The driver will be asked to fix these items and resubmit:
          </p>
          <ul className="mt-3 space-y-2">
            {flagList.map((f) => (
              <li key={f.section} className="rounded-lg bg-neutral-50 px-3 py-2 text-sm">
                <span className="font-semibold text-neutral-900">{f.label}</span>
                <span className="text-neutral-600"> — {f.note}</span>
              </li>
            ))}
          </ul>
          <DialogActions
            confirmLabel="Send request"
            confirmClass="bg-blue-600 hover:bg-blue-700"
            onCancel={() => setDialog(null)}
            onConfirm={doRequestChanges}
          />
        </Modal>
      )}
    </div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4">
      <div className="absolute inset-0 bg-neutral-900/40" onClick={onClose} aria-hidden />
      <div className="pop-in relative w-full max-w-md rounded-2xl border border-neutral-200 bg-white p-5 shadow-xl">
        <h3 className="text-lg font-bold text-neutral-900">{title}</h3>
        <div className="mt-3">{children}</div>
      </div>
    </div>
  );
}

function DialogActions({
  confirmLabel,
  confirmClass,
  confirmDisabled,
  onCancel,
  onConfirm,
}: {
  confirmLabel: string;
  confirmClass: string;
  confirmDisabled?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="mt-5 flex items-center justify-end gap-2">
      <button
        type="button"
        onClick={onCancel}
        className="rounded-full px-4 py-2.5 text-sm font-semibold text-neutral-600 transition-colors hover:text-neutral-900"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={confirmDisabled}
        className={cn(
          "rounded-full px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors",
          confirmClass
        )}
      >
        {confirmLabel}
      </button>
    </div>
  );
}
