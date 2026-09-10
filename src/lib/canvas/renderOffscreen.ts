import { drawCard, drawCardBack } from "./drawCard";
import { CARD_H, CARD_W } from "./drawZones";
import { loadImage, resolveUrl } from "../supabaseStorage";
import { CARD_TYPES } from "../cardTypes";
import type { CardState } from "@/types/card";

const artCache = new Map<string, HTMLImageElement>();

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

export async function renderCardToCanvas(card: CardState): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = CARD_W;
  canvas.height = CARD_H;
  const ctx = canvas.getContext("2d")!;
  await document.fonts.ready;
  drawCard(ctx, card, await getArt(card));
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
  const source = overrideUrl ?? card.back_url;
  let img: HTMLImageElement | null = null;
  if (source) {
    const url = await resolveUrl(source);
    if (url) {
      try {
        img = await loadImage(url);
      } catch {
        img = null;
      }
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
