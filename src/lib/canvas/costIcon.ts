/**
 * Cost icon: an orange flame-card sigil.
 * Built once into an offscreen canvas and cached. If an external icon src is
 * supplied, its near-black pixels are turned transparent (brightness < 55 -> 0,
 * 55-95 -> proportional fade) and the processed canvas is cached by src.
 */
const cache = new Map<string, HTMLCanvasElement>();

const SIZE = 128;

function buildProcedural(): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = SIZE;
  c.height = SIZE;
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";

  // card shape
  ctx.save();
  const g = ctx.createLinearGradient(0, 0, 0, SIZE);
  g.addColorStop(0, "#ffb347");
  g.addColorStop(0.55, "#f07c1e");
  g.addColorStop(1, "#a63c08");
  ctx.fillStyle = g;
  ctx.strokeStyle = "#ffd9a0";
  ctx.lineWidth = 5;
  const x = 18,
    y = 8,
    w = SIZE - 36,
    h = SIZE - 16,
    r = 14;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // flame
  ctx.fillStyle = "rgba(255,238,190,0.92)";
  ctx.beginPath();
  ctx.moveTo(SIZE / 2, 26);
  ctx.bezierCurveTo(SIZE / 2 + 26, 52, SIZE / 2 + 20, 84, SIZE / 2, 100);
  ctx.bezierCurveTo(SIZE / 2 - 20, 84, SIZE / 2 - 26, 52, SIZE / 2, 26);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  return c;
}

export function processIconTransparency(img: HTMLImageElement): HTMLCanvasElement {
  const c = document.createElement("canvas");
  c.width = img.naturalWidth || SIZE;
  c.height = img.naturalHeight || SIZE;
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, c.width, c.height);
  const d = data.data;
  for (let i = 0; i < d.length; i += 4) {
    const br = 0.299 * d[i]! + 0.587 * d[i + 1]! + 0.114 * d[i + 2]!;
    if (br < 55) d[i + 3] = 0;
    else if (br < 95) d[i + 3] = Math.round((d[i + 3]! * (br - 55)) / 40);
  }
  ctx.putImageData(data, 0, 0);
  return c;
}

export function getCostIcon(src?: string): HTMLCanvasElement | null {
  if (typeof document === "undefined") return null;
  const key = src ?? "__procedural__";
  const hit = cache.get(key);
  if (hit) return hit;
  if (!src) {
    const c = buildProcedural();
    cache.set(key, c);
    return c;
  }
  return null;
}

export function cacheProcessedIcon(src: string, canvas: HTMLCanvasElement) {
  cache.set(src, canvas);
}
