import {
  MediaPlayer,
  MediaOutlet,
  MediaPoster,
  MediaPlayButton,
  MediaMuteButton,
  MediaFullscreenButton,
  MediaTime,
  MediaTimeSlider,
  MediaVolumeSlider,
  MediaBufferingIndicator,
  MediaCommunitySkin,
} from '@vidstack/react';

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
      className={className}
      crossorigin=""
    >
      <MediaOutlet>
        {poster && <MediaPoster alt={title || 'Video poster'} />}
      </MediaOutlet>
      <MediaCommunitySkin />
    </MediaPlayer>
  );
}
