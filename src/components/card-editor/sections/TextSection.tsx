import { Field, Pills, Section } from "../Section";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { TitleAlign } from "@/types/card";
import type { SectionProps } from "./types";

export function TextSection({ card, update }: SectionProps) {
  return (
    <Section title="Textos da carta">
      <Field label="Nome (biblioteca)">
        <Input value={card.name} onChange={(e) => update("name", e.target.value)} />
      </Field>
      <Field label={`Título (${card.title.length}/32)`}>
        <Input
          value={card.title}
          maxLength={32}
          onChange={(e) => update("title", e.target.value)}
        />
      </Field>
      <Field label="Alinhamento do título">
        <Pills<TitleAlign>
          value={card.title_align}
          onChange={(v) => update("title_align", v)}
          options={[
            { value: "left", label: "Esquerda" },
            { value: "center", label: "Centro" },
            { value: "right", label: "Direita" },
          ]}
        />
      </Field>
      <Field label={`Flavor (${card.flavor_text.length}/72)`}>
        <Input
          value={card.flavor_text}
          maxLength={72}
          onChange={(e) => update("flavor_text", e.target.value)}
        />
      </Field>
      <Field label="Efeito">
        <Textarea
          rows={6}
          value={card.effect_text}
          onChange={(e) => update("effect_text", e.target.value)}
        />
      </Field>
    </Section>
  );
}
