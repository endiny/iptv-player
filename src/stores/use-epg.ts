import type { Xmltv, XmltvProgramme } from "@iptv/xmltv";
import { parseXmltv } from "@iptv/xmltv";
import { create } from "zustand";

interface EpgState {
  epgStore: ProgrammesIndex | null;
  customMappers: Record<string, string>;
  getCurrentProgramme: (channelId: string) => XmltvProgramme | null;
  setCustomMappers: (mappers: Record<string, string>) => void;
  fetchEpg: (urls: readonly string[]) => Promise<void>;
  clearEpg: () => void;
  clearMappers: () => void;
}

export const useEpg = create<EpgState>((set, get) => {
  return {
    epgStore: null,
    customMappers: {},
    fetchEpg: async (urls: readonly string[]) => {
      const newEpgStore: Record<string, Xmltv> = {};

      if (!urls || urls.length === 0) {
        return;
      }

      const fetchPromises = urls.map((url) =>
        fetch(url)
          .then((res) => ({ res, url }))
      );

      const settled = await Promise.allSettled(fetchPromises);

      for (const s of settled) {
        if (s.status === 'rejected') {
          console.error('Failed to fetch EPG (network/error):', s.reason);
          continue;
        }

        const { res, url } = s.value;
        if (!res.ok) {
          console.error(`Failed to fetch EPG at ${url}: ${res.status} ${res.statusText}`);
          continue;
        }

        const data = await res.text();
        try {
          const parsed = await parseXmltv(data);
          newEpgStore[url] = parsed;
        } catch (error) {
          console.error(`Error parsing EPG data from ${url}:`, error);
        }
      }

      console.log(newEpgStore);
      set(() => ({ epgStore: createProgrammesIndex(newEpgStore) }));
    },
    getCurrentProgramme: (channelId: string) => {
      const store = get().epgStore;
      if (!store) return null;
      return getCurrentProgrammeForChannel(channelId, store);
    },
    setCustomMappers: (customMappers: Record<string, string>) => {
      set({ customMappers });
    },
    clearEpg: () => {
      set({ epgStore: null });
    },
    clearMappers: () => {
      set({ customMappers: {} });
    },
  };
});

type ProgrammesIndex = ReadonlyMap<string, ReadonlyMap<string, readonly XmltvProgramme[]>>;

function createProgrammesIndex(epgStore: Record<string, Xmltv>): ProgrammesIndex {
  const res = new Map<string, ReadonlyMap<string, XmltvProgramme[]>>();

  for (const [k, v] of Object.entries(epgStore)) {
    const index = new Map<string, XmltvProgramme[]>();
    for (const programme of (v.programmes ?? [])) {
      const channelId = programme.channel;
      const existing = index.get(channelId) ?? [];
      existing.push(programme);
      index.set(channelId, existing);
    }
    res.set(k, index);
  }

  return res;
}

function getCurrentProgrammeForChannel(channelId: string, programmesIndex: ProgrammesIndex): XmltvProgramme | null {
  const now = new Date();
  for (const programmesMap of programmesIndex.values()) {
    const programmes = programmesMap.get(channelId);
    if (!programmes) continue;
    // Programmes are sorted by start time, so we can do a binary search
    let left = 0;
    let right = programmes.length - 1;
    while (left <= right) {
      const mid = Math.floor((left + right) / 2);
      const programme = programmes[mid];
      const start = new Date(programme.start);
      const end = new Date(programme.stop!);
      if (now >= start && now <= end) {
        return programme;
      }
      if (now < start) {
        right = mid - 1;
      } else {
        left = mid + 1;
      }
    }
  }
  return null;
}
