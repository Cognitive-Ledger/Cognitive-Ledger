import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Volume2, 
  VolumeX,
  Clock,
  Headphones,
  Lock,
  Mic
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

interface Podcast {
  id: string;
  title: string;
  description: string;
  audio_url: string;
  image_url: string | null;
  duration_seconds: number;
  episode_number: number | null;
  season_number: number | null;
  is_premium: boolean;
  published_at: string;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${minutes}:${secs.toString().padStart(2, '0')}`;
}

export default function Podcasts() {
  const [currentEpisode, setCurrentEpisode] = useState<Podcast | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(80);
  const [isMuted, setIsMuted] = useState(false);

  const { data: podcasts, isLoading } = useQuery({
    queryKey: ["podcasts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("podcasts")
        .select("*")
        .order("published_at", { ascending: false });
      
      if (error) throw error;
      return data as Podcast[];
    },
  });

  const handlePlayEpisode = (podcast: Podcast) => {
    if (podcast.is_premium) {
      // TODO: Check subscription status
      return;
    }
    setCurrentEpisode(podcast);
    setIsPlaying(true);
    setCurrentTime(0);
  };

  // Sample data for display when no podcasts exist
  const samplePodcasts: Podcast[] = [
    {
      id: "1",
      title: "The Future of AGI: What to Expect in 2025",
      description: "In this episode, we dive deep into the latest developments in artificial general intelligence and what leading researchers predict for the coming year.",
      audio_url: "",
      image_url: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=400&fit=crop",
      duration_seconds: 2700,
      episode_number: 12,
      season_number: 2,
      is_premium: false,
      published_at: new Date().toISOString(),
    },
    {
      id: "2",
      title: "Inside OpenAI: Exclusive Interview with Sam Altman",
      description: "An exclusive conversation about the future of AI, safety concerns, and the path to beneficial AGI.",
      audio_url: "",
      image_url: "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=400&h=400&fit=crop",
      duration_seconds: 3600,
      episode_number: 11,
      season_number: 2,
      is_premium: true,
      published_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "3",
      title: "AI in Healthcare: Revolutionizing Diagnostics",
      description: "How machine learning models are transforming medical imaging, drug discovery, and patient care.",
      audio_url: "",
      image_url: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=400&fit=crop",
      duration_seconds: 2400,
      episode_number: 10,
      season_number: 2,
      is_premium: false,
      published_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: "4",
      title: "The Ethics of Autonomous Weapons",
      description: "A critical discussion on AI in military applications and the moral implications of autonomous systems.",
      audio_url: "",
      image_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=400&fit=crop",
      duration_seconds: 3000,
      episode_number: 9,
      season_number: 2,
      is_premium: true,
      published_at: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ];

  const displayPodcasts = podcasts && podcasts.length > 0 ? podcasts : samplePodcasts;
  const featuredPodcast = displayPodcasts[0];

  return (
    <>
      <Helmet>
        <title>Podcasts — Cognitive Ledger</title>
        <meta name="description" content="Listen to in-depth discussions about AI, technology, and the future with industry experts and researchers." />
      </Helmet>

      <Layout>
        <div className="container py-8">
          {/* Header */}
          <header className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 mb-4">
              <Mic className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium uppercase tracking-widest text-primary">Audio</span>
            </div>
            <h1 className="headline-hero mb-4">The Cognitive Ledger Podcast</h1>
            <p className="text-xl text-body-text max-w-2xl mx-auto">
              In-depth conversations with AI researchers, industry leaders, and technologists shaping the future.
            </p>
          </header>

          {/* Featured Episode */}
          {!isLoading && featuredPodcast && (
            <section className="mb-16">
              <Card className="overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-primary/20">
                <CardContent className="p-0">
                  <div className="grid md:grid-cols-2 gap-0">
                    <div className="aspect-square md:aspect-auto relative">
                      <img
                        src={featuredPodcast.image_url || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600&h=600&fit=crop"}
                        alt={featuredPodcast.title}
                        className="w-full h-full object-cover"
                      />
                      {featuredPodcast.is_premium && (
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-accent text-accent-foreground">
                            <Lock className="h-3 w-3 mr-1" />
                            Premium
                          </Badge>
                        </div>
                      )}
                    </div>
                    <div className="p-8 flex flex-col justify-center">
                      <Badge variant="outline" className="w-fit mb-4">
                        Latest Episode
                      </Badge>
                      <h2 className="headline-secondary mb-4">{featuredPodcast.title}</h2>
                      <p className="text-body-text mb-6">{featuredPodcast.description}</p>
                      <div className="flex items-center gap-4 text-sm text-caption mb-6">
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {formatDuration(featuredPodcast.duration_seconds)}
                        </span>
                        {featuredPodcast.episode_number && (
                          <span>Episode {featuredPodcast.episode_number}</span>
                        )}
                      </div>
                      <Button 
                        size="lg" 
                        onClick={() => handlePlayEpisode(featuredPodcast)}
                        disabled={featuredPodcast.is_premium}
                      >
                        {featuredPodcast.is_premium ? (
                          <>
                            <Lock className="h-4 w-4 mr-2" />
                            Subscribe to Listen
                          </>
                        ) : (
                          <>
                            <Play className="h-4 w-4 mr-2" />
                            Play Episode
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}

          {/* All Episodes */}
          <section>
            <h2 className="headline-tertiary mb-8">All Episodes</h2>
            
            {isLoading ? (
              <div className="space-y-4">
                {[...Array(4)].map((_, i) => (
                  <Skeleton key={i} className="h-32 w-full" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {displayPodcasts.map((podcast, index) => (
                  <Card 
                    key={podcast.id} 
                    className={`overflow-hidden transition-all hover:border-primary/50 ${
                      currentEpisode?.id === podcast.id ? 'border-primary ring-1 ring-primary' : ''
                    }`}
                  >
                    <CardContent className="p-0">
                      <div className="flex gap-4">
                        <div className="relative w-32 h-32 flex-shrink-0">
                          <img
                            src={podcast.image_url || `https://images.unsplash.com/photo-1677442136019-21780ecad995?w=200&h=200&fit=crop`}
                            alt={podcast.title}
                            className="w-full h-full object-cover"
                          />
                          {podcast.is_premium && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                              <Lock className="h-6 w-6 text-white" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 py-4 pr-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                {podcast.season_number && podcast.episode_number && (
                                  <span className="text-xs text-caption">
                                    S{podcast.season_number} E{podcast.episode_number}
                                  </span>
                                )}
                                {podcast.is_premium && (
                                  <Badge variant="secondary" className="text-xs">
                                    Premium
                                  </Badge>
                                )}
                              </div>
                              <h3 className="font-semibold mb-2 line-clamp-1">{podcast.title}</h3>
                              <p className="text-sm text-body-text line-clamp-2 mb-2">
                                {podcast.description}
                              </p>
                              <div className="flex items-center gap-4 text-xs text-caption">
                                <span className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  {formatDuration(podcast.duration_seconds)}
                                </span>
                                <span>
                                  {new Date(podcast.published_at).toLocaleDateString("en-US", {
                                    month: "short",
                                    day: "numeric",
                                    year: "numeric",
                                  })}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant={currentEpisode?.id === podcast.id ? "default" : "outline"}
                              size="icon"
                              onClick={() => handlePlayEpisode(podcast)}
                              disabled={podcast.is_premium}
                            >
                              {currentEpisode?.id === podcast.id && isPlaying ? (
                                <Pause className="h-4 w-4" />
                              ) : (
                                <Play className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          {/* Subscribe CTA */}
          <section className="mt-16 p-8 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent rounded-lg text-center">
            <Headphones className="h-12 w-12 mx-auto mb-4 text-primary" />
            <h2 className="headline-tertiary mb-4">Subscribe for Full Access</h2>
            <p className="text-body-text mb-6 max-w-lg mx-auto">
              Get unlimited access to all podcast episodes, including exclusive premium content and early releases.
            </p>
            <Button size="lg">Start Free Trial</Button>
          </section>
        </div>

        {/* Audio Player Bar */}
        {currentEpisode && (
          <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur border-t border-divider p-4 z-50">
            <div className="container">
              <div className="flex items-center gap-4">
                {/* Episode Info */}
                <div className="flex items-center gap-3 flex-shrink-0 w-64">
                  <img
                    src={currentEpisode.image_url || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=100&h=100&fit=crop"}
                    alt={currentEpisode.title}
                    className="w-12 h-12 rounded object-cover"
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{currentEpisode.title}</p>
                    <p className="text-xs text-caption truncate">Cognitive Ledger Podcast</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex-1 flex flex-col items-center gap-2">
                  <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <SkipBack className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="icon" 
                      className="h-10 w-10"
                      onClick={() => setIsPlaying(!isPlaying)}
                    >
                      {isPlaying ? (
                        <Pause className="h-5 w-5" />
                      ) : (
                        <Play className="h-5 w-5" />
                      )}
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <SkipForward className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-2 w-full max-w-md">
                    <span className="text-xs text-caption w-12 text-right">
                      {formatTime(currentTime)}
                    </span>
                    <Slider
                      value={[currentTime]}
                      max={currentEpisode.duration_seconds}
                      step={1}
                      className="flex-1"
                      onValueChange={(value) => setCurrentTime(value[0])}
                    />
                    <span className="text-xs text-caption w-12">
                      {formatTime(currentEpisode.duration_seconds)}
                    </span>
                  </div>
                </div>

                {/* Volume */}
                <div className="flex items-center gap-2 w-32 flex-shrink-0">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => setIsMuted(!isMuted)}
                  >
                    {isMuted ? (
                      <VolumeX className="h-4 w-4" />
                    ) : (
                      <Volume2 className="h-4 w-4" />
                    )}
                  </Button>
                  <Slider
                    value={[isMuted ? 0 : volume]}
                    max={100}
                    step={1}
                    className="flex-1"
                    onValueChange={(value) => {
                      setVolume(value[0]);
                      setIsMuted(false);
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </Layout>
    </>
  );
}