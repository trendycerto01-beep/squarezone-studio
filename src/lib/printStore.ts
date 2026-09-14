import type { CardState } from "@/types/card";
import { LAYOUTS, type LayoutId } from "./printLayout";

export interface PrintSlot {
  card: CardState | null;
  backFile: File | null;
  backPreview: string | null;
  rotation: number;
}

/** Maior capacidade entre os layouts (mantido por compatibilidade). */
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
  /** Lista contínua de slots: o comprimento é sempre múltiplo da capacidade da folha. */
  slots: PrintSlot[];
}

export function capacityOf(layoutId: LayoutId) {
  const layout = LAYOUTS[layoutId];
  return layout.cols * layout.rows;
}

const makeSlots = (n: number) => Array.from({ length: n }, () => emptySlot());

let state: PrintStoreState = {
  layoutId: "2x2",
  slots: makeSlots(capacityOf("2x2")),
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

/** Garante que o array tenha um número inteiro de folhas (mínimo uma). */
function padToSheets(slots: PrintSlot[], cap: number): PrintSlot[] {
  const sheets = Math.max(1, Math.ceil(slots.length / cap));
  const total = sheets * cap;
  return slots.length === total ? slots : [...slots, ...makeSlots(total - slots.length)];
}

export function setLayout(layoutId: LayoutId) {
  const cap = capacityOf(layoutId);
  set({ layoutId, slots: padToSheets(state.slots.slice(), cap) });
}

export function sheetCount(): number {
  return Math.max(1, Math.ceil(state.slots.length / capacityOf(state.layoutId)));
}

export function updateSlot(index: number, value: Partial<PrintSlot>) {
  if (index < 0 || index >= state.slots.length) return;
  set({ slots: state.slots.map((s, i) => (i === index ? { ...s, ...value } : s)) });
}

export function clearSlot(index: number) {
  set({ slots: state.slots.map((s, i) => (i === index ? emptySlot() : s)) });
}

export function clearAllSlots() {
  set({ slots: makeSlots(capacityOf(state.layoutId)) });
}

export function addSheet() {
  set({ slots: [...state.slots, ...makeSlots(capacityOf(state.layoutId))] });
}

/** Remove uma folha inteira (nunca deixa o documento sem folhas). */
export function removeSheet(sheetIndex: number) {
  const cap = capacityOf(state.layoutId);
  if (sheetCount() <= 1) {
    clearAllSlots();
    return;
  }
  const start = sheetIndex * cap;
  set({ slots: [...state.slots.slice(0, start), ...state.slots.slice(start + cap)] });
}

/** Coloca a carta no primeiro slot vazio, criando uma folha nova se necessário. */
export function addCardToQueue(card: CardState): boolean {
  const idx = state.slots.findIndex((s) => !s.card);
  if (idx >= 0) {
    updateSlot(idx, { ...emptySlot(), card });
    return true;
  }
  const cap = capacityOf(state.layoutId);
  const extra = makeSlots(cap);
  extra[0] = { ...emptySlot(), card };
  set({ slots: [...state.slots, ...extra] });
  return true;
}

/**
 * Acrescenta várias ocorrências ao FIM da fila, sem apagar nada já montado.
 * Cada ocorrência reaproveita o mesmo CardState (mesmo card_id) — o verso
 * continua sendo resolvido pelo mecanismo existente.
 */
export function appendCardsToQueue(cards: CardState[]): number {
  const list = cards.filter(Boolean);
  if (!list.length) return 0;
  const cap = capacityOf(state.layoutId);
  const slots = state.slots.slice();
  let cursor = 0;
  for (const card of list) {
    while (cursor < slots.length && slots[cursor]?.card) cursor++;
    if (cursor >= slots.length) slots.push(...makeSlots(cap));
    slots[cursor] = { ...emptySlot(), card };
    cursor++;
  }
  set({ slots: padToSheets(slots, cap) });
  return list.length;
}

export function nextEmptyAfter(index: number): number {
  for (let i = index + 1; i < state.slots.length; i++) if (!state.slots[i]?.card) return i;
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
