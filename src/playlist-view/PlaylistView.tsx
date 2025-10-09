import React from 'react';
import { useIptvPlaylist } from './use-iptv-playlist'; // Adjust the import based on your store file location
import { useNavigate } from 'react-router';

const PlaylistView: React.FC = () => {
  const playlist = useIptvPlaylist(state => state.playlist!);
  const setChannel = useIptvPlaylist(state => state.setChannel!);
  const navigate = useNavigate();
  return (
    <div>
      <h1>Playlist</h1>
      <ul>
        {playlist.items.map((entry, index) => (
          <li key={index} onClick={() => {
            setChannel(entry);
            navigate('/player');
          }}>
            {entry.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PlaylistView;