import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  version: string;
  release_date: string;
  description: string;
  parameters: string | null;
  context_window: string | null;
  pricing: string | null;
  category: string;
  benchmarks: Record<string, number> | null;
}

export function useModels() {
  return useQuery({
    queryKey: ["ai-models"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ai_models")
        .select("*")
        .order("release_date", { ascending: false });

      if (error) throw error;
      return data as AIModel[];
    },
  });
}
