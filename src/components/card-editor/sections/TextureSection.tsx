import { Field, Section } from "../Section";
import { Slider } from "@/components/ui/slider";
import { TEXTURES_1, TEXTURES_2 } from "@/lib/cardTypes";
import type { SectionProps } from "./types";

function Picker({
  value,
  options,
  onChange,
}: {
  value: string;
  options: { id: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 w-full rounded-md border border-white/10 bg-[var(--inp)] px-2 text-xs text-foreground outline-none focus:border-primary"
    >
      {options.map((o) => (
        <option key={o.id} value={o.id}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

export function TextureSection({ card, update }: SectionProps) {
  return (
    <Section title="Textura e efeito">
      <Field label="Textura">
        <Picker
          value={card.texture1}
          options={TEXTURES_1}
          onChange={(v) => update("texture1", v)}
        />
      </Field>
      <Field label={`Intensidade — ${card.texture1_int}`}>
        <Slider
          value={[card.texture1_int]}
          min={0}
          max={100}
          step={1}
          onValueChange={([v]) => update("texture1_int", v ?? 30)}
        />
      </Field>
      <Field label="Efeito">
        <Picker
          value={card.texture2}
          options={TEXTURES_2}
          onChange={(v) => update("texture2", v)}
        />
      </Field>
      <Field label={`Intensidade — ${card.texture2_int}`}>
        <Slider
          value={[card.texture2_int]}
          min={0}
          max={100}
          step={1}
          onValueChange={([v]) => update("texture2_int", v ?? 40)}
        />
      </Field>
    </Section>
  );
}
