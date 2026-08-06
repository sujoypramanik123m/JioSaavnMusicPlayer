import React from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { usePlayer } from '../context/PlayerContext';
import { ArtistDetails } from '../types';
import { getBestImage, formatNumber } from '../utils/helpers';
import { SongRow } from '../components/SongRow';
import { AlbumCard } from '../components/AlbumCard';
import { Mic2, Play, ArrowLeft, Disc, Music, CheckCircle2 } from 'lucide-react';

export const ArtistView: React.FC = () => {
  const { activeViewData, goBack } = useFavorites();
  const { playSong } = usePlayer();

  const artist: ArtistDetails | null = activeViewData?.artist || null;

  if (!artist) {
    return (
      <div className="py-20 text-center text-zinc-400 space-y-4">
        <p>No artist details found.</p>
        <button
          onClick={goBack}
          className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl text-xs"
        >
          Go Back
        </button>
      </div>
    );
  }

  const imageUrl = getBestImage(artist.image, '500x500');
  const topSongs = artist.topSongs || [];
  const topAlbums = artist.topAlbums || [];

  const handlePlayTop = () => {
    if (topSongs.length > 0) {
      playSong(topSongs[0], topSongs, 0);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      <button
        onClick={goBack}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-white transition"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Artist Profile Header */}
      <div className="flex flex-col sm:flex-row items-center gap-6 p-6 rounded-3xl bg-gradient-to-b from-zinc-900 via-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl">
        <img
          src={imageUrl}
          alt={artist.name}
          className="w-36 h-36 sm:w-44 sm:h-44 rounded-full object-cover shadow-2xl border-4 border-zinc-800 shrink-0"
        />

        <div className="flex-1 text-center sm:text-left space-y-2">
          <div className="flex items-center justify-center sm:justify-start gap-1.5 text-xs text-emerald-400 font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Verified Artist</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">{artist.name}</h1>

          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-zinc-400">
            {artist.followerCount && <span>{formatNumber(artist.followerCount)} Followers</span>}
            {artist.dominantLanguage && <span className="capitalize">• {artist.dominantLanguage}</span>}
          </div>

          {topSongs.length > 0 && (
            <div className="pt-2">
              <button
                onClick={handlePlayTop}
                className="px-6 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm flex items-center justify-center sm:justify-start gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition"
              >
                <Play className="w-4 h-4 fill-black" />
                <span>Play Popular Tracks</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Top Songs */}
      {topSongs.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Music className="w-5 h-5 text-emerald-400" /> Top Songs
          </h2>
          <div className="space-y-2">
            {topSongs.filter(s => s && s.id).map((song, idx) => (
              <SongRow key={song.id || `artistsong-${idx}`} song={song} index={idx} playlistQueue={topSongs} />
            ))}
          </div>
        </div>
      )}

      {/* Top Albums */}
      {topAlbums.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Disc className="w-5 h-5 text-cyan-400" /> Popular Albums
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
            {topAlbums.filter(a => a && a.id).map((album, idx) => (
              <AlbumCard key={album.id || `artistalbum-${idx}`} album={album} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
