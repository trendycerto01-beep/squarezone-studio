import { autoBorderColor, shade, textColors, withAlpha } from "../colorUtils";
import { RARITIES } from "../rarityConfig";
import type { CardState } from "@/types/card";
import { drawBorder } from "./drawBorders";
import { drawEffect } from "./drawEffects";
import { drawTexture } from "./drawTextures";
import { getCostIcon } from "./costIcon";
import { CARD_H, CARD_W, CW, CX, OR, ZONES, ZR, rr, wrapLines, zone } from "./drawZones";

export function drawCard(
  ctx: CanvasRenderingContext2D,
  card: CardState,
  art: HTMLImageElement | null,
) {
  const base = card.base_color || "#2d5480";
  const border = card.auto_border ? autoBorderColor(base) : card.border_color;
  const { text, soft, light } = textColors(base);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, CARD_W, CARD_H);

  // 1. background
  ctx.save();
  rr(ctx, 0, 0, CARD_W, CARD_H, OR);
  const bg = ctx.createLinearGradient(0, 0, 0, CARD_H);
  bg.addColorStop(0, shade(base, light ? -0.05 : 0.1));
  bg.addColorStop(1, shade(base, light ? -0.2 : -0.28));
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.restore();

  const zoneFill = shade(base, light ? -0.12 : 0.12);
  const zoneStroke = withAlpha(border, 0.55);

  // 3. title bar
  zone(ctx, ZONES.title.y, ZONES.title.h, shade(base, light ? -0.16 : 0.18), zoneStroke);

  // 4. art zone
  ctx.save();
  rr(ctx, CX, ZONES.art.y, CW, ZONES.art.h, ZR);
  ctx.clip();
  ctx.fillStyle = shade(base, light ? -0.28 : -0.35);
  ctx.fillRect(CX, ZONES.art.y, CW, ZONES.art.h);
  if (art && art.naturalWidth) {
    const zoom = (card.art_zoom || 100) / 100;
    const iw = art.naturalWidth;
    const ih = art.naturalHeight;
    const scaleBase =
      card.art_fit === "contain"
        ? Math.min(CW / iw, ZONES.art.h / ih)
        : Math.max(CW / iw, ZONES.art.h / ih);
    const s = scaleBase * zoom;
    const dw = iw * s;
    const dh = ih * s;
    const dx = CX + (CW - dw) * ((card.art_x ?? 50) / 100);
    const dy = ZONES.art.y + (ZONES.art.h - dh) * ((card.art_y ?? 50) / 100);
    ctx.drawImage(art, dx, dy, dw, dh);
  } else {
    ctx.fillStyle = soft;
    ctx.font = `400 30px "DM Sans", sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Sem arte", CX + CW / 2, ZONES.art.y + ZONES.art.h / 2);
  }
  ctx.restore();
  ctx.save();
  rr(ctx, CX, ZONES.art.y, CW, ZONES.art.h, ZR);
  ctx.strokeStyle = zoneStroke;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  // 5 & 6. flavor + effect zones
  zone(ctx, ZONES.flavor.y, ZONES.flavor.h, zoneFill, zoneStroke);
  zone(ctx, ZONES.effect.y, ZONES.effect.h, zoneFill, zoneStroke);

  // 8. title
  ctx.save();
  ctx.textBaseline = "middle";
  const size = card.title_size || 52;
  ctx.font = `700 ${size}px "${card.title_font}", serif`;
  ctx.fillStyle = text;
  const pad = 30;
  const ty = ZONES.title.y + ZONES.title.h / 2;
  if (card.title_align === "center") {
    ctx.textAlign = "center";
    ctx.fillText(card.title || "", CX + CW / 2, ty, CW - pad * 2);
  } else if (card.title_align === "right") {
    ctx.textAlign = "right";
    ctx.fillText(card.title || "", CX + CW - pad, ty, CW - pad * 2);
  } else {
    ctx.textAlign = "left";
    ctx.fillText(card.title || "", CX + pad, ty, CW - pad * 2);
  }
  ctx.restore();

  // 7. subtype (italic, small, under the title bar)
  if (card.subtype) {
    ctx.save();
    ctx.font = `italic 400 26px "${card.body_font}", serif`;
    ctx.fillStyle = soft;
    ctx.textBaseline = "top";
    ctx.textAlign =
      card.title_align === "center" ? "center" : card.title_align === "right" ? "right" : "left";
    const sx =
      card.title_align === "center"
        ? CX + CW / 2
        : card.title_align === "right"
          ? CX + CW - pad
          : CX + pad;
    ctx.fillText(card.subtype, sx, ZONES.title.y + ZONES.title.h + 6, CW - pad * 2);
    ctx.restore();
  }

  // 9. cost icons
  let flavorLeft = CX + 24;
  const icons = Math.max(0, Math.min(2, card.cost_icon || 0));
  if (icons > 0) {
    const icon = getCostIcon();
    const ih = ZONES.flavor.h - 18;
    for (let i = 0; i < icons; i++) {
      const ix = CX + 16 + i * (ih + 8);
      if (icon) ctx.drawImage(icon, ix, ZONES.flavor.y + 9, ih, ih);
      if (i === 0 && card.cost_number) {
        ctx.save();
        ctx.font = `700 ${Math.round(ih * 0.52)}px "DM Sans", sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.lineWidth = 4;
        ctx.strokeStyle = "rgba(60,25,0,0.85)";
        ctx.strokeText(card.cost_number, ix + ih / 2, ZONES.flavor.y + 9 + ih / 2);
        ctx.fillStyle = "#ffdf8a";
        ctx.fillText(card.cost_number, ix + ih / 2, ZONES.flavor.y + 9 + ih / 2);
        ctx.restore();
      }
    }
    flavorLeft = CX + 16 + icons * (ih + 8) + 12;
  }

  // 10. flavor text
  if (card.flavor_text) {
    ctx.save();
    ctx.font = `italic 400 30px "${card.body_font}", serif`;
    ctx.fillStyle = soft;
    ctx.textBaseline = "middle";
    const fy = ZONES.flavor.y + ZONES.flavor.h / 2;
    if (icons > 0) {
      ctx.textAlign = "left";
      ctx.fillText(card.flavor_text, flavorLeft, fy, CX + CW - 24 - flavorLeft);
    } else {
      ctx.textAlign = "center";
      ctx.fillText(card.flavor_text, CX + CW / 2, fy, CW - 48);
    }
    ctx.restore();
  }

  // 11. effect text with auto-fit
  if (card.effect_text) {
    ctx.save();
    const boxX = CX + 30;
    const boxW = CW - 60;
    const boxY = ZONES.effect.y + 26;
    const boxH = ZONES.effect.h - 88;
    let fontSize = 40;
    let lines: string[] = [];
    let lineH = 0;
    while (fontSize > 14) {
      ctx.font = `400 ${fontSize}px "${card.body_font}", serif`;
      lines = wrapLines(ctx, card.effect_text, boxW);
      lineH = fontSize * 1.3;
      if (lines.length * lineH <= boxH) break;
      fontSize -= 2;
    }
    ctx.fillStyle = text;
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    lines.forEach((l, i) => ctx.fillText(l, boxX, boxY + i * lineH, boxW));
    ctx.restore();
  }

  // 12. card number + rarity
  ctx.save();
  ctx.font = `500 24px "DM Sans", sans-serif`;
  ctx.textBaseline = "alphabetic";
  const by = ZONES.effect.y + ZONES.effect.h - 22;
  ctx.fillStyle = soft;
  ctx.textAlign = "left";
  if (card.card_number) ctx.fillText(card.card_number, CX + 30, by);
  const rar = RARITIES[card.rarity] ?? RARITIES.none;
  if (rar.id !== "none") {
    ctx.textAlign = "right";
    ctx.fillStyle = rar.color;
    ctx.fillText(`${rar.symbol} ${rar.label}`, CX + CW - 30, by);
  }
  ctx.restore();

  // 13 + 14. textures and effects
  drawTexture(ctx, card.texture1, card.texture1_int);
  drawEffect(ctx, card.texture2, card.texture2_int, shade(base, 0.5));

  // 2. border on top
  drawBorder(ctx, card.border_style, border, card.neon_inner);
}

