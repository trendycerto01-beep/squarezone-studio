import { useSyncExternalStore } from "react";
import { LAYOUTS } from "@/lib/printLayout";
import * as store from "@/lib/printStore";

export function usePrint() {
  const snapshot = useSyncExternalStore(store.subscribe, store.getSnapshot, store.getSnapshot);
  const layout = LAYOUTS[snapshot.layoutId];
  const capacity = store.capacityOf(snapshot.layoutId);

  return {
    layoutId: snapshot.layoutId,
    layout,
    capacity,
    slots: snapshot.slots.slice(0, capacity),
    setLayout: store.setLayout,
    setSlot: store.updateSlot,
    clearSlot: store.clearSlot,
    clearAll: store.clearAllSlots,
    addCard: store.addCardToQueue,
    repeatToNext: store.repeatToNext,
    nextEmptyAfter: store.nextEmptyAfter,
  };
}

export type { PrintSlot } from "@/lib/printStore";
