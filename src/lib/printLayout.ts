export const MM_PER_PX = 1; // work directly in mm, scale at render time

export const A4 = { w: 210, h: 297 };
export const CARD_MM = { w: 63.5, h: 88 };
export const BLEED = 3;
export const PRINT_MM = { w: CARD_MM.w + BLEED * 2, h: CARD_MM.h + BLEED * 2 }; // 69.5 x 94
export const MARK = 3;

// Espaço entre cartas (onde ficam as marcas de corte). Deve ser >= 2*MARK
// para as marcas de cartas vizinhas não se sobreporem.
export const GUTTER = 6;

export type LayoutId = "2x2" | "2x3";

export interface LayoutConfig {
  id: LayoutId;
  cols: number;
  rows: number;
  label: string;
}

// Observação: com sangria a área impressa de cada carta é 69,5 × 94mm.
// Uma grade 2×4 (376mm de altura) nunca coube numa A4 retrato (297mm) —
// por isso o segundo layout foi ajustado para 2×3, que cabe com folga.
export const LAYOUTS: Record<LayoutId, LayoutConfig> = {
  "2x2": { id: "2x2", cols: 2, rows: 2, label: "2×2 (4 cartas)" },
  "2x3": { id: "2x3", cols: 2, rows: 3, label: "2×3 (6 cartas)" },
};

export interface SlotRect {
  index: number;
  col: number;
  row: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

export function slotRects(layout: LayoutConfig, mirrorColumns = false): SlotRect[] {
  const totalW = layout.cols * PRINT_MM.w + (layout.cols - 1) * GUTTER;
  const totalH = layout.rows * PRINT_MM.h + (layout.rows - 1) * GUTTER;
  const offX = (A4.w - totalW) / 2;
  const offY = (A4.h - totalH) / 2;
  const rects: SlotRect[] = [];
  for (let row = 0; row < layout.rows; row++) {
    for (let col = 0; col < layout.cols; col++) {
      const index = row * layout.cols + col;
      const drawCol = mirrorColumns ? layout.cols - 1 - col : col;
      rects.push({
        index,
        col,
        row,
        x: offX + drawCol * (PRINT_MM.w + GUTTER),
        y: offY + row * (PRINT_MM.h + GUTTER),
        w: PRINT_MM.w,
        h: PRINT_MM.h,
      });
    }
  }
  return rects;
}

/** Draw thin grey cut marks around every card cell, 3mm beyond the bleed. */
export function drawCutMarks(
  ctx: CanvasRenderingContext2D,
  layout: LayoutConfig,
  scale: number,
) {
  ctx.save();
  ctx.strokeStyle = "#9aa0a6";
  ctx.lineWidth = Math.max(0.6, 0.2 * scale);
  const rects = slotRects(layout);
  for (const r of rects) {
    const x0 = (r.x + BLEED) * scale;
    const y0 = (r.y + BLEED) * scale;
    const x1 = (r.x + r.w - BLEED) * scale;
    const y1 = (r.y + r.h - BLEED) * scale;
    const m = MARK * scale;
    const line = (ax: number, ay: number, bx: number, by: number) => {
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    };
    line(x0 - m, y0, x0, y0);
    line(x0, y0 - m, x0, y0);
    line(x1, y0, x1 + m, y0);
    line(x1, y0 - m, x1, y0);
    line(x0 - m, y1, x0, y1);
    line(x0, y1, x0, y1 + m);
    line(x1, y1, x1 + m, y1);
    line(x1, y1, x1, y1 + m);
  }
  ctx.restore();
}
