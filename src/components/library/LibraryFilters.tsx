import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CARD_TYPE_LIST } from "@/lib/cardTypes";
import { RARITY_LIST } from "@/lib/rarityConfig";

export type SortId = "new" | "old" | "name";

export interface Filters {
  q: string;
  type: string;
  rarity: string;
  sort: SortId;
}

export function LibraryFilters({
  filters,
  onChange,
}: {
  filters: Filters;
  onChange: (f: Filters) => void;
}) {
  const select =
    "h-9 rounded-md border border-white/10 bg-[var(--inp)] px-2 text-xs text-foreground outline-none focus:border-primary";
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative min-w-[220px] flex-1">
        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[var(--text3)]" />
        <Input
          value={filters.q}
          onChange={(e) => onChange({ ...filters, q: e.target.value })}
          placeholder="Buscar por nome…"
          className="h-9 pl-8 text-xs"
        />
      </div>
      <select
        className={select}
        value={filters.type}
        onChange={(e) => onChange({ ...filters, type: e.target.value })}
      >
        <option value="all">Todos os tipos</option>
        {CARD_TYPE_LIST.map((t) => (
          <option key={t.id} value={t.id}>
            {t.label}
          </option>
        ))}
      </select>
      <select
        className={select}
        value={filters.rarity}
        onChange={(e) => onChange({ ...filters, rarity: e.target.value })}
      >
        <option value="all">Todas as raridades</option>
        {RARITY_LIST.map((r) => (
          <option key={r.id} value={r.id}>
            {r.label}
          </option>
        ))}
      </select>
      <select
        className={select}
        value={filters.sort}
        onChange={(e) => onChange({ ...filters, sort: e.target.value as SortId })}
      >
        <option value="new">Mais novas</option>
        <option value="old">Mais antigas</option>
        <option value="name">Nome A–Z</option>
      </select>
    </div>
  );
}
