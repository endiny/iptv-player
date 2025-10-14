import { useIptvPlaylist } from "@/stores/use-iptv-playlist";
import { useShallow } from "zustand/react/shallow";

interface P {
  onPlayPause: () => void;
  onFullScreen: () => void;
  onVolumeChange: (value: number) => void;
}

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
    <div className="flex justify-between space-x-4 p-4 ">
      <div></div>
      <div className="flex gap-3">
        <button onClick={goBack}>Prev</button>
        <button onClick={p.onPlayPause}>Play/Pause</button>
        <button onClick={goNext}>Next</button>
      </div>
      <div>
        <input type="range" min={0} max={100} defaultValue={100} onChange={e => p.onVolumeChange(e.currentTarget.valueAsNumber / 100)}/>
        <button onClick={p.onFullScreen}>FS</button>
      </div>
    </div>
  );
};
