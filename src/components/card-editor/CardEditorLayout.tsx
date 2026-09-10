import { useEffect, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useCardEditor } from "@/hooks/useCardEditor";
import { CardCanvas } from "./CardCanvas";
import { ControlPanel } from "./ControlPanel";

export function CardEditorLayout({ cardId }: { cardId?: string }) {
  const editor = useCardEditor(cardId);
  const navigate = useNavigate();
  const [savedRecently, setSavedRecently] = useState(false);

  useEffect(() => {
    if (!savedRecently) return;
    const t = setTimeout(() => setSavedRecently(false), 2200);
    return () => clearTimeout(t);
  }, [savedRecently]);

  const handleSave = async () => {
    try {
      const id = await editor.save();
      setSavedRecently(true);
      toast.success("Carta salva");
      if (id && !cardId) navigate({ to: "/editor/$id", params: { id } });
    } catch (e) {
      toast.error(`Não foi possível salvar: ${(e as Error).message}`);
    }
  };

  return (
    <div className="flex h-full">
      <ControlPanel
        card={editor.card}
        update={editor.update}
        artName={editor.pendingArt?.name ?? null}
        onFile={editor.setArt}
        onClearArt={editor.clearArt}
        saving={editor.saving}
        dirty={editor.dirty}
        savedRecently={savedRecently}
        onSave={handleSave}
        onExport={() => editor.exportPng()}
        onReset={editor.reset}
      />
      <div className="min-w-0 flex-1">
        <CardCanvas card={editor.card} art={editor.artImage} canvasRef={editor.canvasRef} />
      </div>
    </div>
  );
}
