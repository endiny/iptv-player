import React, { useCallback, useEffect, useRef, useState } from "react";
import { useIptvPlaylist } from "../stores/use-iptv-playlist";
import { PlayerOverlay } from "./overlay/PlayerOverlay";
import { PlayerControls } from "./overlay/PlayerControls";
import { usePlayer } from "./usePlayer";
import { ChannelDetails } from "./overlay/ChannelDetails";
import { Link, useNavigate, useSearchParams } from "react-router";
import { useShallow } from "zustand/react/shallow";

const OVERLAY_IDLE_TIMEOUT_MS = 3000;

export const HlsPlayer: React.FC = () => {
  const { channel, currentChannel, playlist, setChannel } = useIptvPlaylist(
    useShallow(({ channel, currentChannel, playlist, setChannel }) => ({
      channel, currentChannel, playlist, setChannel,
    }))
  );
  const { videoRef, handlePlayPause, isPlaying, setVolume, toggleMute } = usePlayer(channel);
  const containerRef = useRef<HTMLDivElement>(null);
  const hideOverlayTimeout = useRef<number | null>(null);
  const [isOverlayVisible, setIsOverlayVisible] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

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

  // Restore channel from URL on mount
  useEffect(() => {
    const chParam = searchParams.get('ch');
    const index = chParam !== null ? parseInt(chParam, 10) : NaN;
    if (!playlist || isNaN(index) || index < 0 || index >= playlist.items.length) {
      navigate('/');
      return;
    }
    setChannel(index);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const navigateToChannel = useCallback((index: number) => {
    if (!playlist) return;
    const size = playlist.items.length;
    const normalized = ((index % size) + size) % size;
    setChannel(normalized);
    setSearchParams({ ch: String(normalized) }, { replace: true });
  }, [playlist, setChannel, setSearchParams]);

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
          navigateToChannel(currentChannel - 1);
          showOverlay();
          break;
        case 'ArrowRight':
          e.preventDefault();
          navigateToChannel(currentChannel + 1);
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
  }, [handlePlayPause, showOverlay, goFullScreen, currentChannel, navigateToChannel, toggleMute]);

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) return;
    handlePlayPause();
  };

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
              onPrev={() => navigateToChannel(currentChannel - 1)}
              onNext={() => navigateToChannel(currentChannel + 1)}
            />
          </div>
        }
      />
    </div>
  );
};
