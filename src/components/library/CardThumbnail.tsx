import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Check, Copy, Download, Minus, Pencil, Plus, Printer, Trash2 } from "lucide-react";
import { resolveUrl } from "@/lib/supabaseStorage";
import { CARD_TYPES } from "@/lib/cardTypes";
import { RARITIES } from "@/lib/rarityConfig";
import type { CardState } from "@/types/card";

export function CardThumbnail({
  card,
  onDuplicate,
  onDelete,
  onExport,
  onQueue,
  selectionMode = false,
  selected = false,
  quantity = 1,
  onToggleSelect,
  onQuantityChange,
}: {
  card: CardState;
  onDuplicate: () => void;
  onDelete: () => void;
  onExport: () => void;
  onQueue: () => void;
  selectionMode?: boolean;
  selected?: boolean;
  quantity?: number;
  onToggleSelect?: () => void;
  onQuantityChange?: (qty: number) => void;
}) {
  const [thumb, setThumb] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    resolveUrl(card.thumbnail_url).then((u) => alive && setThumb(u));
    return () => {
      alive = false;
    };
  }, [card.thumbnail_url]);

  const type = CARD_TYPES[card.card_type];
  const rarity = RARITIES[card.rarity] ?? RARITIES.none;

  const setQty = (value: number) => {
    const n = Number.isFinite(value) ? Math.floor(value) : 1;
    onQuantityChange?.(Math.min(99, Math.max(1, n)));
  };

  return (
    <div
      draggable={!selectionMode}
      onDragStart={(e) => e.dataTransfer.setData("application/x-squarezone-card", card.id ?? "")}
      className={`group overflow-hidden rounded-lg border bg-[var(--panel)] transition-colors ${
        selected ? "border-primary" : "border-border hover:border-[var(--border2)]"
      }`}
    >
      <div
        className={`relative aspect-[200/280] bg-[var(--panel2)] ${selectionMode ? "cursor-pointer" : ""}`}
        onClick={selectionMode ? onToggleSelect : undefined}
      >
        {thumb ? (
          <img src={thumb} alt={`Miniatura da carta ${card.name}`} className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: `linear-gradient(160deg, ${type?.base ?? "#333"}, #0b0e14)` }}
          />
        )}

        {selectionMode && (
          <>
            {selected && <div className="absolute inset-0 bg-primary/20" />}
            <span
              className={`absolute left-2 top-2 grid h-6 w-6 place-items-center rounded-md border ${
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-white/50 bg-black/50"
              }`}
              aria-hidden
            >
              {selected && <Check className="h-4 w-4" />}
            </span>
          </>
        )}

        {!selectionMode && (
          <div className="absolute inset-x-0 bottom-0 flex justify-center gap-1 bg-black/70 p-1.5 opacity-0 transition-opacity group-hover:opacity-100">
            <Link
              to="/editor/$id"
              params={{ id: card.id! }}
              title="Editar"
              className="grid h-7 w-7 place-items-center rounded text-[var(--text2)] hover:bg-white/10 hover:text-foreground"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Link>
            <button
              title="Duplicar"
              onClick={onDuplicate}
              className="grid h-7 w-7 place-items-center rounded text-[var(--text2)] hover:bg-white/10 hover:text-foreground"
            >
              <Copy className="h-3.5 w-3.5" />
            </button>
            <button
              title="Exportar PNG"
              onClick={onExport}
              className="grid h-7 w-7 place-items-center rounded text-[var(--text2)] hover:bg-white/10 hover:text-foreground"
            >
              <Download className="h-3.5 w-3.5" />
            </button>
            <button
              title="Adicionar à fila de impressão"
              onClick={onQueue}
              className="grid h-7 w-7 place-items-center rounded text-[var(--text2)] hover:bg-white/10 hover:text-foreground"
            >
              <Printer className="h-3.5 w-3.5" />
            </button>
            <button
              title="Excluir"
              onClick={onDelete}
              className="grid h-7 w-7 place-items-center rounded text-[var(--text2)] hover:bg-white/10 hover:text-destructive"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-1 p-2.5">
        <div className="truncate text-xs font-medium">{card.name}</div>
        <div className="flex items-center gap-2">
          <span
            className="rounded-full px-2 py-0.5 text-[10px]"
            style={{ background: `${type?.base ?? "#333"}40`, color: "#e8eaf0" }}
          >
            {type?.label ?? card.card_type}
          </span>
          {rarity.id !== "none" && (
            <span className="flex items-center gap-1 text-[10px] text-[var(--text3)]">
              <span className="h-2 w-2 rounded-full" style={{ background: rarity.color }} />
              {rarity.label}
            </span>
          )}
        </div>

        {selectionMode && selected && (
          <div className="mt-1.5 flex items-center justify-between rounded-md bg-[var(--inp)] px-1.5 py-1">
            <button
              type="button"
              title="Menos uma cópia"
              onClick={() => setQty(quantity - 1)}
              disabled={quantity <= 1}
              className="grid h-5 w-5 place-items-center rounded text-[var(--text2)] hover:text-foreground disabled:opacity-30"
            >
              <Minus className="h-3 w-3" />
            </button>
            <input
              type="number"
              min={1}
              max={99}
              value={quantity}
              onChange={(e) => setQty(parseInt(e.target.value, 10))}
              onBlur={(e) => setQty(parseInt(e.target.value, 10))}
              aria-label={`Cópias de ${card.name}`}
              className="w-10 bg-transparent text-center text-[11px] outline-none [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none"
            />
            <button
              type="button"
              title="Mais uma cópia"
              onClick={() => setQty(quantity + 1)}
              className="grid h-5 w-5 place-items-center rounded text-[var(--text2)] hover:text-foreground"
            >
              <Plus className="h-3 w-3" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
