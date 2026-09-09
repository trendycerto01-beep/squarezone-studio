import { Field, Section } from "../Section";
import { Slider } from "@/components/ui/slider";
import { FONTS } from "@/lib/cardTypes";
import type { SectionProps } from "./types";

function FontSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-[var(--inpborder,rgba(255,255,255,0.1))] bg-[var(--inp)] px-2 text-xs text-foreground outline-none focus:border-primary"
    >
      {FONTS.map((f) => (
        <option key={f} value={f} style={{ fontFamily: f }}>
          {f}
        </option>
      ))}
    </select>
  );
}

export function TypographySection({ card, update }: SectionProps) {
  return (
    <Section title="Tipografia">
      <Field label="Fonte do título">
        <FontSelect value={card.title_font} onChange={(v) => update("title_font", v)} />
      </Field>
      <Field label="Fonte do corpo">
        <FontSelect value={card.body_font} onChange={(v) => update("body_font", v)} />
      </Field>
      <Field label={`Tamanho do título — ${card.title_size}`}>
        <Slider
          value={[card.title_size]}
          min={5}
          max={80}
          step={1}
          onValueChange={([v]) => update("title_size", v ?? 52)}
        />
      </Field>
    </Section>
  );
}
