import { drawCard, drawCardBack } from "./drawCard";
import { CARD_H, CARD_W } from "./drawZones";
import { loadImage, resolveUrl } from "../supabaseStorage";
import { CARD_TYPES } from "../cardTypes";
import { defaultBackPath } from "../defaultBacks";
import type { CardState } from "@/types/card";

const artCache = new Map<string, HTMLImageElement>();
const iconCache = new Map<string, HTMLImageElement>();

async function getArt(card: CardState): Promise<HTMLImageElement | null> {
  if (!card.art_url) return null;
  const cached = artCache.get(card.art_url);
  if (cached) return cached;
  const url = await resolveUrl(card.art_url);
  if (!url) return null;
  try {
    const img = await loadImage(url);
    artCache.set(card.art_url, img);
    return img;
  } catch {
    return null;
  }
}

async function getCostIconImage(card: CardState): Promise<HTMLImageElement | null> {
  if (!card.cost_icon_url) return null;
  const cached = iconCache.get(card.cost_icon_url);
  if (cached) return cached;
  const url = await resolveUrl(card.cost_icon_url);
  if (!url) return null;
  try {
    const img = await loadImage(url);
    iconCache.set(card.cost_icon_url, img);
    return img;
  } catch {
    return null;
  }
}

export async function renderCardToCanvas(card: CardState): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d")!;
  await document.fonts.ready;
  const [art, costIcon] = await Promise.all([getArt(card), getCostIconImage(card)]);
  drawCard(ctx, card, art, costIcon);
  return canvas;
}

export async function renderBackToCanvas(
  card: CardState,
  overrideUrl?: string | null,
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d")!;
  await document.fonts.ready;
  // priority: manually attached back -> card's own back -> factory default per type
  const sources = [overrideUrl, card.back_url, defaultBackPath(card.card_type)].filter(
    Boolean,
  ) as string[];
  let img: HTMLImageElement | null = null;
  for (const source of sources) {
    const url = await resolveUrl(source);
    if (!url) continue;
    try {
      img = await loadImage(url);
      break;
    } catch {
      img = null;
    }
  }
  const tint = CARD_TYPES[card.card_type]?.back ?? "#2a2a33";
  drawCardBack(ctx, tint, img);
  return canvas;
}

export async function downloadCardPng(card: CardState) {
  const canvas = await renderCardToCanvas(card);
  const link = document.createElement("a");
  link.download = `${card.name || "carta"}.png`;
  link.href = canvas.toDataURL("image/png");
  link.click();
}
