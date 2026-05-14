import type { Playlist, PlaylistItem } from 'iptv-playlist-parser';
import { parse } from 'iptv-playlist-parser';
import { create } from 'zustand';
import { useEpg } from './use-epg';

interface IptvPlaylistState {
  playlist: Playlist | null;
  channel: PlaylistItem | null;
  currentChannel: number;
  error: string | null;
  fetchPlaylist: (url: string) => Promise<void>;
  loadPlaylistFromFile: (file: File) => Promise<void>;
  setChannel: (index: number) => void;
  clearPlaylist: () => void;
}

export const useIptvPlaylist = create<IptvPlaylistState>((set, get) => {
  const savedPlaylistStr = localStorage.getItem('iptv-playlist');
  let restoredPlaylist: Playlist | null = null;
  if (savedPlaylistStr) {
    restoredPlaylist = JSON.parse(savedPlaylistStr) as Playlist;
    queueMicrotask(() => fetchEpgFromPlaylist(restoredPlaylist!));
  }

  return {
    playlist: restoredPlaylist,
    channel: null,
    currentChannel: 0,
    error: null,
    fetchPlaylist: async (url: string) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch playlist: ${response.statusText}`);
        }
        const data = await response.text();
        const parsed = processPlaylistData(data);
        set({ playlist: parsed, error: null });
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Failed to load playlist';
        console.error('Error fetching playlist:', error);
        set({ playlist: null, error: message });
        throw error;
      }
    },
    loadPlaylistFromFile: async (file: File) => {
      try {
        const text = await file.text();
        const parsed = processPlaylistData(text);
        set({ playlist: parsed, error: null });
      } catch (error) {
        console.error('Error loading playlist from file:', error);
        set({ playlist: null });
      }
    },
    setChannel: (index: number) => {
      const size = get().playlist?.items.length ?? 1;
      set({ channel: get().playlist?.items.at(index % size), currentChannel: index % size });
    },
    clearPlaylist: () => {
      localStorage.removeItem('iptv-playlist');
      useEpg.getState().clearEpg();
      set({ playlist: null, channel: null, currentChannel: 0 });
    },
  };
});

function processPlaylistData(data: string): Playlist {
  let text = data;
  try {
    text = atob(data);
  } catch {
    /* not base64 */
  }
  const parsed = parse(text);
  localStorage.setItem('iptv-playlist', JSON.stringify(parsed));
  fetchEpgFromPlaylist(parsed);
  return parsed;
}

function fetchEpgFromPlaylist(playlist: Playlist) {
  const epg = (
    playlist.header.attrs['x-tvg-url'] ??
    (playlist.header.attrs as Record<string, string>)['url-tvg'] ??
    ''
  )
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  useEpg.getState().fetchEpg(epg);
}
