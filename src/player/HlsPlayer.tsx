import React, { useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { useIptvPlaylist } from "../stores/use-iptv-playlist";
import { useEpg } from "../stores/use-epg";

export const HlsPlayer: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls>(null);
  const channel = useIptvPlaylist((state) => state.channel!);
  const channelNumber = useIptvPlaylist((state) => state.currentChannel);
  const setChannel = useIptvPlaylist((state) => state.setChannel);
  const epg = useEpg((state) => state.epgStore);
  const currentProgramme = useEpg((state) =>
    state.getCurrentProgramme(channel?.tvg.id || "")
  );
  console.log(epg);
  console.log(channel);
  console.log(currentProgramme);
  const [isPlaying, setIsPlaying] = useState(false);

  // Safely read possibly-untyped playlist fields
  const logoSrc = channel?.tvg?.logo ?? "";
  const channelDisplayName = channel?.name || channel?.tvg?.name || "";
  const programmeTitle = currentProgramme?.title[0]?._value ?? "";

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    // Check if Safari supports playing HLS natively
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      console.log("using native hls");
      video.src = channel.url;
      handlePlay();
      return;
    } else if (Hls.isSupported()) {
      console.log("attaching video");
      const hls = new Hls();
      hlsRef.current = hls;
      hls.loadSource(channel.url);
      hls.attachMedia(video);
      handlePlay();
    } else {
      console.error("nu i pizduy");
    }
    return () => {
      console.log("detaching video");
      hlsRef.current?.destroy();
      hlsRef.current = null;
    };
  }, [videoRef, channel]);

  const handlePlay = () => {
    console.log(hlsRef.current);
    hlsRef.current?.startLoad();
    videoRef.current?.play();
    setIsPlaying(true);
  };

  const handlePause = () => {
    console.log(hlsRef.current);
    hlsRef.current?.stopLoad();
    videoRef.current?.pause();
    setIsPlaying(false);
  };

  const handleBack = () => {
    setChannel(channelNumber - 1);
  };

  const handleNext = () => {
    setChannel(channelNumber + 1);
  };


  return (
    <div
      className={`hls-player show-gradient`}
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

      <div
        className="controls-overlay"
        aria-hidden={isPlaying}
        tabIndex={0}
        role="region"
        aria-label="Player controls"
      >
        <div className="overlay-info" aria-hidden={isPlaying}>
          <div className="channel-meta">
            {logoSrc ? (
              <img
                className="channel-icon"
                src={logoSrc}
                alt={`${channelDisplayName || "Channel"} logo`}
              />
            ) : null}

            <div className="channel-text">
              <div className="channel-name">{channelDisplayName}</div>
              <div className="current-programme">
                🔴&nbsp;
                {currentProgramme?.start && currentProgramme.stop && (
                  <span>
                    [{formatTime(currentProgramme.start)}:
                    {formatTime(currentProgramme.stop)}]&nbsp;
                  </span>
                )}
                {programmeTitle && <span>{programmeTitle}</span>}
              </div>
            </div>
          </div>
          <div className="controls-row">
            <button
              className="play-button"
              onClick={handleBack}
              aria-label="Pause video"
            >
              Back
            </button>
            {isPlaying ? (
              <button
                className="play-button"
                onClick={handlePause}
                aria-label="Pause video"
              >
                Pause
              </button>
            ) : (
              <button
                className="play-button"
                onClick={handlePlay}
                aria-label="Play video"
              >
                Play
              </button>
            )}
            <button
              className="play-button"
              onClick={handleNext}
              aria-label="Pause video"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  return `${hours}:${minutes}`;
}
