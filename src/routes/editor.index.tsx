import { createFileRoute } from "@tanstack/react-router";
import { CardEditorLayout } from "@/components/card-editor/CardEditorLayout";

export const Route = createFileRoute("/editor/")({
  head: () => ({
    meta: [
      { title: "Editor de cartas — SquareZone Card Generator" },
      {
        name: "description",
        content: "Crie uma nova carta do SquareZone com arte, texturas, bordas e efeitos.",
      },
      { property: "og:title", content: "Editor de cartas — SquareZone" },
      {
        property: "og:description",
        content: "Crie uma nova carta do SquareZone com arte, texturas, bordas e efeitos.",
      },
    ],
  }),
  component: NewCardEditor,
});

function NewCardEditor() {
  return <CardEditorLayout />;
}
