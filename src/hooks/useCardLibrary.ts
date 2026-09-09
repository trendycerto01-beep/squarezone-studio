import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { CardState } from "@/types/card";
import { removeStoredFile } from "@/lib/supabaseStorage";

export const cardsQueryOptions = {
  queryKey: ["cards"],
  queryFn: async (): Promise<CardState[]> => {
    const { data, error } = await supabase
      .from("cards")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []) as unknown as CardState[];
  },
};

export function useCardLibrary() {
  const qc = useQueryClient();
  const query = useQuery(cardsQueryOptions);

  const remove = useMutation({
    mutationFn: async (card: CardState) => {
      await removeStoredFile(card.art_url);
      await removeStoredFile(card.thumbnail_url);
      const { error } = await supabase.from("cards").delete().eq("id", card.id!);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });

  const duplicate = useMutation({
    mutationFn: async (card: CardState) => {
      const copy = { ...card };
      delete copy.id;
      delete copy.created_at;
      delete copy.updated_at;
      copy.name = `${card.name} (cópia)`;
      const { error } = await supabase.from("cards").insert(copy as never);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cards"] }),
  });

  return { ...query, remove, duplicate };
}
