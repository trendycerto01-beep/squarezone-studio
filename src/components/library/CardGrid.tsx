import { CARD_TYPES } from "@/lib/cardTypes";
import type { CardState, CardType } from "@/types/card";
import { CardThumbnail } from "./CardThumbnail";

export function CardGrid({
  cards,
  onDuplicate,
  onDelete,
  onExport,
  onQueue,
}: {
  cards: CardState[];
  onDuplicate: (c: CardState) => void;
  onDelete: (c: CardState) => void;
  onExport: (c: CardState) => void;
  onQueue: (c: CardState) => void;
}) {
  const groups = Object.keys(CARD_TYPES) as CardType[];

  return (
    <div className="space-y-8">
      {groups.map((type) => {
        const list = cards.filter((c) => c.card_type === type);
        if (!list.length) return null;
        return (
          <section key={type}>
            <h2 className="section-title mb-3 flex items-center gap-2">
              <span
                className="h-2.5 w-2.5 rounded-sm"
                style={{ background: CARD_TYPES[type].base }}
              />
              {CARD_TYPES[type].label}
              <span className="text-[var(--text3)]">({list.length})</span>
            </h2>
            <div className="grid grid-cols-[repeat(auto-fill,minmax(160px,1fr))] gap-3">
              {list.map((card) => (
                <CardThumbnail
                  key={card.id}
                  card={card}
                  onDuplicate={() => onDuplicate(card)}
                  onDelete={() => onDelete(card)}
                  onExport={() => onExport(card)}
                  onQueue={() => onQueue(card)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
