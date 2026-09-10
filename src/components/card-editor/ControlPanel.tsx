import type { CardState } from "@/types/card";
import { CardTypeSection } from "./sections/CardTypeSection";
import { TextSection } from "./sections/TextSection";
import { ArtSection } from "./sections/ArtSection";
import { CostSection } from "./sections/CostSection";
import { IdentitySection } from "./sections/IdentitySection";
import { TypographySection } from "./sections/TypographySection";
import { ColorSection } from "./sections/ColorSection";
import { TextureSection } from "./sections/TextureSection";
import { BorderSection } from "./sections/BorderSection";
import { ActionsSection } from "./sections/ActionsSection";

export interface ControlPanelProps {
  card: CardState;
  update: <K extends keyof CardState>(key: K, value: CardState[K]) => void;
  artName: string | null;
  onFile: (file: File) => void;
  onClearArt: () => void;
  saving: boolean;
  dirty: boolean;
  savedRecently: boolean;
  onSave: () => void;
  onExport: () => void;
  onReset: () => void;
}

export function ControlPanel(props: ControlPanelProps) {
  const { card, update } = props;
  return (
    <aside className="panel-scroll h-full w-[320px] shrink-0 overflow-y-auto border-r border-border bg-[var(--panel)]">
      <CardTypeSection card={card} update={update} />
      <TextSection card={card} update={update} />
      <ArtSection
        card={card}
        update={update}
        artName={props.artName}
        onFile={props.onFile}
        onClear={props.onClearArt}
      />
      <CostSection card={card} update={update} />
      <IdentitySection card={card} update={update} />
      <TypographySection card={card} update={update} />
      <ColorSection card={card} update={update} />
      <TextureSection card={card} update={update} />
      <BorderSection card={card} update={update} />
      <ActionsSection
        saving={props.saving}
        dirty={props.dirty}
        savedRecently={props.savedRecently}
        onSave={props.onSave}
        onExport={props.onExport}
        onReset={props.onReset}
      />
    </aside>
  );
}
