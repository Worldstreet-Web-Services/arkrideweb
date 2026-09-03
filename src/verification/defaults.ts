import type { Guarantor, VerificationData } from "./types";

export function createEmptyGuarantor(): Guarantor {
  return {
    fullName: "",
    phone: "",
    relationship: "",
    occupation: "",
    address: "",
    idType: "",
    idNumber: "",
    idDocument: null,
    photograph: null,
  };
}

/** A blank verification draft — the starting state before any input. */
export function createEmptyData(guarantorCount = 1): VerificationData {
  return {
    personal: {
      firstName: "",
      middleName: "",
      lastName: "",
      dob: "",
      gender: "",
      phone: "",
      email: "",
      occupation: "",
      residentialAddress: "",
      profilePhoto: null,
    },
    identity: { idType: "", idNumber: "", expiryDate: "", document: null },
    address: { residentialAddress: "", state: "", lga: "", city: "", proofOfAddress: null },
    guarantors: Array.from({ length: guarantorCount }, createEmptyGuarantor),
    license: { number: "", issueDate: "", expiryDate: "", category: "", front: null, back: null },
    vehicle: {
      type: "",
      make: "",
      model: "",
      year: "",
      color: "",
      plateNumber: "",
      registrationNumber: "",
      registrationExpiry: "",
    },
    vehicleDocuments: {
      registration: null,
      insurance: null,
      roadworthiness: null,
      frsc: null,
      photos: {
        front: null,
        back: null,
        left: null,
        right: null,
        interior: null,
        dashboard: null,
        plate: null,
      },
    },
    consent: { agreed: false },
    status: "not_started",
  };
}
