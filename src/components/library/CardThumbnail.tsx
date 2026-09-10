import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Copy, Download, Pencil, Printer, Trash2 } from "lucide-react";
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
}: {
  card: CardState;
  onDuplicate: () => void;
  onDelete: () => void;
  onExport: () => void;
  onQueue: () => void;
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

  return (
    <div
      draggable
      onDragStart={(e) => e.dataTransfer.setData("application/x-squarezone-card", card.id ?? "")}
      className="group overflow-hidden rounded-lg border border-border bg-[var(--panel)] transition-colors hover:border-[var(--border2)]"
    >
      <div className="relative aspect-[200/280] bg-[var(--panel2)]">
        {thumb ? (
          <img src={thumb} alt={`Miniatura da carta ${card.name}`} className="h-full w-full object-cover" />
        ) : (
          <div
            className="h-full w-full"
            style={{ background: `linear-gradient(160deg, ${type?.base ?? "#333"}, #0b0e14)` }}
          />
        )}
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
      </div>
    </div>
  );
}
