import { Field, Section } from "../Section";
import { SWATCH_GROUPS } from "@/lib/cardTypes";
import { autoBorderColor } from "@/lib/colorUtils";
import type { SectionProps } from "./types";

export function ColorSection({ card, update }: SectionProps) {
  const setBase = (hex: string) => {
    update("base_color", hex);
    if (card.auto_border) update("border_color", autoBorderColor(hex));
  };

  return (
    <Section title="Sistema de cores">
      {SWATCH_GROUPS.map((g) => (
        <div key={g.label} className="space-y-1.5">
          <div className="text-[10px] text-[var(--text3)]">{g.label}</div>
          <div className="flex flex-wrap gap-2">
            {g.colors.map((c) => (
              <button
                key={c}
                type="button"
                title={c}
                onClick={() => setBase(c)}
                style={{ background: c }}
                className={`h-5 w-5 rounded-full transition-transform hover:scale-110 ${
                  card.base_color.toLowerCase() === c.toLowerCase()
                    ? "ring-2 ring-white ring-offset-2 ring-offset-[var(--panel)]"
                    : "ring-1 ring-white/15"
                }`}
              />
            ))}
          </div>
        </div>
      ))}

      <Field label="Cor base">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={card.base_color}
            onChange={(e) => setBase(e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent"
          />
          <span className="text-[11px] text-[var(--text2)]">{card.base_color}</span>
        </div>
      </Field>

      <Field label="Cor da borda">
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={card.border_color}
            disabled={card.auto_border}
            onChange={(e) => update("border_color", e.target.value)}
            className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent disabled:opacity-40"
          />
          <span className="text-[11px] text-[var(--text2)]">{card.border_color}</span>
        </div>
      </Field>

      <label className="flex cursor-pointer items-center gap-2 text-[11px] text-[var(--text2)]">
        <input
          type="checkbox"
          checked={card.auto_border}
          onChange={(e) => {
            update("auto_border", e.target.checked);
            if (e.target.checked) update("border_color", autoBorderColor(card.base_color));
          }}
          className="accent-[var(--accent)]"
        />
        Derivar borda automaticamente da cor base
      </label>
    </Section>
  );
}
