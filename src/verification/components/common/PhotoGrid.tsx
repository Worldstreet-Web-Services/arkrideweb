"use client";

import { cn } from "@/lib/utils";
import { VEHICLE_PHOTO_KEYS, type UploadedFile, type VehiclePhotoKey } from "../../types";
import type { FieldErrors } from "../../types";
import { labelCls } from "../../ui";
import { CheckIcon } from "../icons";
import { FileUpload } from "./FileUpload";

const LABELS: Record<VehiclePhotoKey, string> = {
  front: "Front",
  back: "Back",
  left: "Left Side",
  right: "Right Side",
  interior: "Interior",
  dashboard: "Dashboard",
  plate: "Plate Number",
};

/** Required vehicle-photo angles as a checklist grid. */
export function PhotoGrid({
  photos,
  onChange,
  errors,
}: {
  photos: Record<VehiclePhotoKey, UploadedFile | null>;
  onChange: (key: VehiclePhotoKey, file: UploadedFile | null) => void;
  errors?: FieldErrors;
}) {
  const filled = VEHICLE_PHOTO_KEYS.filter((k) => photos[k]).length;

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <span className={cn(labelCls, "mb-0")}>Vehicle Photos</span>
        <span className="text-xs text-neutral-400">
          {filled} of {VEHICLE_PHOTO_KEYS.length}
        </span>
      </div>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(140px,1fr))] gap-2.5">
        {VEHICLE_PHOTO_KEYS.map((key) => (
          <div key={key}>
            <div className="mb-1.5 flex items-center gap-1.5 text-[13px]">
              {photos[key] ? (
                <span className="grid size-4 place-items-center rounded-full bg-neutral-900 text-white">
                  <CheckIcon size={11} />
                </span>
              ) : (
                <span className="size-4 rounded-full border-[1.5px] border-neutral-300" aria-hidden />
              )}
              <span className={photos[key] ? "font-medium text-neutral-900" : "text-neutral-500"}>
                {LABELS[key]}
              </span>
            </div>
            <FileUpload
              value={photos[key]}
              onChange={(f) => onChange(key, f)}
              label={LABELS[key]}
              compact
              invalid={!!errors?.[`photo.${key}`]}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
