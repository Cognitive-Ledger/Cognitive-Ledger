import {
  MediaPlayer,
  MediaOutlet,
  MediaPoster,
  MediaCommunitySkin,
} from '@vidstack/react';
import 'vidstack/styles/defaults.css';
import 'vidstack/styles/community-skin/video.css';

interface VideoPlayerProps {
  src: string;
  title?: string;
  poster?: string;
  className?: string;
}

export function VideoPlayer({ src, title, poster, className }: VideoPlayerProps) {
  return (
    <MediaPlayer
      title={title}
      src={src}
      className={`video-player ${className || ''}`}
      crossorigin=""
      playsInline
    >
      <MediaOutlet>
        {poster && <MediaPoster alt={title || 'Video poster'} src={poster} />}
      </MediaOutlet>
      <MediaCommunitySkin />
    </MediaPlayer>
  );
}
