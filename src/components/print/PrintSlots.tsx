import { Repeat2, Trash2 } from "lucide-react";
import { PrintSlotBackUpload } from "./PrintSlotBackUpload";
import type { PrintSlot } from "@/lib/printStore";
import { CARD_TYPES } from "@/lib/cardTypes";

export function PrintSlots({
  slots,
  onDropCard,
  onClear,
  onRepeat,
  onBackFile,
  onBackClear,
  canRepeat,
}: {
  slots: PrintSlot[];
  onDropCard: (index: number, cardId: string) => void;
  onClear: (index: number) => void;
  onRepeat: (index: number) => void;
  onBackFile: (index: number, file: File) => void;
  onBackClear: (index: number) => void;
  canRepeat: (index: number) => boolean;
}) {
  return (
    <div className="space-y-2">
      {slots.map((slot, i) => (
        <div
          key={i}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            const id = e.dataTransfer.getData("application/x-squarezone-card");
            if (id) onDropCard(i, id);
          }}
          className="rounded-lg border border-dashed border-[var(--border2)] p-2.5"
        >
          <div className="flex items-center gap-2">
            <span className="grid h-6 w-6 shrink-0 place-items-center rounded bg-[var(--inp)] text-[10px] text-[var(--text2)]">
              {i + 1}
            </span>
            {slot.card ? (
              <>
                <span
                  className="h-4 w-4 shrink-0 rounded-sm"
                  style={{ background: CARD_TYPES[slot.card.card_type]?.base }}
                />
                <span className="flex-1 truncate text-xs">{slot.card.name}</span>
                <button
                  type="button"
                  title="Repetir carta no próximo slot"
                  disabled={!canRepeat(i)}
                  onClick={() => onRepeat(i)}
                  className="grid h-6 w-6 place-items-center rounded text-[var(--text2)] hover:bg-[var(--panel2)] hover:text-foreground disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Repeat2 className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  title="Esvaziar slot"
                  onClick={() => onClear(i)}
                  className="grid h-6 w-6 place-items-center rounded text-[var(--text2)] hover:bg-[var(--panel2)] hover:text-destructive"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </>
            ) : (
              <span className="flex-1 text-[11px] text-[var(--text3)]">
                Arraste uma carta da biblioteca ou use “Adicionar”
              </span>
            )}
          </div>
          {slot.card && (
            <div className="mt-2 pl-8">
              <PrintSlotBackUpload
                preview={slot.backPreview}
                onFile={(f) => onBackFile(i, f)}
                onClear={() => onBackClear(i)}
              />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