/** Card back: procedural glossy back tinted per card type, or a custom image. */
export function drawCardBack(
  ctx: CanvasRenderingContext2D,
  tint: string,
  image: HTMLImageElement | null,
  label = "SQUAREZONE",
) {
  ctx.imageSmoothingQuality = "high";
  ctx.clearRect(0, 0, CARD_W, CARD_H);
  ctx.save();
  rr(ctx, 0, 0, CARD_W, CARD_H, OR);
  ctx.clip();
  if (image && image.naturalWidth) {
    const s = Math.max(CARD_W / image.naturalWidth, CARD_H / image.naturalHeight);
    const dw = image.naturalWidth * s;
    const dh = image.naturalHeight * s;
    ctx.drawImage(image, (CARD_W - dw) / 2, (CARD_H - dh) / 2, dw, dh);
    ctx.restore();
    return;
  }
  const g = ctx.createLinearGradient(0, 0, CARD_W, CARD_H);
  g.addColorStop(0, shade(tint, 0.35));
  g.addColorStop(0.5, tint);
  g.addColorStop(1, shade(tint, -0.5));
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, CARD_W, CARD_H);

  ctx.strokeStyle = "rgba(255,255,255,0.14)";
  ctx.lineWidth = 3;
  for (let i = -CARD_H; i < CARD_W; i += 46) {
    ctx.beginPath();
    ctx.moveTo(i, 0);
    ctx.lineTo(i + CARD_H, CARD_H);
    ctx.stroke();
  }

  // emblem
  ctx.translate(CARD_W / 2, CARD_H / 2);
  ctx.rotate(Math.PI / 4);
  ctx.strokeStyle = "rgba(255,255,255,0.55)";
  ctx.lineWidth = 10;
  ctx.strokeRect(-170, -170, 340, 340);
  ctx.lineWidth = 4;
  ctx.strokeRect(-120, -120, 240, 240);
  ctx.fillStyle = "rgba(255,255,255,0.18)";
  ctx.fillRect(-70, -70, 140, 140);
  ctx.rotate(-Math.PI / 4);
  ctx.fillStyle = "rgba(255,255,255,0.9)";
  ctx.font = `700 62px "Cinzel", serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(label, 0, 0);
  ctx.restore();

  ctx.save();
  ctx.strokeStyle = shade(tint, 0.5);
  ctx.lineWidth = 14;
  rr(ctx, 8, 8, CARD_W - 16, CARD_H - 16, OR - 8);
  ctx.stroke();
  ctx.restore();
}
