interface TextTrack {
  src: string;
  label: string;
  language: string;
  kind: 'subtitles' | 'captions';
  default?: boolean;
}

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  className?: string;
  textTracks?: TextTrack[];
}

// Check if the source is a YouTube URL
function isYouTubeUrl(url: string): boolean {
  return url.includes('youtube.com') || url.includes('youtu.be');
}

// Extract YouTube video ID
function getYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// Check if the source is a Vimeo URL
function isVimeoUrl(url: string): boolean {
  return url.includes('vimeo.com');
}

// Extract Vimeo video ID
function getVimeoId(url: string): string | null {
  const regExp = /vimeo\.com\/(?:video\/)?(\d+)/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export function VideoPlayer({ src, title, poster, className, textTracks }: VideoPlayerProps) {
  // Handle YouTube embeds
  if (isYouTubeUrl(src)) {
    const videoId = getYouTubeId(src);
    if (videoId) {
      return (
        <div className={`video-player youtube-embed ${className || ''}`}>
          <iframe
            src={`https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
            title={title || 'YouTube video'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }
  }

  // Handle Vimeo embeds
  if (isVimeoUrl(src)) {
    const videoId = getVimeoId(src);
    if (videoId) {
      return (
        <div className={`video-player vimeo-embed ${className || ''}`}>
          <iframe
            src={`https://player.vimeo.com/video/${videoId}?dnt=1`}
            title={title || 'Vimeo video'}
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            className="w-full h-full"
          />
        </div>
      );
    }
  }

  // Handle direct video files with native HTML5 video
  return (
    <div className={`video-player ${className || ''}`}>
      <video
        controls
        playsInline
        poster={poster}
        className="w-full h-full"
        title={title}
      >
        <source src={src} />
        {textTracks?.map((track, index) => (
          <track
            key={index}
            src={track.src}
            kind={track.kind}
            label={track.label}
            srcLang={track.language}
            default={track.default}
          />
        ))}
        Your browser does not support the video tag.
      </video>
    </div>
  );
}
