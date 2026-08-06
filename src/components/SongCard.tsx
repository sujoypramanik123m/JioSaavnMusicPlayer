import React from 'react';
import { Song } from '../types';
import { usePlayer } from '../context/PlayerContext';
import { useFavorites } from '../context/FavoritesContext';
import { getBestImage, getPrimaryArtists, decodeHTMLEntities } from '../utils/helpers';
import { Play, Download, Pause } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';

interface SongCardProps {
  song: Song;
  queueContext?: Song[];
}

export const SongCard: React.FC<SongCardProps> = ({ song, queueContext }) => {
  if (!song) return null;
  const { currentSong, isPlaying, playSong, togglePlayPause, openDownloadModal } = usePlayer();

  const isCurrent = currentSong?.id === song.id;
  const imageUrl = getBestImage(song.image, '500x500');
  const artistNames = getPrimaryArtists(song);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      togglePlayPause();
    } else {
      playSong(song, queueContext);
    }
  };

  return (
    <div className="group relative p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:bg-zinc-800/80 hover:border-zinc-700 transition duration-200 flex flex-col justify-between">
      <div>
        {/* Cover image & Floating action controls */}
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-800 shadow-lg">
          <img
            src={imageUrl}
            alt={song.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
            loading="lazy"
          />

          {/* Dark Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition duration-200 flex items-center justify-center gap-3">
            <button
              onClick={handlePlay}
              className="p-3.5 rounded-full bg-emerald-500 text-black font-bold shadow-xl hover:scale-110 active:scale-95 transition"
              title={isCurrent && isPlaying ? 'Pause' : 'Play'}
            >
              {isCurrent && isPlaying ? (
                <Pause className="w-5 h-5 fill-black" />
              ) : (
                <Play className="w-5 h-5 fill-black ml-0.5" />
              )}
            </button>
          </div>

          {/* Quality tag */}
          <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
            320 kbps
          </div>

          {/* Download button on card */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              openDownloadModal(song);
            }}
            className="absolute top-2 right-2 p-2 rounded-xl bg-black/70 backdrop-blur-md text-white hover:text-emerald-400 hover:scale-105 transition"
            title="Download MP3"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>

        {/* Title & Artist */}
        <div className="min-w-0">
          <h4
            onClick={handlePlay}
            className="font-bold text-sm text-white truncate cursor-pointer hover:text-emerald-400 transition"
          >
            {decodeHTMLEntities(song.name)}
          </h4>
          <p className="text-xs text-zinc-400 truncate mt-0.5">{decodeHTMLEntities(artistNames)}</p>
        </div>
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between mt-3 pt-2 border-t border-zinc-800/60 text-xs text-zinc-500">
        <span className="truncate">{decodeHTMLEntities(song.album?.name || 'Single')}</span>
        <span className="text-[10px] text-emerald-400 font-semibold uppercase">320kbps</span>
      </div>
    </div>
  );
};
