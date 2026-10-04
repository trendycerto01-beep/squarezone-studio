import { useEffect, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileDown, Loader2, Plus, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PrintSlots } from "@/components/print/PrintSlots";
import { PrintPreview, paintSheet } from "@/components/print/PrintPreview";
import { usePrint } from "@/hooks/usePrint";
import { useCardLibrary } from "@/hooks/useCardLibrary";
import { A4, LAYOUTS, type LayoutId } from "@/lib/printLayout";

export const Route = createFileRoute("/print")({
  head: () => ({
    meta: [
      { title: "Impressão em A4 — SquareZone Card Generator" },
      {
        name: "description",
        content:
          "Monte folhas A4 com sangria e marcas de corte, com frente e verso alinhados para impressão duplex.",
      },
      { property: "og:title", content: "Impressão em A4 — SquareZone" },
      {
        property: "og:description",
        content: "Folhas A4 com sangria, marcas de corte e verso espelhado para duplex.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: PrintPage,
});

function PrintPage() {
  const print = usePrint();
  const { data: cards } = useCardLibrary();
  const [exporting, setExporting] = useState(false);
  const [sheet, setSheet] = useState(0);

  const active = Math.min(sheet, print.sheetCount - 1);
  useEffect(() => {
    if (sheet > print.sheetCount - 1) setSheet(print.sheetCount - 1);
  }, [sheet, print.sheetCount]);

  const offset = active * print.capacity;
  const activeSlots = print.sheets[active] ?? [];

  const handleDropCard = (index: number, cardId: string) => {
    const card = cards?.find((c) => c.id === cardId);
    if (card) print.setSlot(index, { card });
  };

  const handleBackFile = (index: number, file: File) => {
    print.setSlot(index, { backFile: file, backPreview: URL.createObjectURL(file) });
  };

  const exportPdf = async () => {
    if (!print.slots.some((s) => s.card)) {
      toast.error("Adicione pelo menos uma carta à folha");
      return;
    }
    setExporting(true);
    try {
      const { jsPDF } = await import("jspdf");
      const scale = 8; // px per mm ≈ 203 dpi
      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      const canvas = document.createElement("canvas");
      let first = true;

      for (const sheetSlots of print.sheets) {
        if (!sheetSlots.some((s) => s.card)) continue;
        for (const side of ["front", "back"] as const) {
          if (!first) pdf.addPage();
          first = false;
          await paintSheet(canvas, sheetSlots, print.layout, side, scale);
          pdf.addImage(canvas.toDataURL("image/jpeg", 0.94), "JPEG", 0, 0, A4.w, A4.h);
          pdf.setFontSize(7);
          pdf.setTextColor(120);
          pdf.text(
            "Imprimir em duplex, virar pela borda longa. Escala 100% (sem ajuste).",
            8,
            292,
          );
        }
      }

      pdf.save("squarezone-folha.pdf");
      toast.success("PDF gerado");
    } catch (e) {
      toast.error(`Falha ao gerar PDF: ${(e as Error).message}`);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="flex h-full">
      <aside className="panel-scroll h-full w-[360px] shrink-0 overflow-y-auto border-r border-border bg-[var(--panel)] p-4">
        <h1 className="mb-1 text-sm font-semibold">Preparação de impressão</h1>
        <p className="mb-4 text-[11px] text-[var(--text2)]">
          Cartas 63,5 × 88 mm · sangria 3 mm · marcas de corte 3 mm além da sangria.
        </p>

        <div className="mb-4 space-y-1.5">
          <div className="ui-label">Layout da folha</div>
          <div className="flex gap-1 rounded-full bg-[var(--inp)] p-1">
            {(Object.keys(LAYOUTS) as LayoutId[]).map((id) => (
              <button
                key={id}
                type="button"
                onClick={() => print.setLayout(id)}
                className={`flex-1 rounded-full px-2 py-1 text-[11px] ${
                  print.layoutId === id
                    ? "bg-primary text-primary-foreground"
                    : "text-[var(--text2)] hover:text-foreground"
                }`}
              >
                {LAYOUTS[id].label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-4 space-y-1.5">
          <div className="ui-label">Folhas</div>
          <div className="flex flex-wrap items-center gap-1">
            {print.sheets.map((s, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setSheet(i)}
                className={`group flex items-center gap-1 rounded-md px-2 py-1 text-[11px] ${
                  i === active
                    ? "bg-primary text-primary-foreground"
                    : "bg-[var(--inp)] text-[var(--text2)] hover:text-foreground"
                }`}
              >
                Folha {i + 1}
                <span className="opacity-60">({s.filter((x) => x.card).length})</span>
                {print.sheetCount > 1 && (
                  <X
                    className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100"
                    onClick={(e) => {
                      e.stopPropagation();
                      print.removeSheet(i);
                    }}
                  />
                )}
              </button>
            ))}
            <button
              type="button"
              onClick={print.addSheet}
              title="Adicionar folha"
              className="grid h-6 w-6 place-items-center rounded-md bg-[var(--inp)] text-[var(--text2)] hover:text-foreground"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <div className="mb-3 flex items-center justify-between">
          <span className="section-title">Slots — folha {active + 1}</span>
          <button
            onClick={() => {
              print.clearAll();
              setSheet(0);
            }}
            className="flex items-center gap-1 text-[10px] text-[var(--text3)] hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" /> Limpar tudo
          </button>
        </div>

        <PrintSlots
          slots={activeSlots}
          startIndex={offset}
          onDropCard={handleDropCard}
          onClear={print.clearSlot}
          onRepeat={(i) => {
            if (!print.repeatToNext(i)) toast.error("Não há slot vazio depois deste");
          }}
          onBackFile={handleBackFile}
          onBackClear={(i) => print.setSlot(i, { backFile: null, backPreview: null })}
          canRepeat={(i) => print.nextEmptyAfter(i) >= 0}
        />

        <div className="mt-4 space-y-2">
          <div className="ui-label">Adicionar carta da biblioteca</div>
          <select
            className="h-9 w-full rounded-md border border-white/10 bg-[var(--inp)] px-2 text-xs"
            defaultValue=""
            onChange={(e) => {
              const card = cards?.find((c) => c.id === e.target.value);
              if (card) print.addCard(card);
              e.target.value = "";
            }}
          >
            <option value="">Selecionar…</option>
            {(cards ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          <Button className="w-full" onClick={exportPdf} disabled={exporting}>
            {exporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Exportar PDF (todas as folhas)
          </Button>
          <p className="text-[10px] text-[var(--text3)]">
            Imprimir em duplex, virar pela borda longa, escala 100%.
          </p>
        </div>
      </aside>

      <div className="h-full flex-1 overflow-y-auto bg-[#0e1119] p-6">
        <div className="flex flex-wrap gap-8">
          <PrintPreview
            slots={activeSlots}
            layout={print.layout}
            side="front"
            label={`Folha ${active + 1} — frente`}
          />
          <PrintPreview
            slots={activeSlots}
            layout={print.layout}
            side="back"
            label={`Folha ${active + 1} — verso (espelhado por coluna)`}
          />
        </div>
      </div>
    </div>
  );
}
