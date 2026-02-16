import { useIptvPlaylist } from "@/stores/use-iptv-playlist";
import { useShallow } from "zustand/react/shallow";

interface P {
  isPlaying: boolean;
  onPlayPause: () => void;
  onFullScreen: () => void;
  onVolumeChange: (value: number) => void;
}

const controlButtonClass =
  "flex h-9 w-9 items-center justify-center rounded-full border border-white/40 bg-black/30 text-base text-white transition hover:bg-black/60 sm:h-10 sm:w-10 sm:text-lg";

export const PlayerControls: React.FC<P> = (p) => {
  const { currentChannel, setChannel } = useIptvPlaylist(
    useShallow(({ currentChannel, setChannel }) => ({ currentChannel, setChannel }))
  );

  const goBack = () => {
    setChannel(currentChannel - 1);
  };

  const goNext = () => {
    setChannel(currentChannel + 1);
  };

  return (
    <div className="flex flex-col gap-3 px-3 py-3 sm:px-4 md:px-6">
      <div className="flex items-center justify-center gap-2 sm:justify-start">
        <button className={controlButtonClass} onClick={goBack} aria-label="Previous channel" title="Previous channel">
          ⏮
        </button>
        <button className={controlButtonClass} onClick={p.onPlayPause} aria-label={p.isPlaying ? "Pause" : "Play"} title={p.isPlaying ? "Pause" : "Play"}>
          {p.isPlaying ? "⏸" : "▶"}
        </button>
        <button className={controlButtonClass} onClick={goNext} aria-label="Next channel" title="Next channel">
          ⏭
        </button>
      </div>

      <div className="flex items-center justify-center gap-2 sm:self-end">
        <span className="text-sm" aria-hidden>
          🔊
        </span>
        <input
          className="h-1 w-28 max-w-[36vw] cursor-pointer accent-white sm:w-24 sm:max-w-none md:w-32"
          type="range"
          min={0}
          max={100}
          defaultValue={100}
          onChange={(e) => p.onVolumeChange(e.currentTarget.valueAsNumber / 100)}
          aria-label="Volume"
        />
        <button className={controlButtonClass} onClick={p.onFullScreen} aria-label="Toggle fullscreen" title="Toggle fullscreen">
          ⛶
        </button>
      </div>
    </div>
  );
};
