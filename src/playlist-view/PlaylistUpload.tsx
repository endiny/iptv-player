import React, { useState } from 'react';
import { useIptvPlaylist } from '../stores/use-iptv-playlist';

type Mode = 'url' | 'file';

const PlaylistUpload: React.FC = () => {
  const { fetchPlaylist, loadPlaylistFromFile } = useIptvPlaylist();
  const [mode, setMode] = useState<Mode>('url');
  const [playlistUrl, setPlaylistUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const switchMode = (next: Mode) => {
    setMode(next);
    setError(null);
  };

  const handleFetchPlaylist = async () => {
    const normalizedUrl = playlistUrl.trim();

    if (!normalizedUrl) {
      setError('Please provide a playlist URL.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await fetchPlaylist(normalizedUrl);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error while loading playlist.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileLoad = async () => {
    if (!selectedFile) {
      setError('Please select a file.');
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      await loadPlaylistFromFile(selectedFile);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Unexpected error while loading playlist.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white md:p-8">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] w-full max-w-6xl items-center justify-center md:min-h-[calc(100vh-4rem)]">
        <div className="w-full max-w-2xl rounded-3xl border border-white/10 bg-white/5 p-6 text-center shadow-2xl backdrop-blur-sm md:p-8">
          <h1 className="text-3xl font-bold md:text-4xl">IPTV Playlist</h1>
          <p className="mt-2 text-sm text-slate-300 md:text-base">
            Load your M3U or provider playlist to browse channels.
          </p>

          <div className="mt-6 flex justify-center">
            <div className="flex overflow-hidden rounded-lg border border-white/20">
              <button
                type="button"
                onClick={() => switchMode('url')}
                className={`px-5 py-2 text-sm font-semibold transition ${
                  mode === 'url'
                    ? 'bg-sky-500/30 text-sky-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                URL
              </button>
              <button
                type="button"
                onClick={() => switchMode('file')}
                className={`px-5 py-2 text-sm font-semibold transition ${
                  mode === 'file'
                    ? 'bg-sky-500/30 text-sky-100'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                File
              </button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
            {mode === 'url' ? (
              <>
                <input
                  className="h-11 flex-1 rounded-xl border border-white/20 bg-slate-900/80 px-4 text-sm text-white placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  type="url"
                  placeholder="https://example.com/playlist.m3u"
                  value={playlistUrl}
                  onChange={event => setPlaylistUrl(event.target.value)}
                />
                <button
                  className="h-11 rounded-xl border border-sky-300/40 bg-sky-500/20 px-5 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/35 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleFetchPlaylist}
                  disabled={isLoading}
                  type="button"
                >
                  {isLoading ? 'Loading…' : 'Load playlist'}
                </button>
              </>
            ) : (
              <>
                <input
                  className="flex-1 rounded-xl border border-white/20 bg-slate-900/80 px-4 py-2.5 text-sm text-white file:mr-3 file:rounded-lg file:border-0 file:bg-slate-700 file:px-3 file:py-1 file:text-sm file:font-medium file:text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                  type="file"
                  accept=".m3u,.m3u8"
                  onChange={event => setSelectedFile(event.target.files?.[0] ?? null)}
                />
                <button
                  className="h-11 rounded-xl border border-sky-300/40 bg-sky-500/20 px-5 text-sm font-semibold text-sky-100 transition hover:bg-sky-500/35 disabled:cursor-not-allowed disabled:opacity-50"
                  onClick={handleFileLoad}
                  disabled={isLoading || !selectedFile}
                  type="button"
                >
                  {isLoading ? 'Loading…' : 'Load playlist'}
                </button>
              </>
            )}
          </div>

          {error && <p className="mt-4 rounded-lg border border-rose-400/30 bg-rose-500/15 px-3 py-2 text-sm text-rose-200">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default PlaylistUpload;
