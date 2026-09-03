import { createEmptyData } from "@/verification/defaults";
import type { UploadedFile, VerificationData } from "@/verification/types";
import type { Application } from "../types";

/**
 * Deterministic mock applications so the dashboard is fully clickable without a
 * backend. Fixed IDs/dates keep it stable across reloads. Document previews use
 * a small inline SVG placeholder.
 */

function placeholder(label: string): UploadedFile {
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='320' height='200'>
    <rect width='100%' height='100%' fill='#f5f5f5'/>
    <rect x='0.5' y='0.5' width='319' height='199' fill='none' stroke='#e4e4e4'/>
    <text x='50%' y='50%' font-family='sans-serif' font-size='15' fill='#9b9b9b'
      text-anchor='middle' dominant-baseline='middle'>${label}</text>
  </svg>`;
  return {
    name: `${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}.png`,
    type: "image/png",
    size: 184_000,
    dataUrl: `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`,
  };
}

/** Build a fully-filled verification snapshot, overriding a few identifying fields. */
function filledData(over: {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  make: string;
  model: string;
  year: string;
  color: string;
  plate: string;
  licenseExpiry: string;
}): VerificationData {
  const d = createEmptyData(1);
  d.personal = {
    firstName: over.firstName,
    middleName: "",
    lastName: over.lastName,
    dob: "1992-04-18",
    gender: "male",
    phone: over.phone,
    email: over.email,
    occupation: "Professional driver",
    residentialAddress: "14 Adeniyi Jones Ave, Ikeja, Lagos",
    profilePhoto: placeholder("Profile photo"),
  };
  d.identity = {
    idType: "nin",
    idNumber: "12345678901",
    expiryDate: "",
    document: placeholder("NIN slip"),
  };
  d.address = {
    residentialAddress: "14 Adeniyi Jones Ave",
    state: "Lagos",
    lga: "Ikeja",
    city: "Ikeja",
    proofOfAddress: placeholder("Utility bill"),
  };
  d.guarantors = [
    {
      fullName: "Ngozi Okafor",
      phone: "+2348030000000",
      relationship: "Sibling",
      occupation: "Teacher",
      address: "3 Allen Ave, Ikeja, Lagos",
      idType: "drivers_license",
      idNumber: "AKR12345",
      idDocument: placeholder("Guarantor ID"),
      photograph: placeholder("Guarantor photo"),
    },
  ];
  d.license = {
    number: "FKJ-08421",
    issueDate: "2021-06-01",
    expiryDate: over.licenseExpiry,
    category: "C",
    front: placeholder("License front"),
    back: placeholder("License back"),
  };
  d.vehicle = {
    type: "Sedan",
    make: over.make,
    model: over.model,
    year: over.year,
    color: over.color,
    plateNumber: over.plate,
    registrationNumber: "REG-" + over.plate.replace(/[^A-Z0-9]/g, ""),
    registrationExpiry: "2027-01-31",
  };
  d.vehicleDocuments = {
    registration: placeholder("Vehicle reg"),
    insurance: placeholder("Insurance"),
    roadworthiness: placeholder("Roadworthiness"),
    frsc: null,
    photos: {
      front: placeholder("Front"),
      back: placeholder("Back"),
      left: placeholder("Left"),
      right: placeholder("Right"),
      interior: placeholder("Interior"),
      dashboard: placeholder("Dashboard"),
      plate: placeholder("Plate"),
    },
  };
  d.consent = { agreed: true };
  d.status = "submitted";
  return d;
}

export function seedApplications(): Application[] {
  return [
    {
      id: "app-1042",
      submittedAt: "2026-09-02T08:12:00Z",
      status: "submitted",
      data: filledData({
        firstName: "Adewale",
        lastName: "Balogun",
        phone: "+2348012345678",
        email: "adewale.b@example.com",
        make: "Toyota",
        model: "Corolla",
        year: "2019",
        color: "Black",
        plate: "ABC-123-XY",
        licenseExpiry: "2028-06-01",
      }),
    },
    {
      id: "app-1041",
      submittedAt: "2026-09-02T06:45:00Z",
      status: "submitted",
      data: filledData({
        firstName: "Chidinma",
        lastName: "Eze",
        phone: "+2348023456789",
        email: "chidinma.eze@example.com",
        make: "Honda",
        model: "Accord",
        year: "2020",
        color: "Silver",
        plate: "KJA-884-LG",
        licenseExpiry: "2029-02-15",
      }),
    },
    {
      id: "app-1039",
      submittedAt: "2026-09-01T15:20:00Z",
      status: "changes_requested",
      data: filledData({
        firstName: "Ibrahim",
        lastName: "Sule",
        phone: "+2348034567890",
        email: "ibrahim.sule@example.com",
        make: "Kia",
        model: "Rio",
        year: "2018",
        color: "Grey",
        plate: "GGE-201-AA",
        licenseExpiry: "2025-01-01", // expired — reason to flag
      }),
      decision: {
        outcome: "changes_requested",
        reviewer: "Ops Reviewer",
        reviewedAt: "2026-09-01T16:05:00Z",
        flags: [
          { section: "license", label: "Driver's License · Front image", note: "Image is blurry — please re-upload a clear photo." },
        ],
      },
    },
    {
      id: "app-1035",
      submittedAt: "2026-08-31T11:02:00Z",
      status: "approved",
      data: filledData({
        firstName: "Funmilayo",
        lastName: "Adeyemi",
        phone: "+2348045678901",
        email: "funmi.adeyemi@example.com",
        make: "Toyota",
        model: "Camry",
        year: "2021",
        color: "White",
        plate: "LND-284-EP",
        licenseExpiry: "2030-03-10",
      }),
      decision: {
        outcome: "approved",
        reviewer: "Ops Reviewer",
        reviewedAt: "2026-08-31T12:30:00Z",
      },
    },
    {
      id: "app-1030",
      submittedAt: "2026-08-30T09:15:00Z",
      status: "rejected",
      data: filledData({
        firstName: "Emeka",
        lastName: "Nwosu",
        phone: "+2348056789012",
        email: "emeka.nwosu@example.com",
        make: "Nissan",
        model: "Almera",
        year: "2016",
        color: "Blue",
        plate: "AGL-556-KJ",
        licenseExpiry: "2027-11-20",
      }),
      decision: {
        outcome: "rejected",
        reviewer: "Ops Reviewer",
        reviewedAt: "2026-08-30T10:40:00Z",
        reason: "Identity document did not match the applicant's details.",
      },
    },
    {
      id: "app-1028",
      submittedAt: "2026-08-29T18:48:00Z",
      status: "submitted",
      data: filledData({
        firstName: "Blessing",
        lastName: "Okon",
        phone: "+2348067890123",
        email: "blessing.okon@example.com",
        make: "Hyundai",
        model: "Elantra",
        year: "2022",
        color: "Red",
        plate: "MUS-140-XA",
        licenseExpiry: "2031-05-05",
      }),
    },
  ];
}
