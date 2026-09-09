import { Field, Section } from "../Section";
import { Input } from "@/components/ui/input";
import { RARITY_LIST } from "@/lib/rarityConfig";
import type { Rarity } from "@/types/card";
import type { SectionProps } from "./types";

export function IdentitySection({ card, update }: SectionProps) {
  return (
    <Section title="Identificação">
      <Field label="Número da carta">
        <Input
          value={card.card_number}
          placeholder="001/120"
          onChange={(e) => update("card_number", e.target.value)}
        />
      </Field>
      <Field label="Raridade">
        <div className="grid grid-cols-2 gap-1">
          {RARITY_LIST.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => update("rarity", r.id as Rarity)}
              className={`flex items-center gap-2 rounded-md border px-2 py-1.5 text-[11px] transition-colors ${
                card.rarity === r.id
                  ? "border-primary bg-[var(--panel2)] text-foreground"
                  : "border-border text-[var(--text2)] hover:bg-[var(--panel2)]"
              }`}
            >
              <span className="h-2.5 w-2.5 rounded-full" style={{ background: r.color }} />
              {r.label}
            </button>
          ))}
        </div>
      </Field>
    </Section>
  );
}
