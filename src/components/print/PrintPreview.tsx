import { useEffect, useRef } from "react";
import { A4, BLEED, drawCutMarks, slotRects, type LayoutConfig } from "@/lib/printLayout";
import { renderBackToCanvas, renderCardToCanvas } from "@/lib/canvas/renderOffscreen";
import type { PrintSlot } from "@/lib/printStore";

export const PREVIEW_SCALE = 2.6; // px per mm on screen

export async function paintSheet(
  canvas: HTMLCanvasElement,
  slots: PrintSlot[],
  layout: LayoutConfig,
  side: "front" | "back",
  scale: number,
) {
  canvas.width = Math.round(A4.w * scale);
  canvas.height = Math.round(A4.h * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  ctx.imageSmoothingQuality = "high";
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const rects = slotRects(layout, side === "back");
  for (const rect of rects) {
    const slot = slots[rect.index];
    if (!slot?.card) continue;
    const source =
      side === "front"
        ? await renderCardToCanvas(slot.card)
        : await renderBackToCanvas(slot.card, slot.backPreview);

    const dx = rect.x * scale;
    const dy = rect.y * scale;
    const dw = rect.w * scale;
    const dh = rect.h * scale;
    // cover the bleed area preserving the card aspect ratio
    const s = Math.max(dw / source.width, dh / source.height);
    const sw = source.width * s;
    const sh = source.height * s;
    ctx.save();
    ctx.beginPath();
    ctx.rect(dx, dy, dw, dh);
    ctx.clip();
    ctx.drawImage(source, dx + (dw - sw) / 2, dy + (dh - sh) / 2, sw, sh);
    ctx.restore();
  }

  drawCutMarks(ctx, layout, scale);

  // bleed guide (screen only, thin) — drawn light grey inside each cell
  ctx.save();
  ctx.strokeStyle = "rgba(0,0,0,0.12)";
  ctx.lineWidth = 0.5;
  for (const rect of rects) {
    ctx.strokeRect(
      (rect.x + BLEED) * scale,
      (rect.y + BLEED) * scale,
      (rect.w - BLEED * 2) * scale,
      (rect.h - BLEED * 2) * scale,
    );
  }
  ctx.restore();
}

export function PrintPreview({
  slots,
  layout,
  side,
  label,
}: {
  slots: PrintSlot[];
  layout: LayoutConfig;
  side: "front" | "back";
  label: string;
}) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    let cancelled = false;
    void (async () => {
      if (cancelled) return;
      await paintSheet(canvas, slots, layout, side, PREVIEW_SCALE);
    })();
    return () => {
      cancelled = true;
    };
  }, [slots, layout, side]);

  return (
    <div className="space-y-2">
      <div className="section-title">{label}</div>
      <canvas
        ref={ref}
        className="w-full max-w-[380px] rounded-md border border-border bg-white shadow-lg"
      />
    </div>
  );
}
