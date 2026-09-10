import { useCallback, useRef } from "react";
import { Upload, X } from "lucide-react";
import { Field, Pills, Section } from "../Section";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useIconUpload } from "@/hooks/useIconUpload";
import type { SectionProps } from "./types";

interface Props extends SectionProps {
  iconName: string | null;
  onIconFile: (file: File) => void;
  onIconClear: () => void;
}

export function CostSection({ card, update, iconName, onIconFile, onIconClear }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const handle = useCallback((f: File) => onIconFile(f), [onIconFile]);
  const { dragging, onDrop, onDragOver, onDragLeave, onMouseEnter, onMouseLeave } =
    useIconUpload(handle);

  return (
    <Section title="Ícone de custo">
      <Field label="Ícones">
        <Pills<number>
          value={card.cost_icon}
          onChange={(v) => update("cost_icon", v)}
          options={[
            { value: 0, label: "Nenhum" },
            { value: 1, label: "×1" },
            { value: 2, label: "×2" },
          ]}
        />
      </Field>
      <Field label="Número do custo">
        <Input
          value={card.cost_number}
          maxLength={3}
          placeholder="1–9"
          onChange={(e) => update("cost_number", e.target.value)}
        />
      </Field>
      <Field label="Imagem do ícone">
        <div
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          onClick={() => inputRef.current?.click()}
          className={`cursor-pointer rounded-md border border-dashed px-3 py-4 text-center transition-colors ${
            dragging ? "border-primary bg-[var(--panel2)]" : "border-[var(--border2)]"
          }`}
        >
          <Upload className="mx-auto mb-2 h-4 w-4 text-[var(--text3)]" />
          <p className="text-[11px] text-[var(--text2)]">↑ Carregar imagem do ícone</p>
          <p className="text-[10px] text-[var(--text3)]">ou cole com Ctrl+V / arraste aqui</p>
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onIconFile(f);
              e.target.value = "";
            }}
          />
        </div>
        {(iconName || card.cost_icon_url) && (
          <div className="mt-2 flex items-center gap-2 rounded-md bg-[var(--inp)] px-2 py-1.5">
            <span className="flex-1 truncate text-[11px] text-[var(--text2)]">
              {iconName ?? "Ícone salvo"}
            </span>
            <Button variant="ghost" size="sm" className="h-6 px-2 text-[11px]" onClick={onIconClear}>
              <X className="mr-1 h-3 w-3" /> Remover
            </Button>
          </div>
        )}
        <p className="mt-1 text-[10px] text-[var(--text3)]">
          Se nenhuma imagem for anexada, o ícone padrão é usado. Prefira imagens quadradas.
        </p>
      </Field>
    </Section>
  );
}
