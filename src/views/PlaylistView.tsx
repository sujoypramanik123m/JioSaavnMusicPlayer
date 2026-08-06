import React, { useState, useEffect } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { usePlayer } from '../context/PlayerContext';
import { PlaylistDetails } from '../types';
import { getBestImage, formatNumber, decodeHTMLEntities } from '../utils/helpers';
import { SongRow } from '../components/SongRow';
import { jioSaavnApi } from '../services/api';
import { ListMusic, Play, ArrowLeft, Music } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';

export const PlaylistView: React.FC = () => {
  const { activeViewData, goBack, showToast } = useFavorites();
  const { playSong, openDownloadModal } = usePlayer();

  const passedPlaylist: any = activeViewData?.playlist || null;
  const [playlist, setPlaylist] = useState<PlaylistDetails | null>(passedPlaylist);
  const [loading, setLoading] = useState<boolean>(!passedPlaylist?.songs || passedPlaylist.songs.length === 0);

  useEffect(() => {
    let mounted = true;
    if (passedPlaylist) {
      setPlaylist(passedPlaylist);
      if (!passedPlaylist.songs || passedPlaylist.songs.length === 0) {
        setLoading(true);
        jioSaavnApi
          .getPlaylist({ id: passedPlaylist.id, link: passedPlaylist.url || passedPlaylist.link })
          .then(res => {
            if (mounted && res) {
              setPlaylist(res);
            }
          })
          .catch(err => {
            console.warn('Failed to load full playlist details', err);
          })
          .finally(() => {
            if (mounted) setLoading(false);
          });
      } else {
        setLoading(false);
      }
    }
    return () => {
      mounted = false;
    };
  }, [passedPlaylist?.id, passedPlaylist?.url]);

  if (!playlist && !loading) {
    return (
      <div className="py-20 text-center text-zinc-400 space-y-4">
        <p>No playlist data found.</p>
        <button
          onClick={goBack}
          className="px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl text-xs"
        >
          Go Back
        </button>
      </div>
    );
  }

  const imageUrl = getBestImage(playlist?.image, '500x500');
  const songs = playlist?.songs || [];

  const handlePlayAll = () => {
    if (songs.length > 0) {
      playSong(songs[0], songs, 0);
    }
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      <button
        onClick={goBack}
        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-white transition w-fit"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      {/* Header Banner */}
      <div className="flex flex-col md:flex-row items-center md:items-end gap-6 p-6 rounded-3xl bg-gradient-to-b from-teal-950/60 via-zinc-900 to-zinc-950 border border-teal-500/20 shadow-2xl">
        <img
          src={imageUrl}
          alt={playlist?.name || 'Playlist'}
          onError={(e) => {
            (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
          }}
          className="w-44 h-44 sm:w-52 sm:h-52 rounded-2xl object-cover shadow-2xl border border-zinc-700/80 shrink-0 bg-zinc-900"
        />

        <div className="flex-1 text-center md:text-left min-w-0 space-y-3">
          <span className="px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-bold uppercase tracking-wider">
            Playlist
          </span>

          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            {decodeHTMLEntities(playlist?.name || 'Playlist')}
          </h1>

          {playlist?.description && (
            <p className="text-xs text-zinc-400 max-w-xl line-clamp-2">
              {decodeHTMLEntities(playlist.description)}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs text-zinc-400">
            <span>{songs.length} Tracks</span>
            {playlist?.followerCount && <span>• {formatNumber(playlist.followerCount)} Followers</span>}
            {playlist?.playCount && <span>• {formatNumber(playlist.playCount)} Plays</span>}
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
            <button
              onClick={handlePlayAll}
              disabled={songs.length === 0}
              className="px-6 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm flex items-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition disabled:opacity-50"
            >
              <Play className="w-4 h-4 fill-black" />
              <span>Play All</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tracklist */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Music className="w-4 h-4 text-teal-400" /> Playlist Tracks ({songs.length})
        </h2>

        {loading ? (
          <div className="py-12 text-center text-zinc-400 space-y-3">
            <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-medium">Fetching playlist songs...</p>
          </div>
        ) : songs.length === 0 ? (
          <p className="text-sm text-zinc-500 italic">No tracks loaded in this playlist.</p>
        ) : (
          <div className="space-y-2">
            {songs.filter(s => s && s.id).map((song, idx) => (
              <SongRow key={song.id || `playlistsong-${idx}`} song={song} index={idx} playlistQueue={songs} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
