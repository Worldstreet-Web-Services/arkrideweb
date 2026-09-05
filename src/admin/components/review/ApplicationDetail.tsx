"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
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
import { Modal } from "./Modal";
import { SectionCard, type Row } from "./SectionCard";

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

  const [actionError, setActionError] = useState<string | null>(null);

  /**
   * Recording a decision can now fail loudly instead of quietly.
   *
   * Without this the throw would be swallowed by React's event handling and
   * the reviewer would watch the dialog close with nothing recorded — the
   * worst outcome on a screen that decides whether someone can work.
   */
  const record = (fn: () => void) => {
    try {
      fn();
      setActionError(null);
      setDialog(null);
    } catch {
      setActionError(
        "That decision could not be saved. Check your connection and try again.",
      );
    }
  };

  const doApprove = () => record(() => applicationsStore.approve(a.id, reviewerName));
  const doReject = () => {
    if (!reason.trim()) return;
    record(() => applicationsStore.reject(a.id, reason.trim(), reviewerName));
  };
  const doRequestChanges = () => {
    if (flagList.length === 0) return;
    record(() => applicationsStore.requestChanges(a.id, flagList, reviewerName));
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
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-text-muted transition-colors hover:text-text"
      >
        <ArrowRightIcon size={16} className="rotate-180" /> Applications
      </Link>

      {/* Header */}
      <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-2xl bg-surface-sunken text-text-placeholder">
            {d.personal.profilePhoto?.dataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={d.personal.profilePhoto.dataUrl} alt="" className="size-full object-cover" />
            ) : (
              <IdCardIcon size={30} />
            )}
          </span>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-text">{applicantName(a)}</h1>
            <p className="mt-0.5 text-sm text-text-muted">
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
              ? "border-success-border bg-success-tint text-success-strong"
              : a.status === "rejected"
                ? "border-danger-border bg-danger-tint text-danger"
                : "border-info-border bg-info-tint text-info-strong"
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
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-6 py-3.5 backdrop-blur">
        {actionError && (
          <div className="mx-auto mb-3 w-full max-w-320" role="alert">
            <p className="rounded-2xl border border-danger-border bg-danger-tint px-4 py-2.5 text-sm font-medium text-danger">
              {actionError}
            </p>
          </div>
        )}
        <div className="mx-auto flex w-full max-w-320 items-center justify-between gap-3">
          <p className="hidden text-sm text-text-muted sm:block">
            {flagList.length > 0
              ? `${flagList.length} change${flagList.length > 1 ? "s" : ""} flagged`
              : "Review the details, then decide"}
          </p>
          <div className="flex flex-1 items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setDialog("reject")}
              className="inline-flex items-center gap-1.5 rounded-pill border border-danger-border px-4 py-2.5 text-sm font-semibold text-danger transition-colors hover:bg-danger-tint focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-danger"
            >
              <WarningIcon size={16} /> Reject
            </button>
            <button
              type="button"
              onClick={() => setDialog("changes")}
              disabled={flagList.length === 0}
              className="inline-flex items-center gap-1.5 rounded-pill border border-border-input px-4 py-2.5 text-sm font-semibold text-text-soft transition-colors hover:border-border-strong focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:opacity-40 disabled:pointer-events-none"
            >
              <ReplaceIcon size={16} /> Request changes
            </button>
            <button
              type="button"
              onClick={() => setDialog("approve")}
              className="inline-flex items-center gap-1.5 rounded-pill bg-primary px-5 py-2.5 text-sm font-bold text-on-primary shadow-primary transition-colors hover:bg-primary-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
            >
              <CheckIcon size={16} /> Approve
            </button>
          </div>
        </div>
      </div>

      {/* Dialogs */}
      {dialog === "approve" && (
        <Modal title="Approve this application?" onClose={() => setDialog(null)}>
          <p className="text-sm text-text-muted">
            {applicantName(a)} will be cleared to start accepting rides.
          </p>
          <DialogActions
            confirmLabel="Approve"
            confirmClass="bg-primary text-on-primary hover:bg-primary-hover"
            onCancel={() => setDialog(null)}
            onConfirm={doApprove}
          />
        </Modal>
      )}

      {dialog === "reject" && (
        <Modal title="Reject application" onClose={() => setDialog(null)}>
          <p className="text-sm text-text-muted">Tell the driver why this was rejected.</p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. The identity document didn't match the applicant's details."
            className="mt-3 min-h-24 w-full resize-y rounded-2xl border border-border-input bg-surface px-3.5 py-2.5 text-sm text-text placeholder:text-text-placeholder outline-none focus-visible:border-primary focus-visible:ring-4 focus-visible:ring-primary/25"
            autoFocus
          />
          <DialogActions
            confirmLabel="Reject application"
            confirmClass="bg-danger text-white hover:bg-danger-soft disabled:opacity-40"
            confirmDisabled={!reason.trim()}
            onCancel={() => setDialog(null)}
            onConfirm={doReject}
          />
        </Modal>
      )}

      {dialog === "changes" && (
        <Modal title="Request changes" onClose={() => setDialog(null)}>
          <p className="text-sm text-text-muted">
            The driver will be asked to fix these items and resubmit:
          </p>
          <ul className="mt-3 space-y-2">
            {flagList.map((f) => (
              <li key={f.section} className="rounded-xl bg-surface-sunken px-3 py-2 text-sm">
                <span className="font-semibold text-text">{f.label}</span>
                <span className="text-text-muted"> — {f.note}</span>
              </li>
            ))}
          </ul>
          <DialogActions
            confirmLabel="Send request"
            confirmClass="bg-surface-inverse text-on-inverse hover:opacity-90"
            onCancel={() => setDialog(null)}
            onConfirm={doRequestChanges}
          />
        </Modal>
      )}
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
        className="rounded-full px-4 py-2.5 text-sm font-semibold text-text-muted transition-colors hover:text-text"
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
