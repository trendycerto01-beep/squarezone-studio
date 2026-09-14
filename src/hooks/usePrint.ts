import { useSyncExternalStore } from "react";
import { LAYOUTS } from "@/lib/printLayout";
import * as store from "@/lib/printStore";
import type { PrintSlot } from "@/lib/printStore";

export function usePrint() {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const layout = LAYOUTS[snapshot.layoutId];
  const capacity = store.capacityOf(snapshot.layoutId);
  const sheets: PrintSlot[][] = [];
  for (let i = 0; i < snapshot.slots.length; i += capacity) {
    sheets.push(snapshot.slots.slice(i, i + capacity));
  }
  if (!sheets.length) sheets.push([]);

  return {
    layoutId: snapshot.layoutId,
    layout,
    capacity,
    slots: snapshot.slots,
    sheets,
    sheetCount: sheets.length,
    setLayout: store.setLayout,
    setSlot: store.updateSlot,
    clearSlot: store.clearSlot,
    clearAll: store.clearAllSlots,
    addCard: store.addCardToQueue,
    appendCards: store.appendCardsToQueue,
    addSheet: store.addSheet,
    removeSheet: store.removeSheet,
    repeatToNext: store.repeatToNext,
    nextEmptyAfter: store.nextEmptyAfter,
  };
}

export type { PrintSlot } from "@/lib/printStore";
