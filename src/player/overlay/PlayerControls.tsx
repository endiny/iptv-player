import { useIptvPlaylist } from "@/stores/use-iptv-playlist";
import { useShallow } from "zustand/react/shallow";
import { Icon } from "@/icons";

interface PlayerControlsProps {
  isPlaying: boolean;
  onPlayPause: () => void;
  onFullScreen: () => void;
  onVolumeChange: (value: number) => void;
}

const controlButtonClass =
  "flex h-10 w-10 items-center justify-center rounded-full border border-white/40 bg-black/30 text-white transition hover:bg-black/60";

export const PlayerControls: React.FC<PlayerControlsProps> = (p) => {
  const { currentChannel, setChannel } = useIptvPlaylist(
    useShallow(({ currentChannel, setChannel }) => ({ currentChannel, setChannel }))
  );

  const goBack = () => setChannel(currentChannel - 1);
  const goNext = () => setChannel(currentChannel + 1);

  return (
    <div className="flex items-end justify-between gap-4 px-4 py-3 md:px-6">
      <div className="flex items-center gap-2">
        <button className={controlButtonClass} onClick={goBack} aria-label="Previous channel" title="Previous channel">
          <Icon name="prev" />
        </button>
        <button className={controlButtonClass} onClick={p.onPlayPause} aria-label={p.isPlaying ? "Pause" : "Play"} title={p.isPlaying ? "Pause" : "Play"}>
          <Icon name={p.isPlaying ? "pause" : "play"} />
        </button>
        <button className={controlButtonClass} onClick={goNext} aria-label="Next channel" title="Next channel">
          <Icon name="next" />
        </button>
      </div>

      <div className="flex items-center gap-2 self-end">
        <Icon name="volume" />
        <input
          className="h-1 w-24 cursor-pointer accent-white md:w-32"
          type="range"
          min={0}
          max={100}
          defaultValue={100}
          onChange={(e) => p.onVolumeChange(e.currentTarget.valueAsNumber / 100)}
          aria-label="Volume"
        />
        <button className={controlButtonClass} onClick={p.onFullScreen} aria-label="Toggle fullscreen" title="Toggle fullscreen">
          <Icon name="fullscreen" />
        </button>
      </div>
    </div>
  );
};
