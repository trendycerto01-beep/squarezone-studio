import { createFileRoute } from "@tanstack/react-router";
import { CardEditorLayout } from "@/components/card-editor/CardEditorLayout";

export const Route = createFileRoute("/editor/$id")({
  head: () => ({
    meta: [
      { title: "Editar carta — SquareZone Card Generator" },
      {
        name: "description",
        content: "Edite uma carta salva do SquareZone e exporte em alta resolução.",
      },
      { property: "og:title", content: "Editar carta — SquareZone" },
      {
        property: "og:description",
        content: "Edite uma carta salva do SquareZone e exporte em alta resolução.",
      },
    ],
  }),
  component: EditCard,
});

function EditCard() {
  const { id } = Route.useParams();
  return <CardEditorLayout cardId={id} />;
}
