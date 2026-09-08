import { supabase } from "@/integrations/supabase/client";

const signedCache = new Map<string, { url: string; exp: number }>();

/** Stored paths look like "card-art/<id>/original.png" (bucket + object path). */
export function splitPath(fullPath: string): { bucket: string; path: string } | null {
  const idx = fullPath.indexOf("/");
  if (idx < 0) return null;
  return { bucket: fullPath.slice(0, idx), path: fullPath.slice(idx + 1) };
}

export async function resolveUrl(fullPath: string | null | undefined): Promise<string | null> {
  if (!fullPath) return null;
  if (fullPath.startsWith("http") || fullPath.startsWith("data:") || fullPath.startsWith("blob:"))
    return fullPath;
  const hit = signedCache.get(fullPath);
  const now = Date.now();
  if (hit && hit.exp > now) return hit.url;
  const parts = splitPath(fullPath);
  if (!parts) return null;
  const { data, error } = await supabase.storage
    .from(parts.bucket)
    .createSignedUrl(parts.path, 60 * 60);
  if (error || !data?.signedUrl) return null;
  signedCache.set(fullPath, { url: data.signedUrl, exp: now + 55 * 60 * 1000 });
  return data.signedUrl;
}

export async function uploadBlob(
  bucket: string,
  path: string,
  blob: Blob,
  contentType: string,
): Promise<string> {
  const { error } = await supabase.storage
    .from(bucket)
    .upload(path, blob, { upsert: true, contentType });
  if (error) throw error;
  signedCache.delete(`${bucket}/${path}`);
  return `${bucket}/${path}`;
}

export async function removeStoredFile(fullPath: string | null | undefined) {
  const parts = fullPath ? splitPath(fullPath) : null;
  if (!parts) return;
  await supabase.storage.from(parts.bucket).remove([parts.path]);
  signedCache.delete(fullPath!);
}

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = url;
  });
}
