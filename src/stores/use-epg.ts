import type { Xmltv } from "@iptv/xmltv";
import { parseXmltv } from "@iptv/xmltv";
import { create } from "zustand";

interface EpgState {
  epgStore: Record<string, Xmltv>; 
  customMappers: Record<string, string>;
  setCustomMappers: (mappers: Record<string, string>) => void;
  fetchEpg: (urls: readonly string[]) => Promise<void>;
  clearEpg: () => void;
  clearMappers: () => void;
}

export const useEpg = create<EpgState>((set) => {
  return {
    epgStore: {},
    customMappers: {},
    fetchEpg: async (urls: readonly string[]) => {
      const newEpgStore: Record<string, Xmltv> = {};
      await Promise.all(
        urls.map(async (url) => {
          try {
            const response = await fetch(url);
            if (!response.ok) {
              throw new Error(`Failed to fetch EPG: ${response.statusText}`);
            }
            const data = await response.text();
            const parsed = await parseXmltv(data);
            newEpgStore[url] = parsed;
          } catch (error) {
            console.error(`Error fetching EPG from ${url}:`, error);
          }
        })
      );
      set(() => ({
        epgStore: newEpgStore,
      }));
    },
    setCustomMappers: (customMappers: Record<string, string>) => {
      set({ customMappers });
    },
    clearEpg: () => {
      set({ epgStore: {} });
    },
    clearMappers: () => {
      set({ customMappers: {} });
    },
  };
});