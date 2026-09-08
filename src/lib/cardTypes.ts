import type { CardType } from "@/types/card";

export interface CardTypeConfig {
  id: CardType;
  label: string;
  base: string;
  border: string;
  back: string;
  note: string;
}

export const CARD_TYPES: Record<CardType, CardTypeConfig> = {
  feitico: {
    id: "feitico",
    label: "Feitiço",
    base: "#2d5480",
    border: "#7aaac8",
    back: "#1f6f4a",
    note: "Azul profundo",
  },
  zona: {
    id: "zona",
    label: "Zona Oculta",
    base: "#1e3a5a",
    border: "#5a8bb0",
    back: "#1d4f86",
    note: "Azul-marinho escuro",
  },
  evento: {
    id: "evento",
    label: "Evento",
    base: "#5a1e1e",
    border: "#b06a5a",
    back: "#8c1f1f",
    note: "Vermelho profundo",
  },
  letra: {
    id: "letra",
    label: "Letra",
    base: "#2a3a30",
    border: "#7aa88c",
    back: "#a8842a",
    note: "Verde escuro — Coordenada",
  },
  numero: {
    id: "numero",
    label: "Número",
    base: "#3a2a1e",
    border: "#b08a5a",
    back: "#5a2f8c",
    note: "Marrom escuro — Coordenada",
  },
};

export const CARD_TYPE_LIST = Object.values(CARD_TYPES);

export const FONTS = [
  "Cinzel",
  "Uncial Antiqua",
  "Almendra",
  "Metamorphous",
  "Philosopher",
  "Crimson Text",
  "EB Garamond",
];

export const SWATCH_GROUPS: { label: string; colors: string[] }[] = [
  {
    label: "Aquático / Natural / Fogo",
    colors: ["#9ec6e0", "#2d5480", "#38b2c0", "#6da87a", "#4a7c52", "#b84830"],
  },
  {
    label: "Arcano / Sombrio / Sagrado",
    colors: ["#7248a8", "#4a2870", "#2a2a3a", "#c8a030", "#e8d890", "#d4c8b0"],
  },
  {
    label: "Terra / Metal / Neutro",
    colors: ["#8c6040", "#606858", "#909898", "#c0a860", "#b0d0c0", "#f0e8d8"],
  },
];

export const TEXTURES_1 = [
  { id: "none", label: "Nenhuma" },
  { id: "fabric", label: "Tecido" },
  { id: "parchment", label: "Pergaminho" },
  { id: "grain", label: "Grão" },
  { id: "noise", label: "Ruído" },
  { id: "leather", label: "Couro" },
  { id: "stone", label: "Pedra" },
  { id: "metal", label: "Metal" },
  { id: "arcane", label: "Arcano" },
];

export const TEXTURES_2 = [
  { id: "none", label: "Nenhum" },
  { id: "vignette", label: "Vinheta" },
  { id: "glow", label: "Brilho" },
  { id: "innerglow", label: "Brilho interno" },
  { id: "innershadow", label: "Sombra interna" },
  { id: "mist", label: "Névoa" },
  { id: "lines", label: "Linhas" },
  { id: "dots", label: "Pontos" },
];

export const BORDER_STYLES = [
  { id: "simple", label: "Simples" },
  { id: "double", label: "Dupla" },
  { id: "triple", label: "Tripla" },
  { id: "thick", label: "Grossa" },
  { id: "neon", label: "Neon" },
  { id: "ornate", label: "Ornamentada" },
  { id: "metallic", label: "Metálica" },
];
