import React, { useEffect, useMemo, useState } from 'react';
import { useIptvPlaylist } from '../stores/use-iptv-playlist';
import { useNavigate } from 'react-router';
import type { PlaylistItem } from 'iptv-playlist-parser';

const CHANNELS_PER_PAGE = 16;
const ALL_CATEGORIES = 'All categories';

type CategorizedChannel = {
  entry: PlaylistItem;
  index: number;
};

const PlaylistView: React.FC = () => {
  const playlist = useIptvPlaylist(state => state.playlist!);
  const setChannel = useIptvPlaylist(state => state.setChannel!);
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    const categoryValues = playlist.items
      .map(channel => getChannelCategory(channel))
      .filter((category): category is string => category.length > 0);

    return [ALL_CATEGORIES, ...Array.from(new Set(categoryValues)).sort((a, b) => a.localeCompare(b))];
  }, [playlist.items]);

  useEffect(() => {
    if (!categories.includes(selectedCategory)) {
      setSelectedCategory(ALL_CATEGORIES);
      setCurrentPage(1);
    }
  }, [categories, selectedCategory]);

  const channels = useMemo<CategorizedChannel[]>(() => {
    return playlist.items
      .map((entry, index) => ({ entry, index }))
      .filter(({ entry }) => {
        if (selectedCategory === ALL_CATEGORIES) {
          return true;
        }

        return getChannelCategory(entry) === selectedCategory;
      });
  }, [playlist.items, selectedCategory]);

  const totalPages = Math.max(1, Math.ceil(channels.length / CHANNELS_PER_PAGE));

  useEffect(() => {
    setCurrentPage(previous => Math.min(previous, totalPages));
  }, [totalPages]);

  const pagedChannels = useMemo(() => {
    const start = (currentPage - 1) * CHANNELS_PER_PAGE;

    return channels.slice(start, start + CHANNELS_PER_PAGE);
  }, [channels, currentPage]);

  const onChannelClick = (index: number) => {
    setChannel(index);
    navigate('/player');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-sm md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Channels</h1>
            <p className="text-sm text-slate-300">Browse by category and open channels instantly.</p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <span className="text-slate-300">Category:</span>
            <select
              className="rounded-md border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-white"
              value={selectedCategory}
              onChange={event => {
                setSelectedCategory(event.target.value);
                setCurrentPage(1);
              }}
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="grid gap-3 md:grid-cols-4">
          {pagedChannels.map(({ entry, index }) => {
            const logoSrc = entry.tvg?.logo ?? '';
            const displayName = entry.name || entry.tvg?.name || 'Unnamed channel';

            return (
              <button
                key={`${index}-${displayName}`}
                className="flex min-h-20 items-center gap-3 rounded-xl border border-white/10 bg-slate-900/70 p-3 text-left transition hover:border-sky-400 hover:bg-slate-800/80 focus-visible:ring-2 focus-visible:ring-sky-400 md:min-h-36 md:flex-col md:justify-between"
                onClick={() => {
                  onChannelClick(index);
                }}
                type="button"
              >
                {logoSrc ? (
                  <img className="h-12 w-12 shrink-0 rounded-md object-cover md:h-16 md:w-16" src={logoSrc} alt={`${displayName} logo`} />
                ) : (
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white/10 text-xl md:h-16 md:w-16">📺</div>
                )}

                <span className="text-sm font-medium text-slate-100 md:text-center md:text-base">{displayName}</span>
              </button>
            );
          })}
        </div>

        {pagedChannels.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/20 bg-slate-900/60 p-6 text-center text-slate-300">
            No channels found for this category.
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl bg-slate-900/70 p-3">
          <button
            className="rounded-md border border-white/20 px-4 py-2 text-sm transition enabled:hover:border-sky-400 enabled:hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => {
              setCurrentPage(page => Math.max(1, page - 1));
            }}
            disabled={currentPage === 1}
            type="button"
          >
            Previous
          </button>

          <span className="text-sm text-slate-300">
            Page {currentPage} / {totalPages} · {channels.length} channels
          </span>

          <button
            className="rounded-md border border-white/20 px-4 py-2 text-sm transition enabled:hover:border-sky-400 enabled:hover:text-sky-300 disabled:cursor-not-allowed disabled:opacity-40"
            onClick={() => {
              setCurrentPage(page => Math.min(totalPages, page + 1));
            }}
            disabled={currentPage === totalPages}
            type="button"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

function getChannelCategory(channel: PlaylistItem): string {
  const channelRecord = channel as PlaylistItem & {
    group?: { title?: string };
    groupTitle?: string;
    attrs?: Record<string, string>;
  };

  return (
    channelRecord.group?.title ??
    channelRecord.groupTitle ??
    channelRecord.attrs?.['group-title'] ??
    ''
  ).trim();
}

export default PlaylistView;
