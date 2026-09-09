import { useCallback, useMemo, useState } from "react";
import { LAYOUTS, type LayoutId } from "@/lib/printLayout";
import type { CardState } from "@/types/card";

export interface PrintSlot {
  card: CardState | null;
  backFile: File | null;
  backPreview: string | null;
  rotation: number;
}

const emptySlot = (): PrintSlot => ({
  card: null,
  backFile: null,
  backPreview: null,
  rotation: 0,
});

export function usePrint() {
  const [layoutId, setLayoutId] = useState<LayoutId>("2x2");
  const layout = LAYOUTS[layoutId];
  const capacity = layout.cols * layout.rows;
  const [slots, setSlots] = useState<PrintSlot[]>(() =>
    Array.from({ length: 8 }, () => emptySlot()),
  );

  const visibleSlots = useMemo(() => slots.slice(0, capacity), [slots, capacity]);

  const setSlot = useCallback((index: number, value: Partial<PrintSlot>) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...value } : s)));
  }, []);

  const placeCard = useCallback(
    (index: number, card: CardState) => setSlot(index, { card }),
    [setSlot],
  );

  const clearSlot = useCallback(
    (index: number) => setSlots((prev) => prev.map((s, i) => (i === index ? emptySlot() : s))),
    [],
  );

  const addCard = useCallback(
    (card: CardState) => {
      let placed = false;
      setSlots((prev) =>
        prev.map((s, i) => {
          if (!placed && !s.card && i < capacity) {
            placed = true;
            return { ...emptySlot(), card };
          }
          return s;
        }),
      );
      return placed;
    },
    [capacity],
  );

  const nextEmptyAfter = useCallback(
    (index: number) => {
      for (let i = index + 1; i < capacity; i++) if (!slots[i]?.card) return i;
      return -1;
    },
    [slots, capacity],
  );

  /** Duplicate a slot (card + attached back + rotation) into the next empty slot. */
  const repeatToNext = useCallback(
    (index: number) => {
      const target = nextEmptyAfter(index);
      if (target < 0) return false;
      const src = slots[index];
      if (!src?.card) return false;
      setSlots((prev) => prev.map((s, i) => (i === target ? { ...src } : s)));
      return true;
    },
    [slots, nextEmptyAfter],
  );

  const clearAll = useCallback(
    () => setSlots(Array.from({ length: 8 }, () => emptySlot())),
    [],
  );

  return {
    layoutId,
    setLayoutId,
    layout,
    capacity,
    slots: visibleSlots,
    allSlots: slots,
    setSlot,
    placeCard,
    clearSlot,
    addCard,
    repeatToNext,
    nextEmptyAfter,
    clearAll,
  };
}
