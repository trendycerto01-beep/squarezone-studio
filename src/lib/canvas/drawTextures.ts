import { CARD_H, CARD_W, OR, rr } from "./drawZones";

function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Draws texture1 patterns clipped to the card, in overlay blend mode. */
export function drawTexture(
  ctx: CanvasRenderingContext2D,
  kind: string,
  intensity: number,
) {
  if (kind === "none" || intensity <= 0) return;
  const alpha = (intensity / 100) * 0.45;
  ctx.save();
  rr(ctx, 0, 0, CARD_W, CARD_H, OR);
  ctx.clip();
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = alpha;
  const rand = seeded(9137);

  switch (kind) {
    case "fabric": {
      ctx.lineWidth = 1;
      for (let x = 0; x < CARD_W; x += 4) {
        ctx.strokeStyle = x % 8 === 0 ? "#ffffff" : "#000000";
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CARD_H);
        ctx.stroke();
      }
      for (let y = 0; y < CARD_H; y += 4) {
        ctx.strokeStyle = y % 8 === 0 ? "#000000" : "#ffffff";
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CARD_W, y);
        ctx.stroke();
      }
      break;
    }
    case "parchment": {
      for (let i = 0; i < 900; i++) {
        const x = rand() * CARD_W;
        const y = rand() * CARD_H;
        const r = 8 + rand() * 60;
        ctx.fillStyle = rand() > 0.5 ? "rgba(255,240,200,0.5)" : "rgba(90,60,30,0.4)";
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * (0.3 + rand() * 0.7), rand() * Math.PI, 0, Math.PI * 2);
        ctx.fill();
      }
      break;
    }
    case "grain": {
      for (let i = 0; i < 6000; i++) {
        const x = rand() * CARD_W;
        const y = rand() * CARD_H;
        ctx.fillStyle = rand() > 0.5 ? "#ffffff" : "#000000";
        ctx.fillRect(x, y, 2, 1);
      }
      break;
    }
    case "noise": {
      for (let i = 0; i < 16000; i++) {
        const x = rand() * CARD_W;
        const y = rand() * CARD_H;
        const v = Math.floor(rand() * 255);
        ctx.fillStyle = `rgb(${v},${v},${v})`;
        ctx.fillRect(x, y, 2, 2);
      }
      break;
    }
    case "leather": {
      for (let i = 0; i < 1400; i++) {
        const x = rand() * CARD_W;
        const y = rand() * CARD_H;
        const r = 6 + rand() * 18;
        ctx.strokeStyle = rand() > 0.5 ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.55)";
        ctx.lineWidth = 1 + rand() * 2;
        ctx.beginPath();
        ctx.ellipse(x, y, r, r * 0.7, rand() * Math.PI, 0, Math.PI * 2);
        ctx.stroke();
      }
      break;
    }
    case "stone": {
      for (let i = 0; i < 700; i++) {
        const x = rand() * CARD_W;
        const y = rand() * CARD_H;
        ctx.fillStyle = rand() > 0.5 ? "rgba(255,255,255,0.45)" : "rgba(0,0,0,0.5)";
        ctx.beginPath();
        ctx.moveTo(x, y);
        for (let k = 0; k < 5; k++) {
          ctx.lineTo(x + (rand() - 0.5) * 70, y + (rand() - 0.5) * 70);
        }
        ctx.closePath();
        ctx.fill();
      }
      break;
    }
    case "metal": {
      for (let y = 0; y < CARD_H; y += 3) {
        const v = rand();
        ctx.strokeStyle = v > 0.5 ? `rgba(255,255,255,${v * 0.7})` : `rgba(0,0,0,${v})`;
        ctx.lineWidth = 1 + rand() * 2;
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CARD_W, y + (rand() - 0.5) * 3);
        ctx.stroke();
      }
      break;
    }
    case "arcane": {
      ctx.strokeStyle = "rgba(255,255,255,0.75)";
      ctx.lineWidth = 2;
      for (let i = 0; i < 26; i++) {
        const cx = rand() * CARD_W;
        const cy = rand() * CARD_H;
        const r = 30 + rand() * 140;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
        const sides = 3 + Math.floor(rand() * 5);
        ctx.beginPath();
        for (let s = 0; s <= sides; s++) {
          const a = (s / sides) * Math.PI * 2;
          const px = cx + Math.cos(a) * r;
          const py = cy + Math.sin(a) * r;
          s === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
        }
        ctx.stroke();
      }
      break;
    }
  }
  ctx.restore();
}
