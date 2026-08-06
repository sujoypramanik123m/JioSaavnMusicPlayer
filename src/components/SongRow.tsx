import React from 'react';
import { Song } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { useFavorites } from '../context/FavoritesContext';
import {
  getBestImage,
  getPrimaryArtists,
  formatDuration,
  decodeHTMLEntities,
} from '../utils/helpers';
import { Play, Pause, Download, Plus } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';

interface SongRowProps {
  song: Song;
  index?: number;
  playlistQueue?: Song[];
}

export const SongRow: React.FC<SongRowProps> = ({ song, index, playlistQueue }) => {
  if (!song) return null;
  const { currentSong, isPlaying, playSong, togglePlayPause, openDownloadModal, addToQueue } = usePlayer();
  const { showToast } = useFavorites();

  const isCurrent = currentSong?.id === song.id;
  const imageUrl = getBestImage(song.image, '50x50');
  const artistNames = getPrimaryArtists(song);

  const handlePlay = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else {
      playSong(song, playlistQueue);
    }
  };

  // Clicking anywhere on the row plays the song
  const handleRowClick = () => {
    handlePlay();
  };

  return (
    <div
      onClick={handleRowClick}
      className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-2xl transition border cursor-pointer ${
        isCurrent
          ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
          : 'bg-zinc-900/40 border-zinc-800/60 hover:bg-zinc-800/60 hover:border-zinc-700/80 text-zinc-300'
      }`}
    >
      {/* Left section: Index, Artwork, Title & Artists */}
      <div className="flex items-center gap-3.5 min-w-0 flex-1">
        {index !== undefined && (
          <span className="w-6 text-center text-xs font-mono text-zinc-500 shrink-0">
            {isCurrent && isPlaying ? (
              <span className="text-emerald-400 animate-pulse">▶</span>
            ) : (
              index + 1
            )}
          </span>
        )}

        <div className="relative group/cover shrink-0">
          <img
            src={imageUrl}
            alt={song.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
            className="w-11 h-11 rounded-xl object-cover shadow-sm border border-zinc-800 bg-zinc-900"
          />
          <div
            className={`absolute inset-0 flex items-center justify-center rounded-xl bg-black/50 transition ${
              isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
            }`}
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-5 h-5 text-emerald-400 fill-emerald-400" />
            ) : (
              <Play className="w-5 h-5 text-white fill-white ml-0.5" />
            )}
          </div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h4 className="font-bold text-sm text-white truncate hover:text-emerald-400 transition">
              {decodeHTMLEntities(song.name)}
            </h4>
            {song.explicitContent && (
              <span className="px-1.5 py-0.2 rounded bg-zinc-800 text-[10px] text-zinc-400 font-bold border border-zinc-700">
                E
              </span>
            )}
          </div>
          <p className="text-xs text-zinc-400 truncate mt-0.5">{decodeHTMLEntities(artistNames)}</p>
        </div>
      </div>

      {/* Album name (hidden on small screens) */}
      {song.album?.name && (
        <div className="hidden md:block w-1/4 text-xs text-zinc-400 truncate px-2">
          {decodeHTMLEntities(song.album.name)}
        </div>
      )}

      {/* Actions: Download, Like, Duration */}
      <div className="flex items-center gap-2 shrink-0 ml-2" onClick={e => e.stopPropagation()}>
        <span className="hidden sm:inline text-xs font-mono text-zinc-500 mr-2">
          {formatDuration(song.duration)}
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            addToQueue(song);
            showToast(`Added "${decodeHTMLEntities(song.name)}" to queue`);
          }}
          className="p-2 text-zinc-400 hover:text-white transition opacity-0 group-hover:opacity-100 cursor-pointer"
          title="Add to queue"
        >
          <Plus className="w-4 h-4" />
        </button>

        <button
          onClick={(e) => {
            e.stopPropagation();
            openDownloadModal(song);
          }}
          className="px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20 text-xs font-bold flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
          title="Download Audio"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">320k</span>
        </button>
      </div>
    </div>
  );
};
