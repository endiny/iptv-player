import React, { useCallback, useEffect, useRef } from 'react';
import { useIptvPlaylist } from '../stores/use-iptv-playlist';
import { PlayerOverlay } from './overlay/PlayerOverlay';
import { PlayerControls } from './overlay/PlayerControls';
import { usePlayer } from './usePlayer';
import { ChannelDetails } from './overlay/ChannelDetails';
import { Link, useNavigate, useSearchParams } from 'react-router';
import { Icon } from '@/icons';
import { useShallow } from 'zustand/react/shallow';
import { useOverlayVisibility } from './useOverlayVisibility';
import { useKeyboardShortcuts } from './useKeyboardShortcuts';

const OVERLAY_IDLE_TIMEOUT_MS = 3000;

export const HlsPlayer: React.FC = () => {
  const { channel, currentChannel, playlist, setChannel } = useIptvPlaylist(
    useShallow(({ channel, currentChannel, playlist, setChannel }) => ({
      channel,
      currentChannel,
      playlist,
      setChannel,
    })),
  );
  const { videoRef, handlePlayPause, isPlaying, isMuted, isBuffering, setVolume, toggleMute } =
    usePlayer(channel);
  const containerRef = useRef<HTMLDivElement>(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const { isOverlayVisible, showOverlay } = useOverlayVisibility(OVERLAY_IDLE_TIMEOUT_MS);

  const goFullScreen = useCallback(() => {
    const container = containerRef.current;
    const video = videoRef.current as
      | (HTMLVideoElement & {
          webkitEnterFullscreen?: () => void;
          webkitExitFullscreen?: () => void;
          webkitDisplayingFullscreen?: boolean;
        })
      | null;
    if (!container || !video) return;

    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
      return;
    }
    if (video.webkitDisplayingFullscreen) {
      video.webkitExitFullscreen?.();
      return;
    }

    // iOS WebKit (iPhone/iPad Safari, iOS Chrome): only the <video> can go fullscreen,
    // and webkitEnterFullscreen must run synchronously inside the user gesture —
    // a Promise .catch fallback fires too late and iOS rejects it.
    const isIosWebKit =
      typeof video.webkitEnterFullscreen === 'function' && 'ontouchend' in document;
    if (isIosWebKit) {
      video.webkitEnterFullscreen?.();
      return;
    }

    container.requestFullscreen?.().catch(() => undefined);
  }, [videoRef]);

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

  const navigateToChannel = useCallback(
    (index: number) => {
      if (!playlist) return;
      const size = playlist.items.length;
      const normalized = ((index % size) + size) % size;
      setChannel(normalized);
      setSearchParams({ ch: String(normalized) }, { replace: true });
    },
    [playlist, setChannel, setSearchParams],
  );

  const onPrevChannel = useCallback(
    () => navigateToChannel(currentChannel - 1),
    [navigateToChannel, currentChannel],
  );
  const onNextChannel = useCallback(
    () => navigateToChannel(currentChannel + 1),
    [navigateToChannel, currentChannel],
  );
  const onNavigateHome = useCallback(() => navigate('/'), [navigate]);

  useKeyboardShortcuts({
    onPlayPause: handlePlayPause,
    onPrevChannel,
    onNextChannel,
    onFullScreen: goFullScreen,
    onToggleMute: toggleMute,
    onNavigateHome,
    onShowOverlay: showOverlay,
  });

  const handleContainerClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('input')) return;
    const hasHover = window.matchMedia('(hover: hover)').matches;
    if (hasHover) {
      handlePlayPause();
      return;
    }
    if (!isOverlayVisible) {
      showOverlay();
    } else {
      handlePlayPause();
    }
  };

  return (
    <div
      ref={containerRef}
      className={`hls-player ${isOverlayVisible ? 'cursor-default' : 'cursor-none'}`}
      role="region"
      aria-label="HLS player"
      onMouseMove={showOverlay}
      onMouseEnter={showOverlay}
      onTouchStart={showOverlay}
      onClick={handleContainerClick}
    >
      <video ref={videoRef} controls={false} className="hls-video" preload="none" playsInline />

      <PlayerOverlay
        className={`pointer-events-none transition-opacity duration-300 ${isOverlayVisible ? 'opacity-100' : 'opacity-0'}`}
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
        centerPanel={
          isBuffering && (
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/40">
              <Icon name="spinner" className="h-8 w-8 animate-spin text-white" />
            </div>
          )
        }
        bottomPanel={
          <div className="pointer-events-auto mt-auto bg-gradient-to-t from-black/70 via-black/45 to-transparent pb-3">
            <ChannelDetails />
            <PlayerControls
              isPlaying={isPlaying}
              isMuted={isMuted}
              onPlayPause={handlePlayPause}
              onToggleMute={toggleMute}
              onFullScreen={goFullScreen}
              onVolumeChange={setVolume}
              onPrev={onPrevChannel}
              onNext={onNextChannel}
            />
          </div>
        }
      />
    </div>
  );
};
