import { CheckCheck } from "lucide-react";
import { CARD_TYPES } from "@/lib/cardTypes";
import type { CardState, CardType } from "@/types/card";
import { CardThumbnail } from "./CardThumbnail";

export function CardGrid({
  cards,
  onDuplicate,
  onDelete,
  onExport,
  onQueue,
  selectionMode = false,
  selection,
  onToggleSelect,
  onQuantityChange,
  onSelectAllOfType,
}: {
  cards: CardState[];
  onDuplicate: (c: CardState) => void;
  onDelete: (c: CardState) => void;
  onExport: (c: CardState) => void;
  onQueue: (c: CardState) => void;
  selectionMode?: boolean;
  selection?: Record<string, number>;
  onToggleSelect?: (c: CardState) => void;
  onQuantityChange?: (c: CardState, qty: number) => void;
  onSelectAllOfType?: (list: CardState[]) => void;
}) {
  const groups = Object.keys(CARD_TYPES) as CardType[];
  const sel = selection ?? {};

  return (
    <div className="space-y-8">
      {groups.map((type) => {
        const list = cards.filter((c) => c.card_type === type);
        if (!list.length) return null;
        const allSelected = list.every((c) => c.id && sel[c.id] !== undefined);
        return (
          <section key={type}>
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="section-title flex items-center gap-2">
                <span
                  className="h-2.5 w-2.5 rounded-sm"
                  style={{ background: CARD_TYPES[type].base }}
                />
                {CARD_TYPES[type].label}
                <span className="text-[var(--text3)]">({list.length})</span>
              </h2>
              {selectionMode && (
                <button
                  type="button"
                  onClick={() => onSelectAllOfType?.(list)}
                  className="flex items-center gap-1 rounded-md border border-border px-2 py-1 text-[10px] text-[var(--text2)] hover:text-foreground"
                >
                  <CheckCheck className="h-3 w-3" />
                  {allSelected ? "Desmarcar seção" : "Selecionar todas"}
                </button>
              )}
            </div>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
              {list.map((card) => (
                <CardThumbnail
                  key={card.id}
                  card={card}
                  onDuplicate={() => onDuplicate(card)}
                  onDelete={() => onDelete(card)}
                  onExport={() => onExport(card)}
                  onQueue={() => onQueue(card)}
                  selectionMode={selectionMode}
                  selected={!!card.id && sel[card.id] !== undefined}
                  quantity={(card.id && sel[card.id]) || 1}
                  onToggleSelect={() => onToggleSelect?.(card)}
                  onQuantityChange={(q) => onQuantityChange?.(card, q)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
