import { useEffect, useRef, useState, type RefObject } from "react";
import { Minus, Plus } from "lucide-react";
import { drawCard } from "@/lib/canvas/drawCard";
import { CARD_H, CARD_W } from "@/lib/canvas/drawZones";
import type { CardState } from "@/types/card";

export function CardCanvas({
  card,
  art,
  costIcon,
  canvasRef,
}: {
  card: CardState;
  art: HTMLImageElement | null;
  costIcon: HTMLImageElement | null;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(0.45);
  const [fontsReady, setFontsReady] = useState(false);

  useEffect(() => {
    let alive = true;
    document.fonts.ready.then(() => alive && setFontsReady(true));
    return () => {
      alive = false;
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawCard(ctx, card, art, costIcon);
  }, [card, art, costIcon, fontsReady, canvasRef]);

  // fit to available space on mount / resize
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const fit = () => {
      const r = el.getBoundingClientRect();
      const s = Math.min((r.width - 64) / CARD_W, (r.height - 64) / CARD_H);
      if (s > 0.05) setZoom(Number(s.toFixed(3)));
    };
    fit();
    const ro = new ResizeObserver(fit);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div ref={wrapRef} className="relative flex h-full w-full items-center justify-center bg-[#0e1119]">
      <canvas
        ref={canvasRef}
        width={CARD_W}
        height={CARD_H}
        style={{
          width: CARD_W * zoom,
          height: CARD_H * zoom,
          boxShadow: "0 24px 60px rgba(0,0,0,0.55)",
          borderRadius: 36 * zoom,
        }}
      />
      <div className="absolute bottom-4 right-4 flex items-center gap-1 rounded-full border border-border bg-[var(--panel)] px-2 py-1">
        <button
          type="button"
          onClick={() => setZoom((z) => Math.max(0.1, Number((z - 0.05).toFixed(3))))}
          className="grid h-6 w-6 place-items-center rounded-full text-[var(--text2)] hover:bg-[var(--panel2)] hover:text-foreground"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-12 text-center text-[11px] tabular-nums text-[var(--text2)]">
          {Math.round(zoom * 100)}%
        </span>
        <button
          type="button"
          onClick={() => setZoom((z) => Math.min(1.5, Number((z + 0.05).toFixed(3))))}
          className="grid h-6 w-6 place-items-center rounded-full text-[var(--text2)] hover:bg-[var(--panel2)] hover:text-foreground"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
