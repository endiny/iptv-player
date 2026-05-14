import { Icon } from '@/icons';

interface PlayerControlsProps {
  isPlaying: boolean;
  isMuted: boolean;
  onPlayPause: () => void;
  onToggleMute: () => void;
  onFullScreen: () => void;
  onVolumeChange: (value: number) => void;
  onPrev: () => void;
  onNext: () => void;
}

const controlButtonClass =
  'flex h-11 w-11 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white transition hover:bg-black/60 active:bg-black/70 md:h-10 md:w-10';

export const PlayerControls: React.FC<PlayerControlsProps> = (p) => (
  <div className="flex flex-wrap items-end justify-between gap-3 px-4 py-3 md:flex-nowrap md:px-6">
    <div className="flex items-center gap-2">
      <button
        className={controlButtonClass}
        onClick={p.onPrev}
        aria-label="Previous channel"
        title="Previous channel"
      >
        <Icon name="prev" />
      </button>
      <button
        className={controlButtonClass}
        onClick={p.onPlayPause}
        aria-label={p.isPlaying ? 'Pause' : 'Play'}
        title={p.isPlaying ? 'Pause' : 'Play'}
      >
        <Icon name={p.isPlaying ? 'pause' : 'play'} />
      </button>
      <button
        className={controlButtonClass}
        onClick={p.onNext}
        aria-label="Next channel"
        title="Next channel"
      >
        <Icon name="next" />
      </button>
    </div>

    <div className="flex items-center gap-2 self-end">
      <button
        className={controlButtonClass}
        onClick={p.onToggleMute}
        aria-label={p.isMuted ? 'Unmute' : 'Mute'}
        title={p.isMuted ? 'Unmute' : 'Mute'}
      >
        <Icon name={p.isMuted ? 'volume-off' : 'volume'} />
      </button>
      <input
        className="hidden h-1 w-24 cursor-pointer accent-white sm:block md:w-32"
        type="range"
        min={0}
        max={100}
        defaultValue={100}
        onChange={(e) => p.onVolumeChange(e.currentTarget.valueAsNumber / 100)}
        aria-label="Volume"
      />
      <button
        className={controlButtonClass}
        onClick={p.onFullScreen}
        aria-label="Toggle fullscreen"
        title="Toggle fullscreen"
      >
        <Icon name="fullscreen" />
      </button>
    </div>
  </div>
);
