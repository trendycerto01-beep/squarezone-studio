import { CARD_H, CARD_W, OR, rr } from "./drawZones";

export function drawEffect(
  ctx: CanvasRenderingContext2D,
  kind: string,
  intensity: number,
  accent: string,
) {
  if (kind === "none" || intensity <= 0) return;
  const t = intensity / 100;
  ctx.save();
  rr(ctx, 0, 0, CARD_W, CARD_H, OR);
  ctx.clip();

  switch (kind) {
    case "vignette": {
      const g = ctx.createRadialGradient(
        CARD_W / 2,
        CARD_H / 2,
        CARD_W * 0.25,
        CARD_W / 2,
        CARD_H / 2,
        CARD_H * 0.72,
      );
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, `rgba(0,0,0,${0.85 * t})`);
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, CARD_W, CARD_H);
      break;
    }
    case "glow": {
      const g = ctx.createRadialGradient(
        CARD_W / 2,
        CARD_H * 0.38,
        20,
        CARD_W / 2,
        CARD_H * 0.38,
        CARD_W * 0.85,
      );
      g.addColorStop(0, `rgba(255,255,255,${0.35 * t})`);
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, CARD_W, CARD_H);
      break;
    }
    case "innerglow": {
      ctx.globalCompositeOperation = "lighter";
      ctx.shadowColor = accent;
      ctx.shadowBlur = 70 * t;
      ctx.lineWidth = 16;
      ctx.strokeStyle = `rgba(255,255,255,${0.25 * t})`;
      rr(ctx, 12, 12, CARD_W - 24, CARD_H - 24, OR - 8);
      ctx.stroke();
      break;
    }
    case "innershadow": {
      ctx.shadowColor = `rgba(0,0,0,${0.9 * t})`;
      ctx.shadowBlur = 60 * t;
      ctx.lineWidth = 26;
      ctx.strokeStyle = "rgba(0,0,0,0.6)";
      rr(ctx, -10, -10, CARD_W + 20, CARD_H + 20, OR);
      ctx.stroke();
      break;
    }
    case "mist": {
      for (let i = 0; i < 16; i++) {
        const y = (i / 16) * CARD_H + Math.sin(i) * 20;
        const g = ctx.createLinearGradient(0, y, CARD_W, y + 60);
        g.addColorStop(0, "rgba(255,255,255,0)");
        g.addColorStop(0.5, `rgba(255,255,255,${0.18 * t})`);
        g.addColorStop(1, "rgba(255,255,255,0)");
        ctx.fillStyle = g;
        ctx.fillRect(0, y, CARD_W, 90);
      }
      break;
    }
    case "lines": {
      ctx.strokeStyle = `rgba(255,255,255,${0.22 * t})`;
      ctx.lineWidth = 2;
      for (let x = -CARD_H; x < CARD_W; x += 14) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x + CARD_H, CARD_H);
        ctx.stroke();
      }
      break;
    }
    case "dots": {
      ctx.fillStyle = `rgba(255,255,255,${0.28 * t})`;
      for (let y = 8; y < CARD_H; y += 16) {
        for (let x = 8; x < CARD_W; x += 16) {
          ctx.beginPath();
          ctx.arc(x, y, 1.6, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      break;
    }
  }
  ctx.restore();
}
