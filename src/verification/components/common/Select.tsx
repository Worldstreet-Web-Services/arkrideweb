import { cn } from "@/lib/utils";
import type { SelectHTMLAttributes } from "react";
import { invalidCls, selectCls } from "../../ui";

interface Option {
  value: string;
  label: string;
}

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  invalid?: boolean;
  placeholder?: string;
  options: Option[];
}

export function Select({ invalid, placeholder, options, className, value, ...props }: SelectProps) {
  return (
    <div className="relative">
      <select
        className={cn(selectCls, !value && "text-neutral-400", invalid && invalidCls, className)}
        aria-invalid={invalid || undefined}
        value={value}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((o) => (
          <option key={o.value} value={o.value} className="text-neutral-900">
            {o.label}
          </option>
        ))}
      </select>
      {/* Chevron */}
      <svg
        className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-500"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <polyline points="6 9 12 15 18 9" />
      </svg>
    </div>
  );
}
