import Hls from "hls.js";
import type { PlaylistItem } from "iptv-playlist-parser";
import { useCallback, useEffect, useRef, useState } from "react";

export function usePlayer(channel: PlaylistItem | null) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = useCallback(() => {
    if (!videoRef.current || !channel) {
      return;
    }

    if (isPlaying) {
      videoRef.current.pause();
      hlsRef.current?.stopLoad();
    } else {
      hlsRef.current?.startLoad();
      videoRef.current.play();
    }
    setIsPlaying(!isPlaying);
  }, [channel, isPlaying]);

  const setVolume = (volume: number) =>
    videoRef.current && (videoRef.current.volume = volume);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !channel) return;

    setIsPlaying(false);

    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = channel.url;
      video.play();
      setIsPlaying(true);
    } else if (Hls.isSupported()) {
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);
      hls.startLoad();
      video.play();
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
      setIsPlaying(false);
    };
  }, [channel]);

  return { videoRef, isPlaying, handlePlayPause, setVolume };
}
