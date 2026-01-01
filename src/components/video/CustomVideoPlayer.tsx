import { useState, useRef, useEffect, useCallback } from 'react';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, Settings } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';

interface CustomVideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  className?: string;
  isLive?: boolean;
}

// YouTube URL helpers
function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|live\/)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Vimeo URL helpers
function isVimeoUrl(url: string): boolean {
  return url.includes('vimeo.com');
}

function getVimeoId(url: string): string | null {
  const regExp = /vimeo\.com\/(?:video\/)?(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

declare global {
  interface Window {
    YT: {
      Player: new (elementId: string, config: any) => any;
      PlayerState: {
        PLAYING: number;
        PAUSED: number;
        BUFFERING: number;
        ENDED: number;
      };
    };
    onYouTubeIframeAPIReady: () => void;
  }
}

export function CustomVideoPlayer({ src, title, poster, className, isLive = false }: CustomVideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volume, setVolume] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isYouTubeReady, setIsYouTubeReady] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const ytPlayerRef = useRef<any>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const playerContainerId = useRef(`yt-player-${Math.random().toString(36).substr(2, 9)}`);

  const isYouTube = isYouTubeUrl(src);
  const isVimeo = isVimeoUrl(src);
  const youtubeId = isYouTube ? getYouTubeId(src) : null;
  const vimeoId = isVimeo ? getVimeoId(src) : null;

  // Load YouTube IFrame API
  useEffect(() => {
    if (!isYouTube || !youtubeId) return;

    const loadYouTubeAPI = () => {
      if (window.YT && window.YT.Player) {
        initYouTubePlayer();
        return;
      }

      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);

      window.onYouTubeIframeAPIReady = () => {
        initYouTubePlayer();
      };
    };

    const initYouTubePlayer = () => {
      if (ytPlayerRef.current) return;
      
      ytPlayerRef.current = new window.YT.Player(playerContainerId.current, {
        videoId: youtubeId,
        playerVars: {
          autoplay: 0,
          controls: 0,
          modestbranding: 1,
          rel: 0,
          showinfo: 0,
          iv_load_policy: 3,
          playsinline: 1,
        },
        events: {
          onReady: () => {
            setIsYouTubeReady(true);
          },
          onStateChange: (event: any) => {
            if (event.data === window.YT.PlayerState.PLAYING) {
              setIsPlaying(true);
            } else if (event.data === window.YT.PlayerState.PAUSED) {
              setIsPlaying(false);
            }
          },
        },
      });
    };

    loadYouTubeAPI();

    return () => {
      if (ytPlayerRef.current?.destroy) {
        ytPlayerRef.current.destroy();
        ytPlayerRef.current = null;
      }
    };
  }, [isYouTube, youtubeId]);

  // Handle controls visibility
  const showControlsTemporarily = useCallback(() => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      if (isPlaying) {
        setShowControls(false);
      }
    }, 3000);
  }, [isPlaying]);

  // Play/Pause
  const togglePlay = useCallback(() => {
    if (isYouTube && ytPlayerRef.current) {
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
      } else {
        ytPlayerRef.current.playVideo();
      }
    } else if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
    setIsPlaying(!isPlaying);
  }, [isPlaying, isYouTube]);

  // Mute/Unmute
  const toggleMute = useCallback(() => {
    if (isYouTube && ytPlayerRef.current) {
      if (isMuted) {
        ytPlayerRef.current.unMute();
        ytPlayerRef.current.setVolume(volume);
      } else {
        ytPlayerRef.current.mute();
      }
    } else if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted(!isMuted);
  }, [isMuted, isYouTube, volume]);

  // Volume change
  const handleVolumeChange = useCallback((value: number[]) => {
    const newVolume = value[0];
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
    
    if (isYouTube && ytPlayerRef.current) {
      ytPlayerRef.current.setVolume(newVolume);
      if (newVolume === 0) {
        ytPlayerRef.current.mute();
      } else {
        ytPlayerRef.current.unMute();
      }
    } else if (videoRef.current) {
      videoRef.current.volume = newVolume / 100;
      videoRef.current.muted = newVolume === 0;
    }
  }, [isYouTube]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  }, [isFullscreen]);

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Handle native video events
  useEffect(() => {
    if (!videoRef.current || isYouTube) return;

    const video = videoRef.current;
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);

    return () => {
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
    };
  }, [isYouTube]);

  // For Vimeo, we still use iframe but with custom styling
  if (isVimeo && vimeoId) {
    return (
      <div className={cn("relative aspect-video bg-black rounded-lg overflow-hidden", className)}>
        <iframe
          src={`https://player.vimeo.com/video/${vimeoId}?dnt=1`}
          title={title || 'Vimeo video'}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative aspect-video bg-black rounded-lg overflow-hidden group cursor-pointer",
        className
      )}
      onMouseMove={showControlsTemporarily}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={togglePlay}
    >
      {/* YouTube Player */}
      {isYouTube && youtubeId && (
        <div className="absolute inset-0 pointer-events-none">
          <div id={playerContainerId.current} className="w-full h-full" />
        </div>
      )}

      {/* Native Video Player */}
      {!isYouTube && !isVimeo && (
        <video
          ref={videoRef}
          poster={poster}
          className="w-full h-full object-contain"
          playsInline
        >
          <source src={src} />
          Your browser does not support the video tag.
        </video>
      )}

      {/* Live Badge */}
      {isLive && (
        <div className="absolute top-4 left-4 z-20">
          <div className="flex items-center gap-2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
            LIVE
          </div>
        </div>
      )}

      {/* Play Button Overlay (when paused) */}
      {!isPlaying && isYouTubeReady && (
        <div className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
          <div className="w-20 h-20 bg-primary/90 rounded-full flex items-center justify-center shadow-lg">
            <Play className="w-10 h-10 text-primary-foreground ml-1" fill="currentColor" />
          </div>
        </div>
      )}

      {/* Loading state for YouTube */}
      {isYouTube && !isYouTubeReady && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-10">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Controls Bar */}
      <div
        className={cn(
          "absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-4 pt-12 transition-opacity duration-300 z-20",
          showControls ? "opacity-100" : "opacity-0"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlay}
            className="text-white hover:text-primary transition-colors"
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-6 h-6" fill="currentColor" />
            ) : (
              <Play className="w-6 h-6" fill="currentColor" />
            )}
          </button>

          {/* Volume */}
          <div className="flex items-center gap-2 group/volume">
            <button
              onClick={toggleMute}
              className="text-white hover:text-primary transition-colors"
              aria-label={isMuted ? 'Unmute' : 'Mute'}
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <div className="w-0 overflow-hidden group-hover/volume:w-20 transition-all duration-300">
              <Slider
                value={[isMuted ? 0 : volume]}
                max={100}
                step={1}
                onValueChange={handleVolumeChange}
                className="w-20"
              />
            </div>
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Title */}
          {title && (
            <span className="text-white text-sm font-medium truncate max-w-[200px]">
              {title}
            </span>
          )}

          {/* Fullscreen */}
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-primary transition-colors"
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Enter fullscreen'}
          >
            {isFullscreen ? (
              <Minimize className="w-5 h-5" />
            ) : (
              <Maximize className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
