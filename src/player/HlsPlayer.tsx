import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useIptvPlaylist } from '../stores/use-iptv-playlist';
import { useEpg } from '../stores/use-epg';

export const HlsPlayer: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const channel = useIptvPlaylist(state => state.channel!);
    const epg = useEpg(state => state.epgStore);
    console.log(epg);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        // Check if Safari supports playing HLS natively
        if (video.canPlayType('application/vnd.apple.mpegurl')) {
            console.log('using native hls');
            video.src = channel.url;
            handlePlay();
            return;
        } else if (Hls.isSupported()) {
            console.log('attaching video');
            const hls = new Hls();
            hls.loadSource(channel.url);
            hls.attachMedia(video);
            handlePlay();
        } else {
            console.error('nu i pizduy');
        }
        
    }, [videoRef, channel]);

    const handlePlay = () => {
        videoRef.current?.play();
        setIsPlaying(true);
    };

    const handlePause = () => {
        videoRef.current?.pause();
        setIsPlaying(false);
    };

    return (
        <div className="hls-player" role="region" aria-label="HLS player">
            <video
                ref={videoRef}
                controls={false}
                className="hls-video"
                style={{ background: '#000' }}
            />

            <div className="controls-overlay" aria-hidden={isPlaying}>
                {isPlaying ? (
                    <button className="play-button" onClick={handlePause} aria-label="Pause video">Pause</button>
                ) : (
                    <button className="play-button" onClick={handlePlay} aria-label="Play video">Play</button>
                )}
            </div>
        </div>
    );
};
