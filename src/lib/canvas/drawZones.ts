export const CARD_W = 990;
export const CARD_H = 1320;
export const OR = 36; // outer radius
export const CX = 37;
export const CW = 916;
export const ZR = 12;

export const ZONES = {
  title: { y: 37, h: 107 },
  art: { y: 152, h: 487 },
  flavor: { y: 647, h: 80 },
  effect: { y: 735, h: 549 },
};

export function rr(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number,
) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.arcTo(x + w, y, x + w, y + rad, rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.arcTo(x + w, y + h, x + w - rad, y + h, rad);
  ctx.lineTo(x + rad, y + h);
  ctx.arcTo(x, y + h, x, y + h - rad, rad);
  ctx.lineTo(x, y + rad);
  ctx.arcTo(x, y, x + rad, y, rad);
  ctx.closePath();
}

export function zone(
  ctx: CanvasRenderingContext2D,
  y: number,
  h: number,
  fill: string,
  stroke?: string,
) {
  rr(ctx, CX, y, CW, h, ZR);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
}

export function wrapLines(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number,
): string[] {
  const out: string[] = [];
  for (const raw of text.split("\n")) {
    const words = raw.split(/\s+/).filter(Boolean);
    if (!words.length) {
      out.push("");
      continue;
    }
    let line = words[0];
    for (let i = 1; i < words.length; i++) {
      const test = `${line} ${words[i]}`;
      if (ctx.measureText(test).width > maxWidth) {
        out.push(line);
        line = words[i];
      } else line = test;
    }
    out.push(line);
  }
  return out;
}
