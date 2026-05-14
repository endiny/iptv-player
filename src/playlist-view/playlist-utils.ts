import type { PlaylistItem } from 'iptv-playlist-parser';

export function getChannelCategory(channel: PlaylistItem): string {
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
