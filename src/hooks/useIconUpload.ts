import { useCallback, useEffect, useState } from "react";

/**
 * Handles file picking, drag-and-drop and Ctrl+V paste for the cost icon.
 * Paste only listens while the drop zone is hovered, so it doesn't collide
 * with the card-art upload, which listens on the whole window.
 */
export function useIconUpload(onImage: (file: File) => void) {
  const [dragging, setDragging] = useState(false);
  const [hovering, setHovering] = useState(false);

  useEffect(() => {
    if (!hovering) return;
    const onPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;
      for (const item of Array.from(items)) {
        if (item.type.startsWith("image/")) {
          const file = item.getAsFile();
          if (file) {
            e.preventDefault();
            e.stopPropagation();
            onImage(file);
          }
          return;
        }
      }
    };
    window.addEventListener("paste", onPaste, true);
    return () => window.removeEventListener("paste", onPaste, true);
  }, [hovering, onImage]);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith("image/"));
      if (file) onImage(file);
    },
    [onImage],
  );

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(true);
  }, []);

  const onDragLeave = useCallback(() => setDragging(false), []);

  return {
    dragging,
    onDrop,
    onDragOver,
    onDragLeave,
    onMouseEnter: () => setHovering(true),
    onMouseLeave: () => setHovering(false),
  };
}
