import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useHlsSupported } from './hls-hooks';

const STREAM_URL = '';

export const HlsPlayer: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;
        if (useHlsSupported()) {
            console.log('attaching video');
            const hls = new Hls();
            hls.loadSource(STREAM_URL);
            hls.attachMedia(video);
        }
        
    }, [videoRef]);

    const handlePlay = () => {
        videoRef.current?.play();
        setIsPlaying(true);
    };

    const handlePause = () => {
        videoRef.current?.pause();
        setIsPlaying(false);
    };

    const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (videoRef.current) {
            videoRef.current.currentTime = Number(e.target.value);
        }
    };

    return (
        <div className="hls-player" role="region" aria-label="HLS player">
            <video
                ref={videoRef}
                src={STREAM_URL}
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
