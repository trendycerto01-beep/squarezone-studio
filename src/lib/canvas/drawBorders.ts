import { shade } from "../colorUtils";
import { CARD_H, CARD_W, OR, rr } from "./drawZones";

export function drawBorder(
  ctx: CanvasRenderingContext2D,
  style: string,
  color: string,
  neonInner: boolean,
) {
  ctx.save();
  const stroke = (inset: number, width: number, c: string, radius = OR) => {
    ctx.strokeStyle = c;
    ctx.lineWidth = width;
    rr(ctx, inset, inset, CARD_W - inset * 2, CARD_H - inset * 2, Math.max(4, radius - inset));
    ctx.stroke();
  };

  switch (style) {
    case "double":
      stroke(7, 14, color);
      stroke(26, 4, shade(color, 0.25));
      break;
    case "triple":
      stroke(6, 12, color);
      stroke(22, 4, shade(color, 0.3));
      stroke(34, 2, shade(color, -0.3));
      break;
    case "thick":
      stroke(14, 28, color);
      break;
    case "neon":
      ctx.shadowColor = color;
      ctx.shadowBlur = 40;
      stroke(9, 8, shade(color, 0.5));
      ctx.shadowBlur = 22;
      stroke(20, 3, color);
      ctx.shadowBlur = 0;
      break;
    case "ornate": {
      stroke(8, 12, color);
      stroke(26, 3, shade(color, 0.35));
      ctx.fillStyle = shade(color, 0.4);
      const corners: Array<{ cx: number; cy: number }> = [
        { cx: 46, cy: 46 },
        { cx: CARD_W - 46, cy: 46 },
        { cx: 46, cy: CARD_H - 46 },
        { cx: CARD_W - 46, cy: CARD_H - 46 },
      ];
      for (const { cx, cy } of corners) {
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const r = i % 2 === 0 ? 20 : 8;
          const px = cx + Math.cos(a) * r;
          const py = cy + Math.sin(a) * r;
          i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case "metallic": {
      const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
      g.addColorStop(0, shade(color, 0.55));
      g.addColorStop(0.25, shade(color, -0.25));
      g.addColorStop(0.5, shade(color, 0.6));
      g.addColorStop(0.75, shade(color, -0.3));
      g.addColorStop(1, shade(color, 0.45));
      ctx.strokeStyle = g;
      ctx.lineWidth = 18;
      rr(ctx, 9, 9, CARD_W - 18, CARD_H - 18, OR - 9);
      ctx.stroke();
      stroke(24, 2, shade(color, -0.4));
      break;
    }
    default:
      stroke(8, 14, color);
      break;
  }

  if (neonInner) {
    ctx.shadowColor = shade(color, 0.5);
    ctx.shadowBlur = 34;
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 3;
    rr(ctx, 30, 30, CARD_W - 60, CARD_H - 60, OR - 18);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  ctx.restore();
}
