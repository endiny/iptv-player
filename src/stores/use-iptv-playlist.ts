import type { Playlist, PlaylistItem } from "iptv-playlist-parser";
import { parse } from "iptv-playlist-parser";
import { create } from "zustand";
import { useEpg } from "./use-epg";

interface IptvPlaylistState {
  playlist: Playlist | null;
  channel: PlaylistItem | null;
  currentChannel: number;
  fetchPlaylist: (url: string) => Promise<void>;
  setChannel: (index: number) => void;
  clearPlaylist: () => void;
}
  
export const useIptvPlaylist = create<IptvPlaylistState>((set, get) => {
  const savedPlaylistStr = localStorage.getItem("iptv-playlist");
  let restoredPlaylist: Playlist | null = null;
  if (savedPlaylistStr) {
    restoredPlaylist = JSON.parse(savedPlaylistStr) as Playlist;
    fetchEpgFromPlaylist(restoredPlaylist);
  }
    
  return {
    playlist: restoredPlaylist,
    channel: null,
    currentChannel: 0,
    fetchPlaylist: async (url: string) => {
      try {
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch playlist: ${response.statusText}`);
        }
        let data = await response.text();
        try {
          data = atob(data);
        } catch {
          // Not base64, ignore
        }
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
    setChannel: (index: number) => {
      const size = get().playlist?.items.length ?? 1;
      set({ channel: get().playlist?.items.at(index % size), currentChannel: index % size})
    },
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
