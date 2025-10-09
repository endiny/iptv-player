import React, { useState } from 'react';
import parser from 'iptv-playlist-parser';
import { useIptvPlaylist } from './use-iptv-playlist';

const PlaylistUpload: React.FC = () => {
  const { fetchPlaylist } = useIptvPlaylist();
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [playlistData, setPlaylistData] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFetchPlaylist = async () => {
    setError(null);
    setPlaylistData(null);

    try {
      fetchPlaylist(playlistUrl);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Playlist Upload</h1>
      <div>
        <input
          type="text"
          placeholder="Enter playlist URL"
          value={playlistUrl}
          onChange={(e) => setPlaylistUrl(e.target.value)}
          style={{ width: '300px', marginRight: '10px' }}
        />
        <button onClick={handleFetchPlaylist}>Load</button>
      </div>
      {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      {playlistData && (
        <pre
          style={{
            backgroundColor: '#f4f4f4',
            padding: '10px',
            borderRadius: '5px',
            marginTop: '10px',
          }}
        >
          {playlistData}
        </pre>
      )}
    </div>
  );
};

export default PlaylistUpload;