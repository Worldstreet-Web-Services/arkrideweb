"use client";

import { useVerification } from "../../store/VerificationProvider";
import type { FieldErrors, VehiclePhotoKey } from "../../types";
import { FileUpload } from "../common/FileUpload";
import { FormField } from "../common/FormField";
import { PhotoGrid } from "../common/PhotoGrid";

export function VehicleDocumentsForm({ errors }: { errors: FieldErrors }) {
  const { data, update } = useVerification();
  const d = data.vehicleDocuments;

  const setPhoto = (key: VehiclePhotoKey, file: (typeof d.photos)[VehiclePhotoKey]) =>
    update("vehicleDocuments", { photos: { ...d.photos, [key]: file } });

  return (
    <>
      <FormField label="Vehicle registration" error={errors.registration} required>
        <FileUpload
          value={d.registration}
          onChange={(f) => update("vehicleDocuments", { registration: f })}
          label="Upload vehicle registration"
          invalid={!!errors.registration}
        />
      </FormField>

      <FormField label="Insurance" error={errors.insurance} required>
        <FileUpload
          value={d.insurance}
          onChange={(f) => update("vehicleDocuments", { insurance: f })}
          label="Upload insurance document"
          invalid={!!errors.insurance}
        />
      </FormField>

      <FormField label="Roadworthiness certificate" error={errors.roadworthiness} required>
        <FileUpload
          value={d.roadworthiness}
          onChange={(f) => update("vehicleDocuments", { roadworthiness: f })}
          label="Upload roadworthiness certificate"
          invalid={!!errors.roadworthiness}
        />
      </FormField>

      <FormField label="FRSC / other documentation" hint="Optional">
        <FileUpload
          value={d.frsc}
          onChange={(f) => update("vehicleDocuments", { frsc: f })}
          label="Upload additional document"
        />
      </FormField>

      <PhotoGrid photos={d.photos} onChange={setPhoto} errors={errors} />
    </>
  );
}
