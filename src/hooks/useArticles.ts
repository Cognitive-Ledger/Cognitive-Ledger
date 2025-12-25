import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

export interface Article {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  simple_content: string | null;
  technical_content: string | null;
  category: string;
  author: string;
  image_url: string | null;
  video_url: string | null;
  reading_time: number;
  is_breaking: boolean;
  is_featured: boolean;
  business_impact: string | null;
  technical_impact: string | null;
  ethical_risk: string | null;
  published_at: string;
  embeds: Json | null;
  status?: string;
  scheduled_for?: string | null;
}

export function useArticles() {
  return useQuery({
    queryKey: ["articles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("articles")
        .select("*")
        .order("published_at", { ascending: false });

      if (error) throw error;
      return data as Article[];
    },
  });
}

export function useArticle(slugOrId: string, options?: { enabled?: boolean }) {
  return useQuery({
    queryKey: ["article", slugOrId],
    queryFn: async () => {
      // Try to find by slug first
      let { data, error } = await supabase
        .from("articles")
        .select("*")
        .eq("slug", slugOrId)
        .maybeSingle();

      // If not found by slug, try by ID
      if (!data && !error) {
        const result = await supabase
          .from("articles")
          .select("*")
          .eq("id", slugOrId)
          .maybeSingle();
        data = result.data;
        error = result.error;
      }

      if (error) throw error;
      return data as Article | null;
    },
    enabled: options?.enabled !== false && !!slugOrId,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (article: Record<string, unknown>) => {
      const { data, error } = await supabase
        .from("articles")
        .insert(article as never)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...article }: { id: string } & Record<string, unknown>) => {
      const { data, error } = await supabase
        .from("articles")
        .update(article as never)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("articles")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
    },
  });
}

export function useBreakingNews() {
  return useQuery({
    queryKey: ["breaking-news"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("breaking_news")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });
}

export function useDailyBrief() {
  return useQuery({
    queryKey: ["daily-brief"],
    queryFn: async () => {
      const today = new Date().toISOString().split("T")[0];
      const { data, error } = await supabase
        .from("daily_brief_items")
        .select("*")
        .eq("brief_date", today)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return data;
    },
  });
}
