import Hls from "hls.js";
import type { PlaylistItem } from "iptv-playlist-parser";
import { useCallback, useEffect, useRef, useState } from "react";

export function usePlayer(channel: PlaylistItem | null) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current || !channel) return;

    if (!videoRef.current.paused) {
      videoRef.current.pause();
      hlsRef.current?.stopLoad();
      setIsPlaying(false);
    } else {
      hlsRef.current?.startLoad();
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
      hlsRef.current?.destroy();
      hlsRef.current = null;
      video.pause();
      video.removeAttribute("src");
      video.load();
    };
  }, [channel]);

  return { videoRef, isPlaying, handlePlayPause, setVolume, toggleMute };
}
