import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useFavorites } from '../context/FavoritesContext';
import {
  getBestImage,
  getPrimaryArtists,
  formatDuration,
} from '../utils/helpers';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Download,
  ListMusic,
  Sparkles,
  Music,
  Trash2,
} from 'lucide-react';

export const PlayerModal: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    playbackQuality,
    repeatMode,
    isShuffle,
    queue,
    currentIndex,
    isPlayerModalOpen,
    setIsPlayerModalOpen,
    togglePlayPause,
    seek,
    playNext,
    playPrevious,
    toggleShuffle,
    cycleRepeat,
    openDownloadModal,
    playSong,
    removeFromQueue,
    clearQueue,
  } = usePlayer();

  const [activeTab, setActiveTab] = useState<'player' | 'queue'>('player');

  if (!isPlayerModalOpen || !currentSong) return null;

  const imageUrl = getBestImage(currentSong.image, '500x500');
  const artistNames = getPrimaryArtists(currentSong);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-6 bg-black/90 backdrop-blur-2xl text-white animate-fade-in overflow-hidden">
      {/* Dynamic Background Blur Artwork */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 filter blur-3xl scale-125">
        <img src={imageUrl} alt="" className="w-full h-full object-cover" />
      </div>

      <div className="relative w-full h-full max-w-4xl max-h-[92vh] sm:rounded-3xl bg-zinc-950/80 border border-zinc-800/80 shadow-2xl flex flex-col justify-between overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800/80">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('player')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeTab === 'player' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white bg-zinc-900'
              }`}
            >
              Now Playing
            </button>
            <button
              onClick={() => setActiveTab('queue')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                activeTab === 'queue' ? 'bg-emerald-500 text-black' : 'text-zinc-400 hover:text-white bg-zinc-900'
              }`}
            >
              <ListMusic className="w-3.5 h-3.5" />
              <span>Queue ({queue.length})</span>
            </button>
          </div>

          <button
            onClick={() => setIsPlayerModalOpen(false)}
            className="p-2.5 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'player' ? (
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 h-full max-w-3xl mx-auto py-4">
              {/* Artwork */}
              <div className="relative group shrink-0 w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl border border-zinc-800/80">
                <img src={imageUrl} alt={currentSong.name} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-80" />
                <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-emerald-400 font-bold text-xs border border-emerald-500/30">
                    {playbackQuality} MP3
                  </span>
                  <button
                    onClick={() => openDownloadModal(currentSong)}
                    className="p-2.5 rounded-full bg-emerald-500 text-black font-bold shadow-lg hover:scale-105 transition cursor-pointer"
                    title="Download Song"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Song Meta & Controls */}
              <div className="flex-1 w-full space-y-6 text-center md:text-left min-w-0">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
                    <Sparkles className="w-3 h-3" /> Music Stream & Download
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-extrabold text-white truncate">{currentSong.name}</h2>
                  <p className="text-base text-zinc-300 font-medium mt-1 truncate">{artistNames}</p>
                  {currentSong.album?.name && (
                    <p className="text-xs text-zinc-400 mt-1">Album: {currentSong.album.name}</p>
                  )}
                </div>

                {/* Seek Bar */}
                <div className="space-y-1.5">
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    value={currentTime}
                    onChange={handleSeekChange}
                    className="w-full h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                  />
                  <div className="flex items-center justify-between text-xs text-zinc-400 font-mono">
                    <span>{formatDuration(currentTime)}</span>
                    <span>{formatDuration(duration)}</span>
                  </div>
                </div>

                {/* Main Player Controls */}
                <div className="flex items-center justify-center md:justify-start gap-6 pt-2">
                  <button
                    onClick={toggleShuffle}
                    className={`p-2.5 rounded-full transition cursor-pointer ${
                      isShuffle ? 'text-emerald-400 bg-emerald-500/15' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    <Shuffle className="w-5 h-5" />
                  </button>

                  <button onClick={playPrevious} className="p-3 text-zinc-200 hover:text-white transition cursor-pointer">
                    <SkipBack className="w-7 h-7" />
                  </button>

                  <button
                    onClick={togglePlayPause}
                    className="p-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-xl shadow-emerald-500/30 transition hover:scale-105 active:scale-95 cursor-pointer"
                  >
                    {isPlaying ? <Pause className="w-7 h-7 fill-black" /> : <Play className="w-7 h-7 fill-black ml-1" />}
                  </button>

                  <button onClick={playNext} className="p-3 text-zinc-200 hover:text-white transition cursor-pointer">
                    <SkipForward className="w-7 h-7" />
                  </button>

                  <button
                    onClick={cycleRepeat}
                    className={`p-2.5 rounded-full transition cursor-pointer ${
                      repeatMode !== 'off' ? 'text-emerald-400 bg-emerald-500/15' : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
                  </button>
                </div>

                {/* Extras Row */}
                <div className="flex items-center justify-center md:justify-start gap-4 pt-4 border-t border-zinc-800/80">
                  <button
                    onClick={() => openDownloadModal(currentSong)}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500 text-black font-extrabold text-xs transition hover:bg-emerald-400 shadow-lg shadow-emerald-500/20 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download MP3</span>
                  </button>
                </div>
              </div>
            </div>
          ) : (
            /* Queue Tab */
            <div className="space-y-4 max-w-2xl mx-auto">
              <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
                <h3 className="font-bold text-lg text-white">Upcoming Tracks ({queue.length})</h3>
                {queue.length > 0 && (
                  <button
                    onClick={clearQueue}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 text-xs font-semibold transition cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Queue
                  </button>
                )}
              </div>

              {queue.length === 0 ? (
                <div className="text-center py-12 text-zinc-500">
                  <Music className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p>Queue is currently empty</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {queue.map((song, idx) => {
                    const isCurrent = idx === currentIndex;
                    return (
                      <div
                        key={`${song.id}_${idx}`}
                        className={`flex items-center justify-between p-3 rounded-2xl border transition ${
                          isCurrent
                            ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                            : 'bg-zinc-900/60 border-zinc-800/80 hover:bg-zinc-800/80 text-zinc-300'
                        }`}
                      >
                        <div
                          onClick={() => playSong(song, queue, idx)}
                          className="flex items-center gap-3 min-w-0 cursor-pointer flex-1"
                        >
                          <span className="w-6 text-center text-xs font-mono text-zinc-500">
                            {isCurrent ? '▶' : idx + 1}
                          </span>
                          <img
                            src={getBestImage(song.image, '50x50')}
                            alt=""
                            className="w-10 h-10 rounded-lg object-cover shrink-0"
                          />
                          <div className="min-w-0">
                            <p className="font-semibold text-sm truncate text-white">{song.name}</p>
                            <p className="text-xs text-zinc-400 truncate">{getPrimaryArtists(song)}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => openDownloadModal(song)}
                            className="p-2 text-zinc-400 hover:text-emerald-400 cursor-pointer"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromQueue(idx)}
                            className="p-2 text-zinc-500 hover:text-rose-400 cursor-pointer"
                            title="Remove from queue"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
