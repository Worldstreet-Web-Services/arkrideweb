import type { FieldErrors, VerificationData } from "./types";
import {
  dateRequired,
  email,
  fileRequired,
  phoneNG,
  notExpired,
  required,
} from "./validation";

/**
 * The ordered verification flow. This registry drives routing, the progress
 * stepper, and Continue-gating — add/remove/reorder a step in one place.
 *
 * `validate` returns only the fields that are wrong; an empty object = valid.
 */
export interface StepDef {
  id: string;
  title: string;
  path: string; // route under /verify
  validate: (data: VerificationData) => FieldErrors;
}

/** Drops null results from validators into a FieldErrors map. */
function collect(entries: Record<string, string | null>): FieldErrors {
  const out: FieldErrors = {};
  for (const [k, v] of Object.entries(entries)) if (v) out[k] = v;
  return out;
}

export const STEPS: StepDef[] = [
  {
    id: "personal",
    title: "Personal Information",
    path: "/verify/personal",
    validate: ({ personal: p }) =>
      collect({
        firstName: required(p.firstName, "First name"),
        lastName: required(p.lastName, "Last name"),
        dob: dateRequired(p.dob, "Date of birth"),
        gender: required(p.gender, "Gender"),
        phone: phoneNG(p.phone),
        email: email(p.email),
        occupation: required(p.occupation, "Occupation"),
        residentialAddress: required(p.residentialAddress, "Residential address"),
        profilePhoto: fileRequired(p.profilePhoto, "profile photograph"),
      }),
  },
  {
    id: "identity",
    title: "Identity",
    path: "/verify/identity",
    validate: ({ identity: i }) =>
      collect({
        idType: required(i.idType, "Identification type"),
        idNumber: required(i.idNumber, "Identification number"),
        document: fileRequired(i.document, "identification document"),
        // `expiryDate` is optional — a NIN has none — so an empty value is
        // fine and only a supplied, past date is rejected.
        expiryDate: i.expiryDate ? notExpired(i.expiryDate, "Expiry date") : null,
      }),
  },
  {
    id: "address",
    title: "Address",
    path: "/verify/address",
    validate: ({ address: a }) =>
      collect({
        residentialAddress: required(a.residentialAddress, "Residential address"),
        state: required(a.state, "State"),
        lga: required(a.lga, "LGA"),
        city: required(a.city, "City"),
        proofOfAddress: fileRequired(a.proofOfAddress, "proof of address"),
      }),
  },
  {
    id: "guarantor",
    title: "Guarantor",
    path: "/verify/guarantor",
    validate: ({ guarantors }) => {
      const out: FieldErrors = {};
      guarantors.forEach((g, idx) => {
        const errs = collect({
          fullName: required(g.fullName, "Guarantor name"),
          phone: phoneNG(g.phone),
          relationship: required(g.relationship, "Relationship"),
          occupation: required(g.occupation, "Occupation"),
          address: required(g.address, "Address"),
          idType: required(g.idType, "ID type"),
          idNumber: required(g.idNumber, "ID number"),
          idDocument: fileRequired(g.idDocument, "guarantor ID document"),
          photograph: fileRequired(g.photograph, "guarantor photograph"),
        });
        for (const [k, v] of Object.entries(errs)) out[`g${idx}.${k}`] = v;
      });
      return out;
    },
  },
  {
    id: "license",
    title: "Driver's License",
    path: "/verify/license",
    validate: ({ license: l }) =>
      collect({
        number: required(l.number, "License number"),
        issueDate: dateRequired(l.issueDate, "Issue date"),
        expiryDate: notExpired(l.expiryDate, "Expiry date"),
        category: required(l.category, "License category"),
        front: fileRequired(l.front, "front of your driver's license"),
      }),
  },
  {
    id: "vehicle",
    title: "Vehicle",
    path: "/verify/vehicle",
    validate: ({ vehicle: v }) =>
      collect({
        type: required(v.type, "Vehicle type"),
        make: required(v.make, "Make"),
        model: required(v.model, "Model"),
        year: required(v.year, "Year"),
        color: required(v.color, "Color"),
        plateNumber: required(v.plateNumber, "Plate number"),
        registrationNumber: required(v.registrationNumber, "Registration number"),
      }),
  },
  {
    id: "documents",
    title: "Vehicle Documents",
    path: "/verify/documents",
    validate: ({ vehicleDocuments: d }) => {
      const out = collect({
        registration: fileRequired(d.registration, "vehicle registration"),
        insurance: fileRequired(d.insurance, "insurance document"),
        roadworthiness: fileRequired(d.roadworthiness, "roadworthiness certificate"),
      });
      // Every required vehicle-photo angle must be present.
      for (const [key, file] of Object.entries(d.photos)) {
        if (!file) out[`photo.${key}`] = `Please add the ${key} photo.`;
      }
      return out;
    },
  },
];

export const STEP_COUNT = STEPS.length;

export function stepIndexById(id: string): number {
  return STEPS.findIndex((s) => s.id === id);
}

/** A step is complete when its validator finds no errors. */
export function isStepComplete(data: VerificationData, id: string): boolean {
  const step = STEPS.find((s) => s.id === id);
  return step ? Object.keys(step.validate(data)).length === 0 : false;
}

/** 0–100 completion across all steps, for the dashboard/progress bar. */
export function completionPercent(data: VerificationData): number {
  const done = STEPS.filter((s) => isStepComplete(data, s.id)).length;
  return Math.round((done / STEP_COUNT) * 100);
}
