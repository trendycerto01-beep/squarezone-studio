import { useMemo, useRef, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { CheckSquare, Plus, Printer, Sparkles, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { CardGrid } from "@/components/library/CardGrid";
import { LibraryFilters, type Filters } from "@/components/library/LibraryFilters";
import { useCardLibrary } from "@/hooks/useCardLibrary";
import { downloadCardPng } from "@/lib/canvas/renderOffscreen";
import { addCardToQueue, appendCardsToQueue } from "@/lib/printStore";
import type { CardState } from "@/types/card";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Biblioteca de cartas — SquareZone Card Generator" },
      {
        name: "description",
        content:
          "Biblioteca completa das cartas do SquareZone: busque, filtre, duplique, exporte e envie para impressão.",
      },
      { property: "og:title", content: "Biblioteca de cartas — SquareZone" },
      {
        property: "og:description",
        content: "Busque, filtre, duplique, exporte e imprima as cartas do SquareZone.",
      },
    ],
  }),
  component: LibraryPage,
});

function LibraryPage() {
  const { data, isLoading, remove, duplicate } = useCardLibrary();
  const [filters, setFilters] = useState<Filters>({
    q: "",
    type: "all",
    rarity: "all",
    sort: "new",
  });

  const cards = useMemo(() => {
    let list = [...(data ?? [])];
    if (filters.q.trim())
      list = list.filter((c) => c.name.toLowerCase().includes(filters.q.trim().toLowerCase()));
    if (filters.type !== "all") list = list.filter((c) => c.card_type === filters.type);
    if (filters.rarity !== "all") list = list.filter((c) => c.rarity === filters.rarity);
    list.sort((a, b) => {
      if (filters.sort === "name") return a.name.localeCompare(b.name);
      const at = new Date(a.created_at ?? 0).getTime();
      const bt = new Date(b.created_at ?? 0).getTime();
      return filters.sort === "old" ? at - bt : bt - at;
    });
    return list;
  }, [data, filters]);

  const handleQueue = (card: CardState) => {
    if (addCardToQueue(card)) toast.success(`${card.name} entrou na fila de impressão`);
    else toast.error("A folha atual está cheia — abra a página de impressão");
  };

  const [selectionMode, setSelectionMode] = useState(false);
  const [selection, setSelection] = useState<Record<string, number>>({});
  const sendingRef = useRef(false);
  const [sending, setSending] = useState(false);
  const navigate = useNavigate();

  const selectedIds = Object.keys(selection);
  const totalCopies = selectedIds.reduce((sum, id) => sum + (selection[id] ?? 1), 0);

  const clearSelection = () => setSelection({});

  const exitSelection = () => {
    setSelectionMode(false);
    clearSelection();
  };

  const toggleSelect = (card: CardState) => {
    if (!card.id) return;
    setSelection((prev) => {
      const next = { ...prev };
      if (next[card.id!] !== undefined) delete next[card.id!];
      else next[card.id!] = 1;
      return next;
    });
  };

  const setQuantity = (card: CardState, qty: number) => {
    if (!card.id) return;
    const safe = Number.isFinite(qty) ? Math.min(99, Math.max(1, Math.floor(qty))) : 1;
    setSelection((prev) => (prev[card.id!] === undefined ? prev : { ...prev, [card.id!]: safe }));
  };

  const selectAllOfType = (list: CardState[]) => {
    const ids = list.map((c) => c.id).filter(Boolean) as string[];
    const allSelected = ids.every((id) => selection[id] !== undefined);
    setSelection((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        if (allSelected) delete next[id];
        else if (next[id] === undefined) next[id] = 1;
      }
      return next;
    });
  };

  const sendToPrint = () => {
    if (sendingRef.current) return;
    if (!selectedIds.length) return;
    sendingRef.current = true;
    setSending(true);
    try {
      const occurrences: CardState[] = [];
      for (const id of selectedIds) {
        const card = (data ?? []).find((c) => c.id === id);
        if (!card) continue;
        const qty = Math.min(99, Math.max(1, Math.floor(selection[id] ?? 1)));
        for (let i = 0; i < qty; i++) occurrences.push(card);
      }
      if (!occurrences.length) {
        toast.error("Nenhuma carta válida para enviar");
        return;
      }
      const added = appendCardsToQueue(occurrences);
      toast.success(`${added} carta(s) enviada(s) para a impressão`);
      exitSelection();
      void navigate({ to: "/print" });
    } catch (e) {
      toast.error(`Falha ao enviar: ${(e as Error).message}`);
    } finally {
      sendingRef.current = false;
      setSending(false);
    }
  };

  const handleDelete = (card: CardState) => {
    if (!confirm(`Excluir a carta "${card.name}"?`)) return;
    remove.mutate(card, {
      onSuccess: () => toast.success("Carta excluída"),
      onError: (e) => toast.error((e as Error).message),
    });
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1400px] px-6 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-[var(--font-display)] text-xl font-semibold">
              Biblioteca de cartas
            </h1>
            <p className="text-xs text-[var(--text2)]">
              {data?.length ?? 0} carta(s) no baralho do SquareZone
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant={selectionMode ? "secondary" : "outline"}
              onClick={() => (selectionMode ? exitSelection() : setSelectionMode(true))}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              {selectionMode ? "Sair da seleção" : "Selecionar"}
            </Button>
            <Button asChild>
              <Link to="/editor">
                <Plus className="mr-2 h-4 w-4" /> Nova carta
              </Link>
            </Button>
          </div>
        </div>

        <div className="mb-6">
          <LibraryFilters filters={filters} onChange={setFilters} />
        </div>

        {isLoading ? (
          <p className="text-xs text-[var(--text2)]">Carregando…</p>
        ) : cards.length === 0 ? (
          <div className="grid place-items-center rounded-xl border border-dashed border-[var(--border2)] px-6 py-20 text-center">
            <Sparkles className="mb-3 h-6 w-6 text-[var(--text3)]" />
            <h2 className="text-sm font-medium">Nenhuma carta por aqui ainda</h2>
            <p className="mb-4 max-w-sm text-xs text-[var(--text2)]">
              Monte seu primeiro Feitiço, Evento ou par de Coordenadas e ele aparecerá nesta
              biblioteca.
            </p>
            <Button asChild>
              <Link to="/editor">Criar primeira carta</Link>
            </Button>
          </div>
        ) : (
          <CardGrid
            cards={cards}
            onDuplicate={(c) =>
              duplicate.mutate(c, {
                onSuccess: () => toast.success("Carta duplicada"),
                onError: (e) => toast.error((e as Error).message),
              })
            }
            onDelete={handleDelete}
            onExport={(c) => void downloadCardPng(c)}
            onQueue={handleQueue}
          />
        )}
      </div>
    </div>
  );
}
