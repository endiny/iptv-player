import React from 'react';
import { Link, useNavigate } from 'react-router';
import { useIptvPlaylist } from '../stores/use-iptv-playlist';

const Settings: React.FC = () => {
  const clearPlaylist = useIptvPlaylist(state => state.clearPlaylist);
  const navigate = useNavigate();

  const handleRemovePlaylist = () => {
    clearPlaylist();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 text-white md:p-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-sm md:p-6">
        <div className="flex items-center gap-4">
          <Link
            to="/"
            className="text-sm text-slate-400 transition hover:text-white"
          >
            ← Back
          </Link>
          <h1 className="text-3xl font-bold">Settings</h1>
        </div>

        <div className="flex items-center justify-between rounded-xl border border-white/10 bg-slate-900/70 p-4">
          <div>
            <p className="font-medium">Remove current playlist</p>
            <p className="text-sm text-slate-400">Clears the loaded playlist and returns to the upload screen.</p>
          </div>
          <button
            type="button"
            onClick={handleRemovePlaylist}
            className="rounded-md border border-red-500/40 bg-red-500/10 px-4 py-2 text-sm text-red-400 transition hover:border-red-400 hover:bg-red-500/20 hover:text-red-300"
          >
            Remove
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
