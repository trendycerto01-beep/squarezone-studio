import type { Rarity } from "@/types/card";

export interface RarityConfig {
  id: Rarity;
  label: string;
  color: string;
  symbol: string;
}

export const RARITIES: Record<Rarity, RarityConfig> = {
  none: { id: "none", label: "Nenhuma", color: "#6b7280", symbol: "" },
  comum: { id: "comum", label: "Comum", color: "#b9c0cc", symbol: "●" },
  incomum: { id: "incomum", label: "Incomum", color: "#5fbf7a", symbol: "◆" },
  raro: { id: "raro", label: "Raro", color: "#5b8def", symbol: "★" },
  epico: { id: "epico", label: "Épico", color: "#a86ff0", symbol: "✦" },
  lendario: { id: "lendario", label: "Lendário", color: "#e8b23a", symbol: "✸" },
};

export const RARITY_LIST = Object.values(RARITIES);
