import { SelectHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type TimeSelectProps = {
  hourName: string;
  minuteName: string;
  defaultValue?: string;
  className?: string;
  disabled?: boolean;
};

const hours = Array.from({ length: 24 }, (_, index) => String(index).padStart(2, "0"));
const minutes = ["00", "15", "30", "45"];

function SelectField({ className, children, ...props }: SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      className={cn(
        "focus-ring h-12 w-full rounded-2xl border border-[var(--border)] bg-white/95 px-4 text-sm font-medium text-[var(--foreground)] shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_6px_18px_rgba(20,49,44,0.04)] outline-none transition focus:border-teal-500 focus:bg-white",
        className
      )}
      {...props}
    >
      {children}
    </select>
  );
}

export function TimeSelect({ hourName, minuteName, defaultValue = "09:00", className, disabled = false }: TimeSelectProps) {
  const [defaultHour = "09", defaultMinute = "00"] = defaultValue.split(":");

  return (
    <div className={cn("grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-2", className)}>
      <SelectField name={hourName} defaultValue={defaultHour} disabled={disabled} aria-label="Jam">
        {hours.map((hour) => (
          <option key={hour} value={hour}>
            {hour}
          </option>
        ))}
      </SelectField>
      <span className="text-sm font-semibold text-[var(--muted)]">:</span>
      <SelectField name={minuteName} defaultValue={minutes.includes(defaultMinute) ? defaultMinute : "00"} disabled={disabled} aria-label="Menit">
        {minutes.map((minute) => (
          <option key={minute} value={minute}>
            {minute}
          </option>
        ))}
      </SelectField>
    </div>
  );
}
