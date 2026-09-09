import { Field, Section } from "../Section";
import { Input } from "@/components/ui/input";
import { CARD_TYPE_LIST } from "@/lib/cardTypes";
import type { CardType } from "@/types/card";
import type { SectionProps } from "./types";

export function CardTypeSection({ card, update }: SectionProps) {
  return (
    <Section title="Tipo de carta">
      <Field label="Tipo">
        <div className="grid grid-cols-1 gap-1">
          {CARD_TYPE_LIST.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => update("card_type", t.id as CardType)}
              className={`flex items-center gap-2 rounded-md border px-2.5 py-2 text-left text-xs transition-colors ${
                card.card_type === t.id
                  ? "border-primary bg-[var(--panel2)] text-foreground"
                  : "border-border text-[var(--text2)] hover:bg-[var(--panel2)]"
              }`}
            >
              <span
                className="h-4 w-4 shrink-0 rounded-sm border border-white/20"
                style={{ background: t.base }}
              />
              <span className="flex-1">{t.label}</span>
              <span className="text-[10px] text-[var(--text3)]">{t.note}</span>
            </button>
          ))}
        </div>
      </Field>
      <Field label="Subtipo">
        <Input
          value={card.subtype}
          onChange={(e) => update("subtype", e.target.value)}
          placeholder="ex.: Encantamento contínuo"
        />
      </Field>
    </Section>
  );
}
