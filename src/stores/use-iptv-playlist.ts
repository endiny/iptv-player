import type { Playlist, PlaylistItem } from "iptv-playlist-parser";
import { parse } from "iptv-playlist-parser";
import { create } from "zustand";
import { useEpg } from "./use-epg";

interface IptvPlaylistState {
  playlist: Playlist | null;
  channel: PlaylistItem | null;
  fetchPlaylist: (url: string) => Promise<void>;
  setChannel: (channel: PlaylistItem) => void;
  clearPlaylist: () => void;
}
  
export const useIptvPlaylist = create<IptvPlaylistState>((set) => {
  const savedPlaylistStr = localStorage.getItem("iptv-playlist");
  let restoredPlaylist: Playlist | null = null;
  if (savedPlaylistStr) {
    restoredPlaylist = JSON.parse(savedPlaylistStr) as Playlist;
    fetchEpgFromPlaylist(restoredPlaylist);
  }
    
  return {
    playlist: restoredPlaylist,
    channel: null,
    fetchPlaylist: async (url: string) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch playlist: ${response.statusText}`);
        }
        const data = await response.text();
        const parsed = parse(data);
        localStorage.setItem("iptv-playlist", JSON.stringify(parsed));
        fetchEpgFromPlaylist(parsed);

        set({
          playlist: parsed,
        });
      } catch (error) {
        console.error("Error fetching playlist:", error);
        set({ playlist: null });
      }
    },
    setChannel: (channel: PlaylistItem) => set({ channel }),
    clearPlaylist: () => set({ playlist: null }),
  };
});

function fetchEpgFromPlaylist(playlist: Playlist) {
  const epg = (playlist.header.attrs["x-tvg-url"] ?? (playlist.header.attrs as Record<string, string>)["url-tvg"] ?? '')
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
  useEpg.getState().fetchEpg(epg);
}
