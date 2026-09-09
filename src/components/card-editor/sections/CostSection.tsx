import { Field, Pills, Section } from "../Section";
import { Input } from "@/components/ui/input";
import type { SectionProps } from "./types";

export function CostSection({ card, update }: SectionProps) {
  return (
    <Section title="Ícone de custo">
      <Field label="Ícones">
        <Pills<number>
          value={card.cost_icon}
          onChange={(v) => update("cost_icon", v)}
          options={[
            { value: 0, label: "Nenhum" },
            { value: 1, label: "×1" },
            { value: 2, label: "×2" },
          ]}
        />
      </Field>
      <Field label="Número do custo">
        <Input
          value={card.cost_number}
          maxLength={3}
          placeholder="1–9"
          onChange={(e) => update("cost_number", e.target.value)}
        />
      </Field>
    </Section>
  );
}
