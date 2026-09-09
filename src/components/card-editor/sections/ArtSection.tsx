import { useCallback, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Field, Pills, Section } from "../Section";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { useArtUpload } from "@/hooks/useArtUpload";
import type { ArtFit } from "@/types/card";
import type { SectionProps } from "./types";

interface Props extends SectionProps {
  artName: string | null;
  onFile: (file: File) => void;
  onClear: () => void;
}

export function ArtSection({ card, update, artName, onFile, onClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handle = useCallback((f: File) => onFile(f), [onFile]);
  const { dragging, onDrop, onDragOver, onDragLeave } = useArtUpload(handle);

  return (
    <Section title="Arte da carta">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={() => inputRef.current?.click()}
        className={`cursor-pointer rounded-md border border-dashed px-3 py-5 text-center transition-colors ${
          dragging ? "border-primary bg-[var(--panel2)]" : "border-[var(--border2)]"
        }`}
      >
        <Upload className="mx-auto mb-2 h-4 w-4 text-[var(--text3)]" />
        <p className="text-[11px] text-[var(--text2)]">↑ Carregar imagem da arte</p>
        <p className="text-[10px] text-[var(--text3)]">ou cole com Ctrl+V / arraste aqui</p>
        <input
          ref={inputRef}
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
      {(artName || card.art_url) && (
        <div className="flex items-center gap-2 rounded-md bg-[var(--inp)] px-2 py-1.5">
          <span className="flex-1 truncate text-[11px] text-[var(--text2)]">
            {artName ?? "Arte salva"}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 px-2 text-[11px]"
            onClick={onClear}
          >
            <X className="mr-1 h-3 w-3" /> Remover
          </Button>
        </div>
      )}
      <Field label="Ajuste">
        <Pills<ArtFit>
          value={card.art_fit}
          onChange={(v) => update("art_fit", v)}
          options={[
            { value: "cover", label: "Cobrir" },
            { value: "contain", label: "Conter" },
          ]}
        />
      </Field>
      <Field label={`Posição horizontal — ${card.art_x}`}>
        <Slider
          value={[card.art_x]}
          min={0}
          max={100}
          step={1}
          onValueChange={([v]) => update("art_x", v ?? 50)}
        />
      </Field>
      <Field label={`Posição vertical — ${card.art_y}`}>
        <Slider
          value={[card.art_y]}
          min={0}
          max={100}
          step={1}
          onValueChange={([v]) => update("art_y", v ?? 50)}
        />
      </Field>
      <Field label={`Zoom — ${card.art_zoom}%`}>
        <Slider
          value={[card.art_zoom]}
          min={50}
          max={250}
          step={1}
          onValueChange={([v]) => update("art_zoom", v ?? 100)}
        />
      </Field>
    </Section>
  );
}
