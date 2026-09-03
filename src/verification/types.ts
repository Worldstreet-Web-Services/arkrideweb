/**
 * Driver Verification — data models.
 *
 * These types are the SDK's contract. Field names mirror the mobile driver
 * app (`arkdrivers/src/types` VehicleInfo / DriverDocuments) so a future API
 * can serve both the app and this portal without translation.
 */

/** A client-side uploaded file — metadata plus a preview data URL. */
export interface UploadedFile {
  name: string;
  type: string; // MIME type
  size: number; // bytes
  dataUrl: string; // base64 preview (images downscaled before storing)
}

export type Gender = "male" | "female" | "other";

export type IdType = "nin" | "passport" | "drivers_license";

export interface PersonalInfo {
  firstName: string;
  middleName: string;
  lastName: string;
  dob: string; // ISO yyyy-mm-dd
  gender: Gender | "";
  phone: string;
  email: string;
  occupation: string;
  residentialAddress: string;
  profilePhoto: UploadedFile | null;
}

export interface IdentityInfo {
  idType: IdType | "";
  idNumber: string;
  expiryDate: string; // optional depending on idType
  document: UploadedFile | null;
}

export interface AddressInfo {
  residentialAddress: string;
  state: string;
  lga: string;
  city: string;
  proofOfAddress: UploadedFile | null;
}

export interface Guarantor {
  fullName: string;
  phone: string;
  relationship: string;
  occupation: string;
  address: string;
  idType: IdType | "";
  idNumber: string;
  idDocument: UploadedFile | null;
  photograph: UploadedFile | null;
}

export interface LicenseInfo {
  number: string;
  issueDate: string;
  expiryDate: string;
  category: string; // license class, e.g. "C"
  front: UploadedFile | null;
  back: UploadedFile | null;
}

export interface VehicleInfo {
  type: string; // "Sedan", "SUV", "Keke"…
  make: string;
  model: string;
  year: string;
  color: string;
  plateNumber: string;
  registrationNumber: string;
  registrationExpiry: string;
}

/** Ordered set of required vehicle-photo angles. */
export const VEHICLE_PHOTO_KEYS = [
  "front",
  "back",
  "left",
  "right",
  "interior",
  "dashboard",
  "plate",
] as const;
export type VehiclePhotoKey = (typeof VEHICLE_PHOTO_KEYS)[number];

export interface VehicleDocuments {
  registration: UploadedFile | null;
  insurance: UploadedFile | null;
  roadworthiness: UploadedFile | null;
  frsc: UploadedFile | null; // optional
  photos: Record<VehiclePhotoKey, UploadedFile | null>;
}

export interface Consent {
  agreed: boolean;
}

export type VerificationStatus =
  | "not_started"
  | "in_progress"
  | "submitted" // under review
  | "approved"
  | "rejected";

export interface VerificationData {
  personal: PersonalInfo;
  identity: IdentityInfo;
  address: AddressInfo;
  guarantors: Guarantor[];
  license: LicenseInfo;
  vehicle: VehicleInfo;
  vehicleDocuments: VehicleDocuments;
  consent: Consent;
  status: VerificationStatus;
}

/** Map of field name → human-readable error message. */
export type FieldErrors = Record<string, string>;
