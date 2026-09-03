import { cn } from "@/lib/utils";
import { CheckIcon } from "../icons";

interface Option {
  value: string;
  label: string;
}

/** Selectable cards used for ID type, gender, etc. Keyboard + click. */
export function RadioGroup({
  name,
  value,
  onChange,
  options,
  columns = 1,
}: {
  name: string;
  value: string;
  onChange: (v: string) => void;
  options: Option[];
  columns?: number;
}) {
  const gridCols =
    columns === 3 ? "grid-cols-3" : columns === 2 ? "grid-cols-2" : "grid-cols-1";

  return (
    <div role="radiogroup" className={cn("grid gap-2.5", gridCols)}>
      {options.map((o) => {
        const selected = value === o.value;
        return (
          <label
            key={o.value}
            className={cn(
              "flex cursor-pointer items-center gap-2.5 rounded-xl border bg-white px-3.5 py-3.5 transition-all",
              selected
                ? "border-neutral-900 bg-neutral-50 ring-1 ring-neutral-900"
                : "border-neutral-200 hover:border-neutral-300"
            )}
          >
            <input
              type="radio"
              name={name}
              value={o.value}
              checked={selected}
              onChange={() => onChange(o.value)}
              className="sr-only"
            />
            <span
              className={cn(
                "grid size-4.5 shrink-0 place-items-center rounded-full border-2 transition-colors",
                selected ? "border-neutral-900" : "border-neutral-300"
              )}
              aria-hidden
            >
              {selected && <span className="size-2 rounded-full bg-neutral-900" />}
            </span>
            <span className={cn("flex-1 text-[15px]", selected ? "font-semibold text-neutral-900" : "text-neutral-700")}>
              {o.label}
            </span>
            {selected && <CheckIcon size={17} className="shrink-0 text-neutral-900" aria-hidden />}
          </label>
        );
      })}
    </div>
  );
}
