import React from 'react';
import { ArtistMap, ArtistDetails } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { jioSaavnApi } from '../services/api';
import { getBestImage } from '../utils/helpers';
import { UserCheck, Mic2 } from 'lucide-react';

interface ArtistCardProps {
  artist: ArtistMap | ArtistDetails;
}

export const ArtistCard: React.FC<ArtistCardProps> = ({ artist }) => {
  if (!artist) return null;
  const { navigateTo, showToast } = useFavorites();
  const imageUrl = getBestImage(artist.image, '500x500');

  const handleClick = async () => {
    if ('topSongs' in artist && artist.topSongs) {
      navigateTo('artist', { artist });
    } else {
      showToast(`Loading artist "${artist.name}"...`);
      const fullArtist = await jioSaavnApi.getArtist({ id: artist.id, link: artist.url });
      if (fullArtist) {
        navigateTo('artist', { artist: fullArtist });
      } else {
        showToast('Could not load artist profile');
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:bg-zinc-800/80 hover:border-zinc-700 transition cursor-pointer flex flex-col items-center text-center"
    >
      <div className="relative w-28 h-28 rounded-full overflow-hidden mb-3 bg-zinc-800 shadow-lg border-2 border-zinc-800 group-hover:border-emerald-500/50 transition">
        <img
          src={imageUrl}
          alt={artist.name}
          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
          <Mic2 className="w-6 h-6 text-emerald-400" />
        </div>
      </div>

      <h4 className="font-bold text-sm text-white truncate w-full group-hover:text-emerald-400 transition">
        {artist.name}
      </h4>
      <p className="text-xs text-zinc-400 mt-0.5">Artist</p>
    </div>
  );
};
