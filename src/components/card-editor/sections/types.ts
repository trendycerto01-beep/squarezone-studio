import type { CardState } from "@/types/card";

export interface SectionProps {
  card: CardState;
  update: <K extends keyof CardState>(key: K, value: CardState[K]) => void;
}
