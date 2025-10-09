import React from 'react';
import { useIptvPlaylist } from './use-iptv-playlist'; // Adjust the import path as necessary
import PlaylistUpload from './PlaylistUpload';
import PlaylistView from './PlaylistView';

const Main: React.FC = () => {
  const { playlist } = useIptvPlaylist();

  return playlist ? <PlaylistView /> : <PlaylistUpload />;
};

export default Main;