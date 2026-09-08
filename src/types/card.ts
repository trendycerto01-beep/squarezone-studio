export type CardType = "feitico" | "zona" | "evento" | "letra" | "numero";
export type TitleAlign = "left" | "center" | "right";
export type Rarity = "none" | "comum" | "incomum" | "raro" | "epico" | "lendario";
export type ArtFit = "cover" | "contain";

export interface CardState {
  id?: string;
  created_at?: string;
  updated_at?: string;
  name: string;
  card_type: CardType;
  subtype: string;
  title: string;
  title_align: TitleAlign;
  flavor_text: string;
  effect_text: string;
  cost_icon: number;
  cost_number: string;
  card_number: string;
  rarity: Rarity;
  base_color: string;
  border_color: string;
  auto_border: boolean;
  border_style: string;
  texture1: string;
  texture1_int: number;
  texture2: string;
  texture2_int: number;
  title_font: string;
  body_font: string;
  title_size: number;
  art_fit: ArtFit;
  art_x: number;
  art_y: number;
  art_zoom: number;
  art_url: string | null;
  thumbnail_url: string | null;
  back_url: string | null;
  neon_inner: boolean;
  auto_text: boolean;
  settings: Record<string, unknown>;
}

export const DEFAULT_CARD: CardState = {
  name: "Nova carta",
  card_type: "feitico",
  subtype: "",
  title: "",
  title_align: "left",
  flavor_text: "",
  effect_text: "",
  cost_icon: 0,
  cost_number: "",
  card_number: "",
  rarity: "none",
  base_color: "#2d5480",
  border_color: "#7aaac8",
  auto_border: true,
  border_style: "simple",
  texture1: "fabric",
  texture1_int: 30,
  texture2: "vignette",
  texture2_int: 40,
  title_font: "Cinzel",
  body_font: "EB Garamond",
  title_size: 52,
  art_fit: "cover",
  art_x: 50,
  art_y: 50,
  art_zoom: 100,
  art_url: null,
  thumbnail_url: null,
  back_url: null,
  neon_inner: false,
  auto_text: true,
  settings: {},
};
