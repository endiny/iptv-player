import React from 'react';
import type { PlaylistItem } from 'iptv-playlist-parser';

interface ChannelCardProps {
  entry: PlaylistItem;
  index: number;
  onClick: (index: number) => void;
}

export const ChannelCard: React.FC<ChannelCardProps> = ({ entry, index, onClick }) => {
  const logoSrc = entry.tvg?.logo ?? '';
  const displayName = entry.name || entry.tvg?.name || 'Unnamed channel';

  return (
    <button
      className="flex min-h-20 items-center gap-3 rounded-xl border border-white/10 bg-slate-900/70 p-3 text-left transition hover:border-sky-400 hover:bg-slate-800/80 focus-visible:ring-2 focus-visible:ring-sky-400 active:border-sky-400 active:bg-slate-800/80 md:min-h-36 md:flex-col md:justify-between"
      onClick={() => onClick(index)}
      type="button"
    >
      {logoSrc ? (
        <img
          className="h-12 w-12 shrink-0 rounded-md object-cover md:h-16 md:w-16"
          src={logoSrc}
          alt={`${displayName} logo`}
        />
      ) : (
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-white/10 text-xl md:h-16 md:w-16">
          📺
        </div>
      )}

      <span className="text-sm font-medium text-slate-100 md:text-center md:text-base">
        {displayName}
      </span>
    </button>
  );
};
