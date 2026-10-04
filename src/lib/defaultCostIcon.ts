import { loadImage, resolveUrl, uploadBlob } from "./supabaseStorage";

export const DEFAULT_COST_ICON_PATH = "card-backs/cost-icon.png";
export const DEFAULT_COST_ICON_CHANGED = "squarezone:default-cost-icon-changed";
const VERSION_KEY = "squarezone:default-cost-icon-version";

/** The version prevents a previously loaded image from surviving an overwrite. */
export async function resolveDefaultCostIcon(): Promise<string | null> {
  const url = await resolveUrl(DEFAULT_COST_ICON_PATH);
  if (!url) return null;
  const version = typeof localStorage === "undefined" ? "" : localStorage.getItem(VERSION_KEY);
  return version ? `${url}${url.includes("?") ? "&" : "?"}v=${encodeURIComponent(version)}` : url;
}

export async function loadCostIconWithFallback(
  personalPath?: string | null,
): Promise<HTMLImageElement | null> {
  if (personalPath) {
    const personalUrl = await resolveUrl(personalPath);
    if (personalUrl) {
      try {
        return await loadImage(personalUrl);
      } catch {
        // A missing personal image must not prevent the global fallback.
      }
    }
  }
  const defaultUrl = await resolveDefaultCostIcon();
  if (defaultUrl) {
    try {
      return await loadImage(defaultUrl);
    } catch {
      // drawCard retains its existing procedural fallback.
    }
  }
  return null;
}

/** Keep one fixed object path; PNG conversion preserves transparency. */
export async function uploadDefaultCostIcon(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const canvas = document.createElement("canvas");
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    throw new Error("Não foi possível processar a imagem");
  }
  ctx.drawImage(bitmap, 0, 0);
  bitmap.close();
  const png = await new Promise<Blob>((resolve, reject) =>
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Falha ao converter imagem")), "image/png"),
  );
  const path = await uploadBlob("card-backs", "cost-icon.png", png, "image/png");
  localStorage.setItem(VERSION_KEY, String(Date.now()));
  window.dispatchEvent(new Event(DEFAULT_COST_ICON_CHANGED));
  return path;
}

export function watchDefaultCostIcon(callback: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === VERSION_KEY) callback();
  };
  window.addEventListener(DEFAULT_COST_ICON_CHANGED, callback);
  window.addEventListener("storage", onStorage);
  return () => {
    window.removeEventListener(DEFAULT_COST_ICON_CHANGED, callback);
    window.removeEventListener("storage", onStorage);
  };
}