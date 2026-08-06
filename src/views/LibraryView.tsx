import React, { useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { usePlayer } from '../context/PlayerContext';
import { SongRow } from '../components/SongRow';
import { SongCard } from '../components/SongCard';
import { triggerDownloadFile } from '../utils/helpers';
import {
  Heart,
  HardDriveDownload,
  ListMusic,
  Clock,
  Plus,
  Trash2,
  Play,
  Music,
  Download,
  CheckCircle2,
} from 'lucide-react';

export const LibraryView: React.FC = () => {
  const {
    likedSongs,
    downloadHistory,
    clearDownloadHistory,
    customPlaylists,
    createPlaylist,
    deletePlaylist,
    recentlyPlayed,
    activeViewData,
    showToast,
  } = useFavorites();

  const { playSong } = usePlayer();

  const initialTab = activeViewData?.tab || 'liked';
  const [activeTab, setActiveTab] = useState<'liked' | 'downloads' | 'playlists' | 'recent'>(initialTab);

  const [newPlaylistName, setNewPlaylistName] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreatePlaylist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;
    createPlaylist(newPlaylistName.trim());
    setNewPlaylistName('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Your Music Library</h1>
          <p className="text-xs text-zinc-400 mt-1">Manage your liked songs, playlists, and download logs</p>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center gap-1.5 p-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('liked')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'liked' ? 'bg-rose-500 text-white shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" /> Liked ({likedSongs.length})
          </button>

          <button
            onClick={() => setActiveTab('downloads')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'downloads' ? 'bg-emerald-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <HardDriveDownload className="w-3.5 h-3.5" /> Downloads ({downloadHistory.length})
          </button>

          <button
            onClick={() => setActiveTab('playlists')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'playlists' ? 'bg-cyan-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" /> Playlists ({customPlaylists.length})
          </button>

          <button
            onClick={() => setActiveTab('recent')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'recent' ? 'bg-teal-500 text-black shadow-md' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Clock className="w-3.5 h-3.5" /> History
          </button>
        </div>
      </div>

      {/* LIKED SONGS TAB */}
      {activeTab === 'liked' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500 fill-rose-500" /> Favorite Tracks
            </h2>
            {likedSongs.length > 0 && (
              <button
                onClick={() => playSong(likedSongs[0], likedSongs, 0)}
                className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
              >
                <Play className="w-3.5 h-3.5 fill-black" /> Play All
              </button>
            )}
          </div>

          {likedSongs.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800 text-zinc-500 space-y-2">
              <Heart className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="font-medium text-sm text-zinc-400">No liked songs yet</p>
              <p className="text-xs">Click the heart icon on any song to save it here.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {likedSongs.map((song, idx) => (
                <SongRow key={song.id} song={song} index={idx} playlistQueue={likedSongs} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* DOWNLOAD HISTORY TAB */}
      {activeTab === 'downloads' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HardDriveDownload className="w-5 h-5 text-emerald-400" /> Download Log
            </h2>
            {downloadHistory.length > 0 && (
              <button
                onClick={clearDownloadHistory}
                className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Trash2 className="w-3.5 h-3.5" /> Clear History
              </button>
            )}
          </div>

          {downloadHistory.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800 text-zinc-500 space-y-2">
              <HardDriveDownload className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="font-medium text-sm text-zinc-400">No downloads recorded</p>
              <p className="text-xs">Downloaded MP3 tracks will be listed here for quick access.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {downloadHistory.map(item => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 text-white"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <img src={item.imageUrl} alt="" className="w-12 h-12 rounded-xl object-cover shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm truncate">{item.songName}</h4>
                      <p className="text-xs text-zinc-400 truncate">{item.artistName}</p>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 mt-0.5">
                        <span className="text-emerald-400 font-bold">{item.quality} MP3</span>
                        <span>•</span>
                        <span>{item.downloadedAt}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      triggerDownloadFile(item.url, `${item.songName} (${item.quality}).mp3`);
                      showToast(`Re-downloading ${item.songName}...`);
                    }}
                    className="px-3 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold flex items-center gap-1.5 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Re-Download
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* CUSTOM PLAYLISTS TAB */}
      {activeTab === 'playlists' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <ListMusic className="w-5 h-5 text-cyan-400" /> Personal Playlists
            </h2>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 rounded-xl bg-emerald-500 text-black font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" /> New Playlist
            </button>
          </div>

          {customPlaylists.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800 text-zinc-500 space-y-2">
              <ListMusic className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="font-medium text-sm text-zinc-400">No playlists created</p>
              <p className="text-xs">Create custom playlists to organize your downloaded music.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {customPlaylists.map(pl => (
                <div key={pl.id} className="p-5 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                    <div>
                      <h3 className="font-extrabold text-base text-white">{pl.name}</h3>
                      <p className="text-xs text-zinc-400">
                        {pl.songs.length} Tracks • Created {pl.createdAt}
                      </p>
                    </div>
                    <button
                      onClick={() => deletePlaylist(pl.id)}
                      className="p-2 text-zinc-500 hover:text-rose-400 transition"
                      title="Delete playlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {pl.songs.length === 0 ? (
                    <p className="text-xs text-zinc-500 italic">No songs in this playlist yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {pl.songs.map((song, idx) => (
                        <SongRow key={song.id} song={song} index={idx} playlistQueue={pl.songs} />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Modal to create playlist */}
          {showCreateModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
              <div className="relative w-full max-w-sm p-6 rounded-3xl bg-zinc-900 border border-zinc-800 text-white shadow-2xl">
                <h3 className="font-bold text-lg mb-4">Create New Playlist</h3>
                <form onSubmit={handleCreatePlaylist} className="space-y-4">
                  <input
                    type="text"
                    placeholder="Playlist Name..."
                    value={newPlaylistName}
                    onChange={e => setNewPlaylistName(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl bg-zinc-800 border border-zinc-700 text-sm text-white focus:outline-none focus:border-emerald-500"
                    autoFocus
                  />
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
                      className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={!newPlaylistName.trim()}
                      className="px-4 py-2 rounded-xl bg-emerald-500 text-black text-xs font-bold disabled:opacity-50"
                    >
                      Create
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* RECENTLY PLAYED TAB */}
      {activeTab === 'recent' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-400" /> Recently Played
          </h2>

          {recentlyPlayed.length === 0 ? (
            <div className="p-12 text-center rounded-3xl bg-zinc-900/40 border border-zinc-800 text-zinc-500 space-y-2">
              <Clock className="w-10 h-10 mx-auto text-zinc-600" />
              <p className="font-medium text-sm text-zinc-400">No recently played tracks</p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentlyPlayed.map((song, idx) => (
                <SongRow key={song.id} song={song} index={idx} playlistQueue={recentlyPlayed} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
