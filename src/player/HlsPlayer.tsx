import React, { useCallback, useEffect, useRef, useState } from "react";
import { useIptvPlaylist } from "../stores/use-iptv-playlist";
import { PlayerOverlay } from "./overlay/PlayerOverlay";
import { PlayerControls } from "./overlay/PlayerControls";
import { usePlayer } from "./usePlayer";
import { ChannelDetails } from "./overlay/ChannelDetails";
import { Link } from "react-router";

const OVERLAY_IDLE_TIMEOUT_MS = 3000;

export const HlsPlayer: React.FC = () => {
  const channel = useIptvPlaylist((state) => state.channel);
  const { videoRef, handlePlayPause, isPlaying, setVolume } = usePlayer(channel);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideOverlayTimeout = useRef<number | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);

  const goFullScreen = () => {
    if (document.fullscreenElement === null) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const scheduleOverlayHide = useCallback(() => {
    if (hideOverlayTimeout.current !== null) {
      window.clearTimeout(hideOverlayTimeout.current);
    }

    hideOverlayTimeout.current = window.setTimeout(() => {
      setIsOverlayVisible(false);
    }, OVERLAY_IDLE_TIMEOUT_MS);
  }, []);

  const showOverlay = useCallback(() => {
    setIsOverlayVisible(true);
    scheduleOverlayHide();
  }, [scheduleOverlayHide]);

  useEffect(() => {
    showOverlay();

    return () => {
      if (hideOverlayTimeout.current !== null) {
        window.clearTimeout(hideOverlayTimeout.current);
      }
    };
  }, [showOverlay]);

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
      className="hls-player"
      role="region"
      aria-label="HLS player"
      onMouseMove={showOverlay}
      onMouseEnter={showOverlay}
    >
      <video
        ref={videoRef}
        controls={false}
        className="hls-video"
        style={{ background: "#000" }}
        preload="none"
      />

      <PlayerOverlay
        className={`pointer-events-none transition-opacity duration-300 ${isOverlayVisible ? "opacity-100" : "opacity-0"}`}
        bottomPanel={
          <div className="pointer-events-auto mt-auto bg-gradient-to-t from-black/70 via-black/45 to-transparent pb-3">
            <ChannelDetails />
            <PlayerControls
              isPlaying={isPlaying}
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
