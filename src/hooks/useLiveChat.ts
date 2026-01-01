import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

interface ChatMessage {
  id: string;
  stream_id: string;
  user_id: string | null;
  user_name: string;
  message: string;
  created_at: string;
}

export function useLiveChat(streamId: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch initial messages
  useEffect(() => {
    if (!streamId) {
      setMessages([]);
      setIsLoading(false);
      return;
    }

    const fetchMessages = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("live_stream_messages")
        .select("*")
        .eq("stream_id", streamId)
        .order("created_at", { ascending: true })
        .limit(100);

      if (error) {
        console.error("Error fetching messages:", error);
      } else {
        setMessages(data || []);
      }
      setIsLoading(false);
    };

    fetchMessages();
  }, [streamId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!streamId) return;

    const channel = supabase
      .channel(`live-chat-${streamId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_stream_messages",
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          const newMessage = payload.new as ChatMessage;
          setMessages((prev) => [...prev, newMessage]);
        }
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "live_stream_messages",
          filter: `stream_id=eq.${streamId}`,
        },
        (payload) => {
          const deletedId = (payload.old as { id: string }).id;
          setMessages((prev) => prev.filter((msg) => msg.id !== deletedId));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [streamId]);

  const sendMessage = async (message: string) => {
    if (!streamId || !message.trim()) return false;

    if (!user) {
      toast({
        title: "Sign in required",
        description: "Please sign in to send messages",
        variant: "destructive",
      });
      return false;
    }

    const { error } = await supabase.from("live_stream_messages").insert({
      stream_id: streamId,
      user_id: user.id,
      user_name: user.email?.split("@")[0] || "Anonymous",
      message: message.trim(),
    });

    if (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
      return false;
    }

    return true;
  };

  return { messages, isLoading, sendMessage };
}
