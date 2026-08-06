import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useFavorites } from '../context/FavoritesContext';
import {
  getBestImage,
  getPrimaryArtists,
  formatDuration,
} from '../utils/helpers';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Repeat,
  Repeat1,
  Shuffle,
  Download,
  X,
  Maximize2,
  ListMusic,
  Zap,
} from 'lucide-react';
import { PlaybackQuality } from '../types';

export const PlayerBar: React.FC = () => {
  const {
    currentSong,
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    playbackQuality,
    repeatMode,
    isShuffle,
    queue,
    togglePlayPause,
    seek,
    setVolume,
    toggleMute,
    playNext,
    playPrevious,
    toggleShuffle,
    cycleRepeat,
    setPlaybackQuality,
    openDownloadModal,
    closePlayer,
    setIsPlayerModalOpen,
  } = usePlayer();

  const [showQualityMenu, setShowQualityMenu] = useState(false);

  if (!currentSong) return null;

  const imageUrl = getBestImage(currentSong.image, '150x150');
  const artistNames = getPrimaryArtists(currentSong);

  const handleSeekChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    seek(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const qualities: PlaybackQuality[] = ['320kbps', '160kbps', '96kbps', '48kbps'];

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-zinc-950/95 border-t border-zinc-800/90 backdrop-blur-xl text-white px-4 py-2.5 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2 md:gap-4">
        {/* Left: Song Info */}
        <div className="flex items-center gap-3 w-full md:w-1/4 min-w-0 justify-between md:justify-start">
          <div className="flex items-center gap-3 min-w-0">
            <div
              onClick={() => setIsPlayerModalOpen(true)}
              className="relative group cursor-pointer shrink-0"
            >
              <img
                src={imageUrl}
                alt={currentSong.name}
                className="w-12 h-12 rounded-xl object-cover shadow-md border border-zinc-800 group-hover:opacity-80 transition"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition bg-black/40 rounded-xl">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="min-w-0">
              <h4
                onClick={() => setIsPlayerModalOpen(true)}
                className="text-sm font-bold truncate cursor-pointer hover:text-emerald-400 transition"
              >
                {currentSong.name}
              </h4>
              <p className="text-xs text-zinc-400 truncate">{artistNames}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 shrink-0 md:ml-2">
            <button
              onClick={() => openDownloadModal(currentSong)}
              className="p-2 text-emerald-400 hover:text-emerald-300 transition rounded-full hover:bg-zinc-800/80 cursor-pointer"
              title="Download Song MP3"
            >
              <Download className="w-4 h-4" />
            </button>

            <button
              onClick={closePlayer}
              className="p-2 text-zinc-400 hover:text-rose-400 transition rounded-full hover:bg-zinc-800/80 cursor-pointer"
              title="Close Stream Bar"
            >
              <X className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Center: Controls & Seekbar */}
        <div className="flex flex-col items-center gap-1.5 w-full md:w-2/4 max-w-xl">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleShuffle}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                isShuffle ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-400 hover:text-white'
              }`}
              title="Shuffle"
            >
              <Shuffle className="w-4 h-4" />
            </button>

            <button
              onClick={playPrevious}
              className="p-1.5 text-zinc-300 hover:text-white transition cursor-pointer"
              title="Previous"
            >
              <SkipBack className="w-5 h-5" />
            </button>

            <button
              onClick={togglePlayPause}
              className="p-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-lg shadow-emerald-500/30 transition hover:scale-105 active:scale-95 cursor-pointer"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-0.5" />}
            </button>

            <button
              onClick={playNext}
              className="p-1.5 text-zinc-300 hover:text-white transition cursor-pointer"
              title="Next"
            >
              <SkipForward className="w-5 h-5" />
            </button>

            <button
              onClick={cycleRepeat}
              className={`p-1.5 rounded-full transition cursor-pointer ${
                repeatMode !== 'off' ? 'text-emerald-400 bg-emerald-500/10' : 'text-zinc-400 hover:text-white'
              }`}
              title={`Repeat: ${repeatMode}`}
            >
              {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
            </button>
          </div>

          {/* Time & Seek Bar */}
          <div className="flex items-center gap-2 w-full text-xs text-zinc-400">
            <span className="w-9 text-right font-mono text-[11px]">{formatDuration(currentTime)}</span>
            <input
              type="range"
              min={0}
              max={duration || 100}
              value={currentTime}
              onChange={handleSeekChange}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
            <span className="w-9 font-mono text-[11px]">{formatDuration(duration)}</span>
          </div>
        </div>

        {/* Right: Quality, Volume, Queue & Extras */}
        <div className="hidden md:flex items-center justify-end gap-3 w-1/4">
          {/* Quality Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQualityMenu(!showQualityMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-semibold text-emerald-400 hover:border-emerald-500/50 transition cursor-pointer"
              title="Change Stream Quality"
            >
              <Zap className="w-3 h-3 text-emerald-400" />
              <span>{playbackQuality}</span>
            </button>

            {showQualityMenu && (
              <div className="absolute right-0 bottom-full mb-2 w-32 p-1.5 bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl text-xs z-50">
                <p className="px-2 py-1 text-[10px] font-bold text-zinc-500 uppercase">Audio Quality</p>
                {qualities.map(q => (
                  <button
                    key={q}
                    onClick={() => {
                      setPlaybackQuality(q);
                      setShowQualityMenu(false);
                    }}
                    className={`w-full text-left px-2.5 py-1.5 rounded-xl transition cursor-pointer ${
                      playbackQuality === q
                        ? 'bg-emerald-500/20 text-emerald-400 font-bold'
                        : 'text-zinc-300 hover:bg-zinc-800'
                    }`}
                  >
                    {q} {q === '320kbps' ? '(HD)' : ''}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Volume */}
          <div className="flex items-center gap-2">
            <button onClick={toggleMute} className="text-zinc-400 hover:text-white transition cursor-pointer">
              {isMuted || volume === 0 ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          {/* Queue button */}
          <button
            onClick={() => setIsPlayerModalOpen(true)}
            className="p-2 text-zinc-400 hover:text-emerald-400 transition rounded-lg hover:bg-zinc-800 cursor-pointer relative"
            title="View Queue"
          >
            <ListMusic className="w-4 h-4" />
            {queue.length > 1 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-black text-[9px] font-bold rounded-full flex items-center justify-center">
                {queue.length > 99 ? '99' : queue.length}
              </span>
            )}
          </button>

          {/* Fullscreen player trigger */}
          <button
            onClick={() => setIsPlayerModalOpen(true)}
            className="p-2 text-zinc-400 hover:text-white transition rounded-lg hover:bg-zinc-800 cursor-pointer"
            title="Expand Fullscreen Player"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
