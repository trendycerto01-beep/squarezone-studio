import { useRef } from "react";
import { ImageUp, X } from "lucide-react";

export function PrintSlotBackUpload({
  preview,
  onFile,
  onClear,
}: {
  preview: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => ref.current?.click()}
        className="flex items-center gap-1.5 rounded-md border border-border px-2 py-1 text-[10px] text-[var(--text2)] hover:bg-[var(--panel2)] hover:text-foreground"
      >
        <ImageUp className="h-3 w-3" />
        {preview ? "Trocar verso" : "Anexar verso"}
      </button>
      {preview && (
        <>
          <img src={preview} alt="Verso anexado" className="h-6 w-[17px] rounded-sm object-cover" />
          <button
            type="button"
            onClick={onClear}
            title="Remover verso anexado"
            className="text-[var(--text3)] hover:text-destructive"
          >
            <X className="h-3 w-3" />
          </button>
        </>
      )}
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
          e.target.value = "";
        }}
      />
    </div>
  );
}
