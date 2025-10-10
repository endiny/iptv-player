import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { useIptvPlaylist } from '../stores/use-iptv-playlist';
import { useEpg } from '../stores/use-epg';

export const HlsPlayer: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const channel = useIptvPlaylist(state => state.channel!);
    const epg = useEpg(state => state.epgStore);
    const currentProgramme = useEpg(state => state.getCurrentProgramme(channel?.tvg.id || ''));
    console.log(epg);
    console.log(channel);
    console.log(currentProgramme);
    const [isPlaying, setIsPlaying] = useState(false);

    // Safely read possibly-untyped playlist fields
    const logoSrc = channel?.tvg?.logo ?? '';
    const channelDisplayName = channel?.name || channel?.tvg?.name || '';
    const programmeTitle = currentProgramme?.title[0]?._value ?? '';

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
        <div
            className={`hls-player show-gradient`}
            role="region"
            aria-label="HLS player"
        >
            <video
                ref={videoRef}
                controls={false}
                className="hls-video"
                style={{ background: '#000' }}
            />

            <div
                className="controls-overlay"
                aria-hidden={isPlaying}
                tabIndex={0}
                role="region"
                aria-label="Player controls"
            >
                <div className="overlay-info" aria-hidden={isPlaying}>
                    <div className='channel-meta'>
                        {logoSrc ? (
                            <img className="channel-icon" src={logoSrc} alt={`${channelDisplayName || 'Channel'} logo`} />
                        ) : null}

                        <div className="channel-text">
                            <div className="channel-name">{channelDisplayName}</div>
                            <div className="current-programme">
                                🔴&nbsp;
                                {(currentProgramme?.start && currentProgramme.stop) && <span>[{formatTime(currentProgramme.start)}:{formatTime(currentProgramme.stop)}]&nbsp;</span>}
                                {programmeTitle && <span>{programmeTitle}</span>}
                            </div>
                        </div>
                    </div>
                    <div className="controls-row">
                        {isPlaying ? (
                            <button className="play-button" onClick={handlePause} aria-label="Pause video">Pause</button>
                        ) : (
                            <button className="play-button" onClick={handlePlay} aria-label="Play video">Play</button>
                        )}
                    </div>
                </div>


            </div>
        </div>
    );
};

function formatTime(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
}