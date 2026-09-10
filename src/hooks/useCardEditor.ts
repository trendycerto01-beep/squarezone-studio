import { useCallback, useEffect, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { DEFAULT_CARD, type CardState } from "@/types/card";
import { CARD_TYPES } from "@/lib/cardTypes";
import { autoBorderColor } from "@/lib/colorUtils";
import { loadImage, resolveUrl, uploadBlob } from "@/lib/supabaseStorage";
import { CARD_H, CARD_W } from "@/lib/canvas/drawZones";

export interface PendingArt {
  file: File;
  previewUrl: string;
  name: string;
}

export function useCardEditor(cardId?: string) {
  const [card, setCard] = useState<CardState>({ ...DEFAULT_CARD });
  const [loading, setLoading] = useState(!!cardId);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pendingArt, setPendingArt] = useState<PendingArt | null>(null);
  const [artImage, setArtImage] = useState<HTMLImageElement | null>(null);
  const [pendingCostIcon, setPendingCostIcon] = useState<PendingArt | null>(null);
  const [costIconImage, setCostIconImage] = useState<HTMLImageElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // load existing card
  useEffect(() => {
    let alive = true;
    if (!cardId) {
      setCard({ ...DEFAULT_CARD });
      setLoading(false);
      return;
    }
    setLoading(true);
    supabase
      .from("cards")
      .select("*")
      .eq("id", cardId)
      .maybeSingle()
      .then(async ({ data }) => {
        if (!alive || !data) {
          setLoading(false);
          return;
        }
        setCard({ ...DEFAULT_CARD, ...(data as unknown as CardState) });
        setLoading(false);
        const url = await resolveUrl((data as { art_url: string | null }).art_url);
        if (url && alive) {
          try {
            setArtImage(await loadImage(url));
          } catch {
            /* ignore */
          }
        }
        const iconUrl = await resolveUrl(
          (data as { cost_icon_url: string | null }).cost_icon_url,
        );
        if (iconUrl && alive) {
          try {
            setCostIconImage(await loadImage(iconUrl));
          } catch {
            /* ignore */
          }
        }
      });
    return () => {
      alive = false;
    };
  }, [cardId]);

  const update = useCallback(<K extends keyof CardState>(key: K, value: CardState[K]) => {
    setCard((prev) => {
      const next = { ...prev, [key]: value };
      if (key === "card_type") {
        const cfg = CARD_TYPES[value as CardState["card_type"]];
        if (cfg) {
          next.base_color = cfg.base;
          next.border_color = cfg.border;
        }
      }
      if (next.auto_border) next.border_color = autoBorderColor(next.base_color);
      return next;
    });
    setDirty(true);
  }, []);

  const patch = useCallback((values: Partial<CardState>) => {
    setCard((prev) => ({ ...prev, ...values }));
    setDirty(true);
  }, []);

  const setArt = useCallback(async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setPendingArt({ file, previewUrl, name: file.name });
    try {
      setArtImage(await loadImage(previewUrl));
    } catch {
      /* ignore */
    }
    setDirty(true);
  }, []);

  const clearArt = useCallback(() => {
    setPendingArt(null);
    setArtImage(null);
    setCard((prev) => ({ ...prev, art_url: null }));
    setDirty(true);
  }, []);

  const setCostIcon = useCallback(async (file: File) => {
    const previewUrl = URL.createObjectURL(file);
    setPendingCostIcon({ file, previewUrl, name: file.name });
    try {
      setCostIconImage(await loadImage(previewUrl));
    } catch {
      /* ignore */
    }
    setDirty(true);
  }, []);

  const clearCostIcon = useCallback(() => {
    setPendingCostIcon(null);
    setCostIconImage(null);
    setCard((prev) => ({ ...prev, cost_icon_url: null }));
    setDirty(true);
  }, []);

  const reset = useCallback(() => {
    setCard((prev) => {
      const next: CardState = { ...DEFAULT_CARD, name: prev.name };
      if (prev.id) next.id = prev.id;
      return next;
    });
    setPendingArt(null);
    setArtImage(null);
    setPendingCostIcon(null);
    setCostIconImage(null);
    setDirty(true);
  }, []);

  const exportPng = useCallback(
    (filename?: string) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const link = document.createElement("a");
      link.download = `${filename || card.name || "carta"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    },
    [card.name],
  );

  const makeThumbnail = useCallback(async (): Promise<Blob | null> => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const t = document.createElement("canvas");
    t.width = 200;
    t.height = 280;
    const ctx = t.getContext("2d");
    if (!ctx) return null;
    ctx.imageSmoothingQuality = "high";
    ctx.fillStyle = "#0b0e14";
    ctx.fillRect(0, 0, 200, 280);
    ctx.drawImage(canvas, 0, 0, CARD_W, CARD_H, 0, 0, 200, 280);
    return new Promise((resolve) => t.toBlob((b) => resolve(b), "image/jpeg", 0.85));
  }, []);

  const save = useCallback(async (): Promise<string | null> => {
    setSaving(true);
    try {
      const id = card.id ?? crypto.randomUUID();
      let artPath = card.art_url;

      if (pendingArt) {
        const ext = (pendingArt.file.name.split(".").pop() || "png").toLowerCase();
        artPath = await uploadBlob(
          "card-art",
          `${id}/original.${ext}`,
          pendingArt.file,
          pendingArt.file.type || "image/png",
        );
      }

      let costIconPath = card.cost_icon_url;
      if (pendingCostIcon) {
        const ext = (pendingCostIcon.file.name.split(".").pop() || "png").toLowerCase();
        costIconPath = await uploadBlob(
          "card-art",
          `${id}/cost-icon.${ext}`,
          pendingCostIcon.file,
          pendingCostIcon.file.type || "image/png",
        );
      }

      const thumb = await makeThumbnail();
      let thumbPath = card.thumbnail_url;
      if (thumb) thumbPath = await uploadBlob("card-art", `${id}/thumb.jpg`, thumb, "image/jpeg");

      const row = {
        ...card,
        id,
        art_url: artPath,
        thumbnail_url: thumbPath,
        cost_icon_url: costIconPath,
        name: card.name?.trim() || card.title?.trim() || "Carta sem nome",
      };
      delete (row as { created_at?: string }).created_at;
      delete (row as { updated_at?: string }).updated_at;

      const { error } = await supabase.from("cards").upsert(row as never);
      if (error) throw error;

      setCard((prev) => ({
        ...prev,
        id,
        art_url: artPath,
        thumbnail_url: thumbPath,
        cost_icon_url: costIconPath,
      }));
      setPendingArt(null);
      setPendingCostIcon(null);
      setDirty(false);
      return id;
    } finally {
      setSaving(false);
    }
  }, [card, pendingArt, pendingCostIcon, makeThumbnail]);

  return {
    card,
    setCard,
    update,
    patch,
    loading,
    dirty,
    saving,
    save,
    reset,
    exportPng,
    artImage,
    pendingArt,
    setArt,
    clearArt,
    costIconImage,
    pendingCostIcon,
    setCostIcon,
    clearCostIcon,
    canvasRef,
  };
}
