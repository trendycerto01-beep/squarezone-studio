import type { CardState } from "@/types/card";
import { LAYOUTS, type LayoutId } from "./printLayout";

export interface PrintSlot {
  card: CardState | null;
  backFile: File | null;
  backPreview: string | null;
  rotation: number;
}

export const MAX_SLOTS = Math.max(
  ...Object.values(LAYOUTS).map((l) => l.cols * l.rows),
);

export const emptySlot = (): PrintSlot => ({
  card: null,
  backFile: null,
  backPreview: null,
  rotation: 0,
});

interface PrintStoreState {
  layoutId: LayoutId;
  slots: PrintSlot[];
}

let state: PrintStoreState = {
  layoutId: "2x2",
  slots: Array.from({ length: MAX_SLOTS }, () => emptySlot()),
};

const listeners = new Set<() => void>();

export function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getSnapshot(): PrintStoreState {
  return state;
}

function set(next: Partial<PrintStoreState>) {
  state = { ...state, ...next };
  listeners.forEach((l) => l());
}

export function setLayout(layoutId: LayoutId) {
  set({ layoutId });
}

export function updateSlot(index: number, value: Partial<PrintSlot>) {
  set({ slots: state.slots.map((s, i) => (i === index ? { ...s, ...value } : s)) });
}

export function clearSlot(index: number) {
  set({ slots: state.slots.map((s, i) => (i === index ? emptySlot() : s)) });
}

export function clearAllSlots() {
  set({ slots: Array.from({ length: MAX_SLOTS }, () => emptySlot()) });
}

export function capacityOf(layoutId: LayoutId) {
  const layout = LAYOUTS[layoutId];
  return layout.cols * layout.rows;
}

/** Place a card in the first empty slot of the active layout. Returns success. */
export function addCardToQueue(card: CardState): boolean {
  const cap = capacityOf(state.layoutId);
  const idx = state.slots.findIndex((s, i) => i < cap && !s.card);
  if (idx < 0) return false;
  updateSlot(idx, { ...emptySlot(), card });
  return true;
}

export function nextEmptyAfter(index: number): number {
  const cap = capacityOf(state.layoutId);
  for (let i = index + 1; i < cap; i++) if (!state.slots[i]?.card) return i;
  return -1;
}

/** Duplicate a slot (card + attached back + rotation) into the next empty slot. */
export function repeatToNext(index: number): boolean {
  const target = nextEmptyAfter(index);
  const src = state.slots[index];
  if (target < 0 || !src?.card) return false;
  set({ slots: state.slots.map((s, i) => (i === target ? { ...src } : s)) });
  return true;
}
