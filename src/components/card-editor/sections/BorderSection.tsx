import { Field, Section } from "../Section";
import { BORDER_STYLES } from "@/lib/cardTypes";
import type { SectionProps } from "./types";

export function BorderSection({ card, update }: SectionProps) {
  return (
    <Section title="Bordas">
      <Field label="Estilo">
        <select
          value={card.border_style}
          onChange={(e) => update("border_style", e.target.value)}
          className="h-9 w-full rounded-md border border-white/10 bg-[var(--inp)] px-2 text-xs text-foreground outline-none focus:border-primary"
        >
          {BORDER_STYLES.map((b) => (
            <option key={b.id} value={b.id}>
              {b.label}
            </option>
          ))}
        </select>
      </Field>
      <label className="flex cursor-pointer items-center gap-2 text-[11px] text-[var(--text2)]">
        <input
          type="checkbox"
          checked={card.neon_inner}
          onChange={(e) => update("neon_inner", e.target.checked)}
          className="accent-[var(--accent)]"
        />
        Brilho interno sutil
      </label>
    </Section>
  );
}
