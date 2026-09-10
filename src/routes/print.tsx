import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { FileDown, Loader2, Trash2 } from "lucide-react";
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
    ],
  }),
  component: PrintPage,
});

function PrintPage() {
  const print = usePrint();
  const { data: cards } = useCardLibrary();
  const [exporting, setExporting] = useState(false);

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
      const front = document.createElement("canvas");
      const back = document.createElement("canvas");
      await paintSheet(front, print.slots, print.layout, "front", scale);
      await paintSheet(back, print.slots, print.layout, "back", scale);

      const pdf = new jsPDF({ unit: "mm", format: "a4", orientation: "portrait" });
      pdf.addImage(front.toDataURL("image/jpeg", 0.94), "JPEG", 0, 0, A4.w, A4.h);
      pdf.addPage();
      pdf.addImage(back.toDataURL("image/jpeg", 0.94), "JPEG", 0, 0, A4.w, A4.h);
      pdf.setFontSize(7);
      pdf.setTextColor(120);
      pdf.text("Imprimir em duplex, virar pela borda longa. Escala 100% (sem ajuste).", 8, 292);
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

        <div className="mb-3 flex items-center justify-between">
          <span className="section-title">Slots</span>
          <button
            onClick={print.clearAll}
            className="flex items-center gap-1 text-[10px] text-[var(--text3)] hover:text-destructive"
          >
            <Trash2 className="h-3 w-3" /> Limpar tudo
          </button>
        </div>

        <PrintSlots
          slots={print.slots}
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
              if (card && !print.addCard(card)) toast.error("A folha está cheia");
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
            Exportar PDF (frente e verso)
          </Button>
          <p className="text-[10px] text-[var(--text3)]">
            Imprimir em duplex, virar pela borda longa, escala 100%.
          </p>
        </div>
      </aside>

      <div className="h-full flex-1 overflow-y-auto bg-[#0e1119] p-6">
        <div className="flex flex-wrap gap-8">
          <PrintPreview
            slots={print.slots}
            layout={print.layout}
            side="front"
            label="Página — frente"
          />
          <PrintPreview
            slots={print.slots}
            layout={print.layout}
            side="back"
            label="Página — verso (espelhado por coluna)"
          />
        </div>
      </div>
    </div>
  );
}
