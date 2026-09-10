import { Check, Download, Loader2, RotateCcw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Section } from "../Section";

export function ActionsSection({
  saving,
  dirty,
  savedRecently,
  onSave,
  onExport,
  onReset,
}: {
  saving: boolean;
  dirty: boolean;
  savedRecently: boolean;
  onSave: () => void;
  onExport: () => void;
  onReset: () => void;
}) {
  return (
    <Section title="Ações">
      <Button className="relative w-full" onClick={onSave} disabled={saving}>
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : savedRecently ? (
          <Check className="mr-2 h-4 w-4" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        Salvar carta
        {dirty && !saving && (
          <span className="absolute right-3 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full bg-[var(--accent2)]" />
        )}
      </Button>
      <Button variant="secondary" className="w-full" onClick={onExport}>
        <Download className="mr-2 h-4 w-4" /> Baixar PNG
      </Button>
      <Button variant="ghost" className="w-full text-[var(--text2)]" onClick={onReset}>
        <RotateCcw className="mr-2 h-4 w-4" /> Restaurar padrão
      </Button>
    </Section>
  );
}
