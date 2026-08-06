import React from 'react';
import { AlbumSearchResult, AlbumDetails } from '../types';
import { useFavorites } from '../context/FavoritesContext';
import { jioSaavnApi } from '../services/api';
import { getBestImage, decodeHTMLEntities } from '../utils/helpers';
import { Disc } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';

interface AlbumCardProps {
  album: AlbumSearchResult | AlbumDetails;
}

export const AlbumCard: React.FC<AlbumCardProps> = ({ album }) => {
  if (!album) return null;
  const { navigateTo, showToast } = useFavorites();
  const imageUrl = getBestImage(album.image, '500x500');

  const handleClick = async () => {
    if ('songs' in album && album.songs) {
      navigateTo('album', { album });
    } else {
      showToast(`Loading album "${album.name}"...`);
      const fullAlbum = await jioSaavnApi.getAlbum({ id: album.id, link: album.url });
      if (fullAlbum) {
        navigateTo('album', { album: fullAlbum });
      } else {
        navigateTo('album', { album });
      }
    }
  };

  return (
    <div
      onClick={handleClick}
      className="group p-3.5 rounded-2xl bg-zinc-900/60 border border-zinc-800/80 hover:bg-zinc-800/80 hover:border-zinc-700 transition cursor-pointer flex flex-col justify-between"
    >
      <div>
        <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-800 shadow-md">
          <img
            src={imageUrl}
            alt={album.name}
            onError={(e) => {
              (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
            }}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300 bg-zinc-900"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
            <div className="p-3.5 rounded-full bg-emerald-500 text-black font-bold shadow-xl">
              <Disc className="w-5 h-5" />
            </div>
          </div>
        </div>

        <h4 className="font-bold text-sm text-white truncate group-hover:text-emerald-400 transition">
          {decodeHTMLEntities(album.name)}
        </h4>
        <p className="text-xs text-zinc-400 truncate mt-0.5">
          {album.year ? `${album.year} • Album` : 'Album'}
        </p>
      </div>
    </div>
  );
};
