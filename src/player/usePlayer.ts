import Hls from "hls.js";
import type { PlaylistItem } from "iptv-playlist-parser";
import { useCallback, useEffect, useRef, useState } from "react";

export function usePlayer(channel: PlaylistItem) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handlePlayPause = useCallback(() => {
    if (isPlaying) {
      videoRef.current?.pause();
      hlsRef.current?.stopLoad();
    } else {
      hlsRef.current?.startLoad();
      videoRef.current?.play();
    }
    setIsPlaying(!isPlaying);
    console.log(hlsRef.current);
  }, [isPlaying]);
  const setVolume = (volume: number) => videoRef.current && (videoRef.current.volume = volume);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    setIsPlaying(false);
    // Check if Safari supports playing HLS natively
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("using native hls");
      video.src = channel.url;
      handlePlayPause();
      return;
    } else if (Hls.isSupported()) {
      console.log("attaching video");
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);
      handlePlayPause();
    } else {
      console.error("nu i pizduy");
    }
    return () => {
      console.log("detaching video");
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [channel]);

  return { videoRef, isPlaying, handlePlayPause, setVolume};
}