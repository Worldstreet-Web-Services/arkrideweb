import { isExpired } from "../../validation";
import { WarningIcon } from "../icons";
import { Input } from "./Input";

/**
 * Date input. When `flagExpiry` is set and the chosen date is in the past,
 * shows an "Expired" note below the field (used for licenses / IDs).
 */
export function DateField({
  value,
  onChange,
  invalid,
  flagExpiry = false,
  max,
  min,
}: {
  value: string;
  onChange: (v: string) => void;
  invalid?: boolean;
  flagExpiry?: boolean;
  max?: string;
  min?: string;
}) {
  const expired = flagExpiry && isExpired(value);
  return (
    <div>
      <Input
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        invalid={invalid || expired}
        max={max}
        min={min}
        className={value ? "" : "text-text-subtle"}
      />
      {expired && (
        <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-danger-tint px-2.5 py-1 text-xs font-semibold text-danger">
          <WarningIcon size={13} /> This document has expired
        </span>
      )}
    </div>
  );
}
