import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { CARD_TYPE_LIST } from "@/lib/cardTypes";
import { defaultBackPath, resolveDefaultBack, uploadDefaultBack } from "@/lib/defaultBacks";
import { useIconUpload } from "@/hooks/useIconUpload";
import type { CardType } from "@/types/card";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Preferências — SquareZone Card Generator" },
      {
        name: "description",
        content:
          "Defina os versos padrão de cada tipo de carta do SquareZone, usados automaticamente na impressão.",
      },
      { property: "og:title", content: "Preferências — SquareZone" },
      {
        property: "og:description",
        content: "Versos padrão por tipo de carta, usados quando não há verso personalizado.",
      },
    ],
  }),
  component: SettingsPage,
});

function BackCard({ type, label, note }: { type: CardType; label: string; note: string }) {
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let cancelled = false;
    void resolveDefaultBack(type).then((url) => {
      if (!cancelled) setPreview(url);
    });
    return () => {
      cancelled = true;
    };
  }, [type]);

  const handle = useCallback(
    async (file: File) => {
      setBusy(true);
      try {
        await uploadDefaultBack(type, file);
        setPreview(URL.createObjectURL(file));
        toast.success(`Verso padrão de ${label} atualizado`);
      } catch (e) {
        toast.error(`Falha no envio: ${(e as Error).message}`);
      } finally {
        setBusy(false);
      }
    },
    [type, label],
  );

  const onImage = useCallback((f: File) => void handle(f), [handle]);
  const { dragging, onDrop, onDragOver, onDragLeave, onMouseEnter, onMouseLeave } =
    useIconUpload(onImage);

  return (
    <div className="rounded-lg border border-border bg-[var(--panel)] p-3">
      <div className="mb-1 text-xs font-semibold">{label}</div>
      <div className="mb-2 text-[10px] text-[var(--text3)]">{note}</div>
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        onClick={() => inputRef.current?.click()}
        className={`flex cursor-pointer flex-col items-center gap-2 rounded-md border border-dashed px-3 py-4 text-center transition-colors ${
          dragging ? "border-primary bg-[var(--panel2)]" : "border-[var(--border2)]"
        }`}
      >
        <div className="grid h-[124px] w-[89px] place-items-center overflow-hidden rounded-md bg-[var(--inp)]">
          {busy ? (
            <Loader2 className="h-4 w-4 animate-spin text-[var(--text3)]" />
          ) : preview ? (
            <img
              src={preview}
              alt={`Verso padrão de ${label}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <span className="px-2 text-[10px] text-[var(--text3)]">Sem verso padrão</span>
          )}
        </div>
        <p className="text-[11px] text-[var(--text2)]">
          {preview ? "Trocar verso padrão" : "Carregar verso padrão"}
        </p>
        <p className="text-[10px] text-[var(--text3)]">clique, arraste ou cole com Ctrl+V</p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onImage(f);
            e.target.value = "";
          }}
        />
      </div>
      <div className="mt-2 truncate text-[10px] text-[var(--text3)]">{defaultBackPath(type)}</div>
    </div>
  );
}

function SettingsPage() {
  return (
    <div className="panel-scroll h-full overflow-y-auto p-6">
      <h1 className="text-sm font-semibold">Preferências</h1>
      <p className="mt-1 text-[11px] text-[var(--text2)]">
        Configurações permanentes do gerador de cartas.
      </p>

      <section className="mt-6 max-w-5xl">
        <div className="section-title">Versos padrão por tipo de carta</div>
        <p className="mb-3 mt-1 text-[11px] text-[var(--text2)]">
          Cada tipo usa automaticamente o seu verso padrão na impressão. Se um slot tiver um verso
          anexado manualmente, o verso anexado tem prioridade.
        </p>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {CARD_TYPE_LIST.map((t) => (
            <BackCard key={t.id} type={t.id} label={t.label} note={t.note} />
          ))}
        </div>
      </section>
    </div>
  );
}
