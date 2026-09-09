import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3 transition-colors hover:bg-[var(--panel2)]"
      >
        <span className="section-title">{title}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-[var(--text3)] transition-transform ${open ? "" : "-rotate-90"}`}
        />
      </button>
      {open && <div className="space-y-3 px-4 pb-4">{children}</div>}
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-1.5">
      <div className="ui-label">{label}</div>
      {children}
    </div>
  );
}

export function Pills<T extends string | number>({
  value,
  options,
  onChange,
}: {
  value: T;
  options: { value: T; label: string }[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="flex gap-1 rounded-full bg-[var(--inp)] p-1">
      {options.map((o) => (
        <button
          key={String(o.value)}
          type="button"
          onClick={() => onChange(o.value)}
          className={`flex-1 rounded-full px-2 py-1 text-[11px] transition-colors ${
            value === o.value
              ? "bg-primary text-primary-foreground"
              : "text-[var(--text2)] hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
