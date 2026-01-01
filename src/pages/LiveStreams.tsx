import { useState, useEffect } from "react";
import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  Radio, 
  Calendar, 
  Clock, 
  Users, 
  Bell,
  Lock,
  MessageCircle,
  Send,
  Video,
  LogIn
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { VideoPlayer } from "@/components/video/VideoPlayer";
import { useLiveChat } from "@/hooks/useLiveChat";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "react-router-dom";

interface LiveStream {
  id: string;
  title: string;
  description: string;
  stream_url: string | null;
  thumbnail_url: string | null;
  scheduled_at: string;
  is_live: boolean;
  is_premium: boolean;
  viewers_count: number;
  playback_url: string | null;
  stream_key: string | null;
}

function formatScheduledTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  
  if (diff < 0) {
    return "Live Now";
  }
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  
  if (days > 0) {
    return `In ${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `In ${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return "Starting soon";
}

export default function LiveStreams() {
  const [selectedStream, setSelectedStream] = useState<LiveStream | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const { user } = useAuth();

  const { data: liveStreams, isLoading } = useQuery({
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

  // Sample data for display when no streams exist
  const sampleStreams: LiveStream[] = [
    {
      id: "1",
      title: "AI News Weekly: GPT-5 Rumors & Gemini 3 Analysis",
      description: "Join us for our weekly roundup of the biggest AI news. This week: analyzing GPT-5 rumors, Gemini 3 deep dive, and Q&A with viewers.",
      stream_url: "https://example.com/stream",
      thumbnail_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=450&fit=crop",
      scheduled_at: new Date().toISOString(),
      is_live: true,
      is_premium: false,
      viewers_count: 1247,
      playback_url: null,
      stream_key: null,
    },
    {
      id: "2",
      title: "Exclusive: Interview with AI Safety Researcher",
      description: "A deep conversation about AI alignment, existential risk, and what we can do to ensure beneficial AGI.",
      stream_url: null,
      thumbnail_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&h=450&fit=crop",
      scheduled_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      is_live: false,
      is_premium: true,
      viewers_count: 0,
      playback_url: null,
      stream_key: null,
    },
    {
      id: "3",
      title: "Hands-on: Building with the Latest AI APIs",
      description: "Live coding session where we build a complete AI application using the newest APIs from OpenAI, Anthropic, and Google.",
      stream_url: null,
      thumbnail_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=800&h=450&fit=crop",
      scheduled_at: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
      is_live: false,
      is_premium: false,
      viewers_count: 0,
      playback_url: null,
      stream_key: null,
    },
  ];

  const displayStreams = liveStreams && liveStreams.length > 0 ? liveStreams : sampleStreams;
  const liveNow = displayStreams.filter(s => s.is_live);
  const upcoming = displayStreams.filter(s => !s.is_live);
  const currentStream = selectedStream || liveNow[0];

  // Use the live chat hook
  const { messages: chatMessages, sendMessage } = useLiveChat(currentStream?.id || null);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;
    
    const success = await sendMessage(newMessage);
    if (success) {
      setNewMessage("");
    }
  };

  // Determine video source - prefer playback_url (HLS) over stream_url (YouTube/external)
  const getVideoSource = (stream: LiveStream) => {
    if (stream.playback_url) {
      return stream.playback_url;
    }
    if (stream.stream_url) {
      return stream.stream_url;
    }
    return null;
  };

  const renderStreamPlayer = (stream: LiveStream) => {
    const videoSource = getVideoSource(stream);
    
    // Show video player if stream is live and has a video source
    if (stream.is_live && videoSource && !stream.is_premium) {
      return (
        <VideoPlayer
          src={videoSource}
          title={stream.title}
          poster={stream.thumbnail_url || undefined}
          className="w-full h-full"
        />
      );
    }

    // Show thumbnail with overlay for non-live or premium streams
    return (
      <>
        <img
          src={stream.thumbnail_url || "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=1200&h=675&fit=crop"}
          alt={stream.title}
          className="w-full h-full object-cover"
        />
        {/* Stream Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Live Badge */}
        {stream.is_live && (
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <Badge variant="destructive" className="animate-pulse">
              <Radio className="h-3 w-3 mr-1" />
              LIVE
            </Badge>
            <Badge variant="secondary">
              <Users className="h-3 w-3 mr-1" />
              {stream.viewers_count.toLocaleString()} watching
            </Badge>
          </div>
        )}

        {/* Premium Lock */}
        {stream.is_premium && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/60">
            <div className="text-center text-white">
              <Lock className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">Premium Content</p>
              <Button variant="secondary">Subscribe to Watch</Button>
            </div>
          </div>
        )}

        {/* Countdown for non-live */}
        {!stream.is_live && !stream.is_premium && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <Clock className="h-12 w-12 mx-auto mb-4" />
              <p className="text-lg font-semibold mb-2">{formatScheduledTime(stream.scheduled_at)}</p>
              <Button variant="outline" className="text-white border-white hover:bg-white/20">
                <Bell className="h-4 w-4 mr-2" />
                Set Reminder
              </Button>
            </div>
          </div>
        )}

        {/* Stream Info */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <h2 className="text-xl font-bold text-white mb-2">{stream.title}</h2>
          <p className="text-white/80 text-sm line-clamp-2">{stream.description}</p>
        </div>
      </>
    );
  };

  return (
    <>
      <Helmet>
        <title>Live Streams — Cognitive Ledger</title>
        <meta name="description" content="Watch live AI news, interviews, and discussions. Join the conversation in real-time." />
      </Helmet>

      <Layout>
        <div className="container py-8">
          {/* Header */}
          <header className="mb-8">
            <div className="inline-flex items-center gap-2 mb-4">
              <Radio className="h-6 w-6 text-destructive animate-pulse" />
              <span className="text-sm font-medium uppercase tracking-widest text-primary">Live</span>
            </div>
            <h1 className="headline-hero mb-4">Live Streams</h1>
            <p className="text-xl text-body-text max-w-2xl">
              Watch live coverage of AI news, expert interviews, and interactive discussions.
            </p>
          </header>

          {/* Main Content */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Video Player */}
            <div className="lg:col-span-2 space-y-6">
              {/* Main Player */}
              <Card className="overflow-hidden">
                <div className="relative aspect-video bg-black">
                  {currentStream ? (
                    renderStreamPlayer(currentStream)
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center text-white/60">
                        <Video className="h-16 w-16 mx-auto mb-4" />
                        <p>No streams available</p>
                      </div>
                    </div>
                  )}
                </div>
                {/* Stream info below player for live streams */}
                {currentStream?.is_live && getVideoSource(currentStream) && !currentStream.is_premium && (
                  <CardContent className="p-4 border-t">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="destructive" className="animate-pulse">
                            <Radio className="h-3 w-3 mr-1" />
                            LIVE
                          </Badge>
                          <Badge variant="secondary">
                            <Users className="h-3 w-3 mr-1" />
                            {currentStream.viewers_count.toLocaleString()} watching
                          </Badge>
                        </div>
                        <h2 className="text-lg font-bold mb-1">{currentStream.title}</h2>
                        <p className="text-sm text-muted-foreground">{currentStream.description}</p>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>

              {/* Upcoming Streams */}
              <section>
                <h2 className="headline-tertiary mb-4">Upcoming Streams</h2>
                {isLoading ? (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[...Array(4)].map((_, i) => (
                      <Skeleton key={i} className="h-48 w-full" />
                    ))}
                  </div>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-4">
                    {upcoming.map((stream) => (
                      <Card 
                        key={stream.id} 
                        className={`overflow-hidden cursor-pointer transition-all hover:border-primary/50 ${
                          selectedStream?.id === stream.id ? 'border-primary ring-1 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedStream(stream)}
                      >
                        <div className="relative aspect-video">
                          <img
                            src={stream.thumbnail_url || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop"}
                            alt={stream.title}
                            className="w-full h-full object-cover"
                          />
                          {stream.is_premium && (
                            <Badge className="absolute top-2 left-2 bg-accent">
                              <Lock className="h-3 w-3 mr-1" />
                              Premium
                            </Badge>
                          )}
                          <div className="absolute bottom-2 left-2">
                            <Badge variant="secondary">
                              <Calendar className="h-3 w-3 mr-1" />
                              {formatScheduledTime(stream.scheduled_at)}
                            </Badge>
                          </div>
                        </div>
                        <CardContent className="p-4">
                          <h3 className="font-semibold text-sm line-clamp-2">{stream.title}</h3>
                          <p className="text-xs text-caption mt-1">
                            {new Date(stream.scheduled_at).toLocaleDateString("en-US", {
                              weekday: "short",
                              month: "short",
                              day: "numeric",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Live Chat */}
            <div className="lg:col-span-1">
              <Card className="h-[600px] flex flex-col">
                <CardHeader className="border-b py-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Live Chat
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col p-0">
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-4">
                      {chatMessages.length === 0 && (
                        <p className="text-sm text-muted-foreground text-center py-4">
                          No messages yet. Be the first to chat!
                        </p>
                      )}
                      {chatMessages.map((msg) => (
                        <div key={msg.id} className="flex gap-2">
                          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-semibold text-primary">
                              {msg.user_name[0].toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="flex items-baseline gap-2">
                              <span className="font-semibold text-sm">{msg.user_name}</span>
                              <span className="text-xs text-caption">
                                {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-sm text-body-text">{msg.message}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                  <div className="p-4 border-t">
                    {user ? (
                      <form 
                        onSubmit={(e) => { e.preventDefault(); handleSendMessage(); }}
                        className="flex gap-2"
                      >
                        <Input
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          placeholder="Send a message..."
                          className="flex-1"
                        />
                        <Button type="submit" size="icon">
                          <Send className="h-4 w-4" />
                        </Button>
                      </form>
                    ) : (
                      <Link to="/auth">
                        <Button variant="outline" className="w-full">
                          <LogIn className="h-4 w-4 mr-2" />
                          Sign in to chat
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Subscribe CTA */}
              <Card className="mt-6 bg-gradient-to-br from-primary/20 to-transparent border-primary/20">
                <CardContent className="p-6 text-center">
                  <Radio className="h-8 w-8 mx-auto mb-3 text-primary" />
                  <h3 className="font-semibold mb-2">Never Miss a Stream</h3>
                  <p className="text-sm text-body-text mb-4">
                    Subscribe for notifications and exclusive premium streams.
                  </p>
                  <Button className="w-full">Subscribe Now</Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Layout>
    </>
  );
}
