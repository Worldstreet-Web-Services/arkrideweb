/**
 * Driver Verification — public SDK surface.
 *
 * A host app mounts <VerificationProvider> (optionally with a custom config:
 * storage adapter, onSubmit, guarantorCount) and renders the step screens at
 * its own routes. Everything below is import-stable; internals may change.
 */

export { VerificationProvider, useVerification } from "./store/VerificationProvider";
export { VerificationLayout } from "./components/VerificationLayout";
export { VerificationProgress } from "./components/VerificationProgress";
export { StepScreen } from "./components/StepScreen";

export { PersonalInfoForm } from "./components/forms/PersonalInfoForm";
export { IdentityForm } from "./components/forms/IdentityForm";
export { AddressForm } from "./components/forms/AddressForm";
export { GuarantorForm } from "./components/forms/GuarantorForm";
export { LicenseForm } from "./components/forms/LicenseForm";
export { VehicleForm } from "./components/forms/VehicleForm";
export { VehicleDocumentsForm } from "./components/forms/VehicleDocumentsForm";
export { ReviewDetails } from "./components/forms/ReviewDetails";

export { STEPS, STEP_COUNT, completionPercent, isStepComplete } from "./steps";
export { defaultConfig } from "./config";
export type { VerificationConfig } from "./config";
export type { StorageAdapter } from "./store/storage";
export * from "./types";
