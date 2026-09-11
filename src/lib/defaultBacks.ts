import type { CardType } from "@/types/card";
import { uploadBlob, resolveUrl } from "./supabaseStorage";

export const DEFAULT_BACK_BUCKET = "card-backs";

/** Fixed "factory" back for each card type: card-backs/<type>.jpg */
export function defaultBackPath(type: CardType): string {
  return `${DEFAULT_BACK_BUCKET}/${type}.jpg`;
}

export async function resolveDefaultBack(type: CardType): Promise<string | null> {
  return resolveUrl(defaultBackPath(type));
}

/** Normalize any image file to a JPEG blob so the stored path stays stable. */
async function toJpeg(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d")!;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  return new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("Falha ao converter imagem"))), "image/jpeg", 0.95),
  );
}

/** Overwrite the default back for a type, keeping the same storage path. */
export async function uploadDefaultBack(type: CardType, file: File): Promise<string> {
  const blob = await toJpeg(file);
  return uploadBlob(DEFAULT_BACK_BUCKET, `${type}.jpg`, blob, "image/jpeg");
}
