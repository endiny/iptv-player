import React, { useEffect, useMemo, useState } from 'react';
import { useIptvPlaylist } from '../stores/use-iptv-playlist';
import { useNavigate, Link } from 'react-router';
import type { PlaylistItem } from 'iptv-playlist-parser';
import { ChannelCard } from './ChannelCard';
import { getChannelCategory } from './playlist-utils';

const CHANNELS_PER_PAGE = 16;
const ALL_CATEGORIES = 'All categories';
const paginationButtonClass =
  'rounded-md border border-white/20 px-4 py-2.5 text-sm transition enabled:hover:border-sky-400 enabled:hover:text-sky-300 enabled:active:border-sky-400 enabled:active:text-sky-200 disabled:cursor-not-allowed disabled:opacity-40';

type CategorizedChannel = {
  entry: PlaylistItem;
  index: number;
};

const PlaylistView: React.FC = () => {
  const playlist = useIptvPlaylist((state) => state.playlist!);
  const setChannel = useIptvPlaylist((state) => state.setChannel);
  const navigate = useNavigate();

  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES);
  const [currentPage, setCurrentPage] = useState(1);

  const categories = useMemo(() => {
    const categoryValues = playlist.items
      .map((channel) => getChannelCategory(channel))
      .filter((category): category is string => category.length > 0);

    return [
      ALL_CATEGORIES,
      ...Array.from(new Set(categoryValues)).sort((a, b) => a.localeCompare(b)),
    ];
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
    setCurrentPage((previous) => Math.min(previous, totalPages));
  }, [totalPages]);

  const pagedChannels = useMemo(() => {
    const start = (currentPage - 1) * CHANNELS_PER_PAGE;

    return channels.slice(start, start + CHANNELS_PER_PAGE);
  }, [channels, currentPage]);

  const onChannelClick = (index: number) => {
    setChannel(index);
    navigate(`/player?ch=${index}`);
  };

  return (
    <div className="min-h-dvh bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-sm md:p-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Channels</h1>
            <p className="text-sm text-slate-300">
              Browse by category and open channels instantly.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="flex min-w-0 flex-1 items-center gap-2 text-sm sm:flex-none">
              <span className="shrink-0 text-slate-300">Category:</span>
              <select
                className="min-w-0 flex-1 rounded-md border border-white/20 bg-slate-900/80 px-3 py-2 text-sm text-white sm:flex-none"
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value);
                  setCurrentPage(1);
                }}
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
            <Link
              to="/settings"
              className="rounded-md border border-white/20 px-3 py-2 text-sm text-slate-300 transition hover:border-sky-400 hover:text-sky-300 active:border-sky-400 active:text-sky-200"
            >
              Settings
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {pagedChannels.map(({ entry, index }) => (
            <ChannelCard
              key={`${index}-${entry.name}`}
              entry={entry}
              index={index}
              onClick={onChannelClick}
            />
          ))}
        </div>

        {pagedChannels.length === 0 && (
          <div className="rounded-xl border border-dashed border-white/20 bg-slate-900/60 p-6 text-center text-slate-300">
            No channels found for this category.
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-slate-900/70 p-3">
          <button
            className={`${paginationButtonClass} order-1`}
            onClick={() => {
              setCurrentPage((page) => Math.max(1, page - 1));
            }}
            disabled={currentPage === 1}
            type="button"
          >
            Previous
          </button>

          <span className="order-3 w-full text-center text-sm text-slate-300 sm:order-2 sm:w-auto">
            Page {currentPage} / {totalPages} · {channels.length} channels
          </span>

          <button
            className={`${paginationButtonClass} order-2 sm:order-3`}
            onClick={() => {
              setCurrentPage((page) => Math.min(totalPages, page + 1));
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

export default PlaylistView;
