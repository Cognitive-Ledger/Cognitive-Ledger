import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface LiveStream {
  id: string;
  title: string;
  description: string;
  stream_url: string | null;
  thumbnail_url: string | null;
  scheduled_at: string;
  is_live: boolean | null;
  is_premium: boolean | null;
  viewers_count: number | null;
}

export function useLiveStreams() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [hasNotified, setHasNotified] = useState<Set<string>>(new Set());

  const query = useQuery({
    queryKey: ["liveStreams"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_streams")
        .select("*")
        .order("scheduled_at", { ascending: true });
      
      if (error) throw error;
      return data as LiveStream[];
    },
  });

  // Subscribe to realtime updates
  useEffect(() => {
    const channel = supabase
      .channel("live-streams-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_streams",
        },
        (payload) => {
          console.log("Live stream update:", payload);
          
          // Invalidate cache to refetch
          queryClient.invalidateQueries({ queryKey: ["liveStreams"] });
          
          // Show notification when a stream goes live
          if (payload.eventType === "UPDATE") {
            const newData = payload.new as LiveStream;
            const oldData = payload.old as LiveStream;
            
            if (newData.is_live && !oldData.is_live && !hasNotified.has(newData.id)) {
              setHasNotified(prev => new Set([...prev, newData.id]));
              toast({
                title: "🔴 Stream is now live!",
                description: newData.title,
              });
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, toast, hasNotified]);

  return query;
}

export function useViewerCount(streamId: string) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!streamId) return;

    // Note: Viewer count could be tracked via presence or a custom RPC function
    // For now, we just subscribe to updates

    // Subscribe to viewer count updates
    const channel = supabase
      .channel(`viewer-count-${streamId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "live_streams",
          filter: `id=eq.${streamId}`,
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["liveStreams"] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId, queryClient]);
}
