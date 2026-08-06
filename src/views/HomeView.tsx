import React, { useState, useEffect } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { usePlayer } from '../context/PlayerContext';
import { jioSaavnApi } from '../services/api';
import { HomeModuleSection } from '../types';
import { getBestImage, decodeHTMLEntities } from '../utils/helpers';
import {
  Search,
  Sparkles,
  ArrowRight,
  HardDriveDownload,
  Link as LinkIcon,
  Music,
  User,
  ListMusic,
  Play,
} from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';

// These are REAL JioSaavn playlist IDs verified to return songs via API testing
const INITIAL_HOME_SECTIONS: HomeModuleSection[] = [];

let globalHomeModulesCache: HomeModuleSection[] = INITIAL_HOME_SECTIONS;

export const HomeView: React.FC = () => {
  const { navigateTo, showToast } = useFavorites();
  const { playSong, openDownloadModal } = usePlayer();

  const [heroSearchInput, setHeroSearchInput] = useState<string>('');
  const [modules, setModules] = useState<HomeModuleSection[]>(globalHomeModulesCache);
  const [isLoading, setIsLoading] = useState(globalHomeModulesCache.length === 0);

  useEffect(() => {
    let mounted = true;
    jioSaavnApi
      .getHomeModules()
      .then(res => {
        if (mounted && res && res.length > 0) {
          globalHomeModulesCache = res;
          setModules(res);
        }
      })
      .catch(err => {
        console.warn('Background load home modules failed', err);
      })
      .finally(() => {
        if (mounted) setIsLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!heroSearchInput || !heroSearchInput.trim()) return;

    const trimmed = heroSearchInput.trim();

    if (trimmed.includes('jiosaavn.com/') || trimmed.includes('saavn.com/')) {
      showToast('Resolving Music link...');
      jioSaavnApi
        .resolveJioSaavnLink(trimmed)
        .then(res => {
          if (res && res.data) {
            if (res.type === 'song') {
              playSong(res.data);
              openDownloadModal(res.data);
            } else if (res.type === 'album') {
              navigateTo('album', { album: res.data });
            } else if (res.type === 'playlist') {
              navigateTo('playlist', { playlist: res.data });
            } else if (res.type === 'artist') {
              navigateTo('artist', { artist: res.data });
            }
          } else {
            showToast('Invalid Music Link');
          }
        })
        .catch(err => {
          console.error('Error resolving link:', err);
          showToast('Error resolving link');
        });
    } else {
      navigateTo('search', { query: trimmed });
    }
  };

  const handleModuleClick = async (item: any) => {
    const targetType = item.type || 'playlist';

    try {
      if (targetType === 'song') {
        // If it's a song item, play it directly
        showToast(`Loading "${decodeHTMLEntities(item.title)}"...`);
        const song = await jioSaavnApi.getSongById(item.id);
        if (song) {
          playSong(song);
        } else {
          navigateTo('search', { query: item.title });
        }
        return;
      }

      if (targetType === 'channel') {
        // Channels are mood/genre categories - search for them
        navigateTo('search', { query: item.title });
        return;
      }

      showToast(`Loading "${decodeHTMLEntities(item.title)}"...`);

      if (targetType === 'album') {
        const fullAlbum = await jioSaavnApi.getAlbum({ id: item.id, link: item.url });
        if (fullAlbum && fullAlbum.songs && fullAlbum.songs.length > 0) {
          navigateTo('album', { album: fullAlbum });
        } else {
          navigateTo('album', { album: { id: item.id, name: item.title, image: item.image, songs: [] } });
        }
      } else {
        // Playlist - use perma_url token for reliable fetching
        const fullPl = await jioSaavnApi.getPlaylist({ id: item.id, link: item.url });
        if (fullPl && fullPl.songs && fullPl.songs.length > 0) {
          navigateTo('playlist', { playlist: fullPl });
        } else {
          // Navigate anyway, PlaylistView will try fetching
          navigateTo('playlist', { playlist: { id: item.id, name: item.title, image: item.image, url: item.url, songs: [] } });
        }
      }
    } catch (e) {
      console.warn('Error opening module item:', e);
      navigateTo('search', { query: item.title });
    }
  };

  const popularArtists = [
    'Arijit Singh',
    'Karan Aujla',
    'Sidhu Moose Wala',
    'Diljit Dosanjh',
    'Cheema Y',
    'Satinder Sartaaj',
    'Dhanda Nyoliwala',
    'Badshah',
    'Atif Aslam',
    'Yo Yo Honey Singh',
    'AP Dhillon',
    'Divine',
    'Amit Saini Rohtakiya',
    'A.R. Rahman',
    'Masoom Sharma',
  ];

  return (
    <div className="space-y-10 pb-16 animate-fade-in max-w-6xl mx-auto px-2 sm:px-4">
      {/* Search Bar */}
      <form onSubmit={handleHeroSearch} className="relative flex items-center max-w-2xl mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search song, artist, album or paste Music link..."
            value={heroSearchInput}
            onChange={e => setHeroSearchInput(e.target.value)}
            className="w-full pl-12 pr-28 py-4 bg-zinc-900/90 border border-zinc-700/80 rounded-2xl text-white text-sm placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 shadow-2xl"
          />
        </div>
        <button
          type="submit"
          className="absolute right-2 px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs sm:text-sm flex items-center gap-1.5 transition active:scale-95 shadow-lg shadow-emerald-500/20"
        >
          <span>Search</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Loading state */}
      {isLoading && modules.length === 0 && (
        <div className="space-y-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="space-y-4">
              <div className="h-6 w-48 bg-zinc-800/60 rounded-lg animate-pulse" />
              <div className="flex gap-4 overflow-hidden">
                {[1, 2, 3, 4, 5].map(j => (
                  <div key={j} className="shrink-0 w-36 sm:w-44 p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800/80">
                    <div className="aspect-square rounded-xl bg-zinc-800/60 animate-pulse mb-3" />
                    <div className="h-4 w-24 bg-zinc-800/60 rounded animate-pulse mb-2" />
                    <div className="h-3 w-16 bg-zinc-800/60 rounded animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dynamic Music Sections */}
      {modules.map(section => (
        <div key={section.id} className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <ListMusic className="w-5 h-5 text-emerald-400" /> {section.title}
              </h2>
              {section.subtitle && (
                <p className="text-xs text-zinc-400 mt-0.5">{section.subtitle}</p>
              )}
            </div>
          </div>

          {/* Horizontal Scrollable Grid */}
          <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-none snap-x">
            {section.items.map(item => (
              <div
                key={item.id}
                onClick={() => handleModuleClick(item)}
                className="group shrink-0 w-36 sm:w-44 bg-zinc-900/50 hover:bg-zinc-800/80 border border-zinc-800/80 hover:border-zinc-700 p-3 rounded-2xl transition cursor-pointer snap-start"
              >
                <div className="relative aspect-square rounded-xl overflow-hidden mb-3 bg-zinc-950 border border-zinc-800">
                  <img
                    src={getBestImage(item.image, '500x500')}
                    alt={item.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = FALLBACK_IMAGE;
                    }}
                    className="w-full h-full object-cover group-hover:scale-105 transition duration-300 bg-zinc-950"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <div className="p-3 rounded-full bg-emerald-500 text-black shadow-lg hover:scale-110 transition">
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </div>
                  </div>
                </div>

                <h3 className="font-bold text-xs sm:text-sm text-white truncate group-hover:text-emerald-400 transition">
                  {decodeHTMLEntities(item.title)}
                </h3>
                <p className="text-[11px] text-zinc-400 truncate mt-0.5">
                  {decodeHTMLEntities(item.subtitle || '')}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Popular Artists Chips Section */}
      <div className="space-y-4 bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-3xl">
        <div className="flex items-center gap-2 text-zinc-200 font-bold text-base">
          <User className="w-5 h-5 text-emerald-400" />
          <span>Popular Artists</span>
        </div>

        <div className="flex flex-wrap gap-2.5 pt-1">
          {popularArtists.map(artist => (
            <button
              key={artist}
              onClick={() => navigateTo('search', { query: artist })}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-emerald-500/20 border border-zinc-800 hover:border-emerald-500/40 text-xs sm:text-sm font-semibold text-zinc-300 hover:text-emerald-400 transition active:scale-95 flex items-center gap-2"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>{artist}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Features Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shrink-0">
            <HardDriveDownload className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs sm:text-sm">320kbps MP3 Audio</h3>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              Full bitrate uncompressed original audio downloads.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shrink-0">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs sm:text-sm">Link Resolver</h3>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              Paste Music URLs to download songs, albums & playlists.
            </p>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800/80 flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/20 shrink-0">
            <Music className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-white text-xs sm:text-sm">In-Browser Player</h3>
            <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
              Listen live with queue management & controls.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
