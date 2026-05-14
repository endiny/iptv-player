import React, { useCallback, useEffect, useRef, useState } from "react";
import { useIptvPlaylist } from "../stores/use-iptv-playlist";
import { PlayerOverlay } from "./overlay/PlayerOverlay";
import { PlayerControls } from "./overlay/PlayerControls";
import { usePlayer } from "./usePlayer";
import { ChannelDetails } from "./overlay/ChannelDetails";
import { Link } from "react-router";
import { useShallow } from "zustand/react/shallow";

const OVERLAY_IDLE_TIMEOUT_MS = 3000;

export const HlsPlayer: React.FC = () => {
  const { channel, currentChannel, setChannel } = useIptvPlaylist(
    useShallow(({ channel, currentChannel, setChannel }) => ({ channel, currentChannel, setChannel }))
  );
  const { videoRef, handlePlayPause, isPlaying, setVolume, toggleMute } = usePlayer(channel);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideOverlayTimeout = useRef<number | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);

  const goFullScreen = useCallback(() => {
    if (document.fullscreenElement === null) {
      containerRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  }, []);

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case ' ':
          e.preventDefault();
          handlePlayPause();
          showOverlay();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setChannel(currentChannel - 1);
          showOverlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          setChannel(currentChannel + 1);
          showOverlay();
          break;
        case 'f':
        case 'F':
          goFullScreen();
          break;
        case 'm':
        case 'M':
          toggleMute();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePlayPause, showOverlay, goFullScreen, currentChannel, setChannel, toggleMute]);

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) return;
    handlePlayPause();
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
      className={`hls-player ${isOverlayVisible ? 'cursor-default' : 'cursor-none'}`}
      role="region"
      aria-label="HLS player"
      onMouseMove={showOverlay}
      onMouseEnter={showOverlay}
      onClick={handleContainerClick}
    >
      <video
        ref={videoRef}
        controls={false}
        className="hls-video"
        preload="none"
      />

      <PlayerOverlay
        className={`pointer-events-none transition-opacity duration-300 ${isOverlayVisible ? "opacity-100" : "opacity-0"}`}
        topPanel={
          <div className="pointer-events-auto p-4">
            <Link
              to="/"
              className="inline-block rounded-full border border-white/40 bg-black/45 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition hover:bg-black/70"
            >
              ← Channels list
            </Link>
          </div>
        }
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
