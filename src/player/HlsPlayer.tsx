import React, { useRef } from "react";
import { useIptvPlaylist } from "../stores/use-iptv-playlist";
import { PlayerOverlay } from "./overlay/PlayerOverlay";
import { PlayerControls } from "./overlay/PlayerControls";
import { usePlayer } from "./usePlayer";
import { ChannelDetails } from "./overlay/ChannelDetails";
import { Link } from "react-router";

export const HlsPlayer: React.FC = () => {
  const channel = useIptvPlaylist((state) => state.channel);
  const { videoRef, handlePlayPause, setVolume } = usePlayer(channel);
  const containerRef = useRef<HTMLDivElement>(null);

  const goFullScreen = () => {
    if (document.fullscreenElement === null) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  if (!channel) {
    return (
      <div className="p-4">
        <p>No channel selected.</p>
        <Link to="/">Go back to playlist</Link>
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`hls-player`}
      role="region"
      aria-label="HLS player"
    >
      <video
        ref={videoRef}
        controls={false}
        className="hls-video"
        style={{ background: "#000" }}
        preload="none"
      />

      <PlayerOverlay
        bottomPanel={
          <div className="bg-black">
            <ChannelDetails />
            <PlayerControls
              onPlayPause={handlePlayPause}
              onFullScreen={goFullScreen}
              onVolumeChange={setVolume}
            />
          </div>
        }
      />
    </div>
  );
};
