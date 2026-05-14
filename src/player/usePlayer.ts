import Hls from "hls.js";
import type { PlaylistItem } from "iptv-playlist-parser";
import { useCallback, useEffect, useRef, useState } from "react";

const STALE_PAUSE_THRESHOLD_MS = 5000;

export function usePlayer(channel: PlaylistItem | null) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isBuffering, setIsBuffering] = useState(false);
  const pausedAtRef = useRef<number | null>(null);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current || !channel) return;

    if (!videoRef.current.paused) {
      videoRef.current.pause();
      hlsRef.current?.stopLoad();
      pausedAtRef.current = Date.now();
      setIsPlaying(false);
    } else {
      const pausedDuration = pausedAtRef.current !== null ? Date.now() - pausedAtRef.current : 0;
      pausedAtRef.current = null;

      if (pausedDuration >= STALE_PAUSE_THRESHOLD_MS && hlsRef.current) {
        // Buffer is stale; destroy and reload from the live edge
        hlsRef.current.destroy();
        const hls = new Hls();
        hlsRef.current = hls;
        hls.loadSource(channel.url);
        hls.attachMedia(videoRef.current);
        hls.startLoad(-1);
      } else {
        hlsRef.current?.startLoad();
      }

      videoRef.current.play().catch((err) => console.warn("Autoplay blocked:", err));
      setIsPlaying(true);
    }
  }, [channel]);

  const setVolume = (volume: number) =>
    videoRef.current && (videoRef.current.volume = volume);

  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel) return;

    setIsPlaying(false);
    setIsBuffering(true);

    const onWaiting = () => setIsBuffering(true);
    const onPlaying = () => setIsBuffering(false);
    const onVolumeChange = () => setIsMuted(video.muted);

    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('volumechange', onVolumeChange);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = channel.url;
      video.play().catch((err) => console.warn("Autoplay blocked:", err));
      setIsPlaying(true);
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);
      hls.startLoad();
      video.play().catch((err) => console.warn("Autoplay blocked:", err));
      setIsPlaying(true);
    } else {
      console.error("HLS is not supported by this browser");
    }

    return () => {
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('volumechange', onVolumeChange);
      hlsRef.current?.destroy();
      hlsRef.current = null;
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [channel]);

  return { videoRef, isPlaying, isMuted, isBuffering, handlePlayPause, setVolume, toggleMute };
}
