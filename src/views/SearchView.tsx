import React, { useState, useEffect } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { jioSaavnApi } from '../services/api';
import {
  Song,
  AlbumSearchResult,
  PlaylistSearchResult,
  ArtistMap,
  SearchAllData,
} from '../types';
import { SongCard } from '../components/SongCard';
import { SongRow } from '../components/SongRow';
import { AlbumCard } from '../components/AlbumCard';
import { PlaylistCard } from '../components/PlaylistCard';
import { ArtistCard } from '../components/ArtistCard';
import { Search, Music, Disc, ListMusic, User, Sparkles, Filter, ArrowLeft } from 'lucide-react';

export const SearchView: React.FC = () => {
  const { activeViewData, goBack, hasHistory, searchCache, setSearchCache } = useFavorites();

  const [query, setQuery] = useState<string>(() => activeViewData?.query || searchCache?.query || '');
  const [activeTab, setActiveTab] = useState<'all' | 'songs' | 'albums' | 'artists' | 'playlists'>(
    () => searchCache?.activeTab || 'all'
  );
  const [loading, setLoading] = useState<boolean>(false);

  const [searchAllResults, setSearchAllResults] = useState<SearchAllData | null>(
    () => searchCache?.searchAllResults || null
  );
  const [songResults, setSongResults] = useState<Song[]>(() => searchCache?.songResults || []);
  const [albumResults, setAlbumResults] = useState<AlbumSearchResult[]>(() => searchCache?.albumResults || []);
  const [artistResults, setArtistResults] = useState<ArtistMap[]>(() => searchCache?.artistResults || []);
  const [playlistResults, setPlaylistResults] = useState<PlaylistSearchResult[]>(
    () => searchCache?.playlistResults || []
  );

  useEffect(() => {
    if (activeViewData?.query) {
      if (activeViewData.query !== searchCache?.query) {
        setQuery(activeViewData.query);
        executeSearch(activeViewData.query, activeTab);
      }
    } else if (!query && searchCache?.query) {
      setQuery(searchCache.query);
    }
  }, [activeViewData?.query]);

  const executeSearch = async (q: string, tab: 'all' | 'songs' | 'albums' | 'artists' | 'playlists') => {
    if (!q.trim()) return;
    setLoading(true);

    try {
      let sAll = searchAllResults;
      let sSongs = songResults;
      let sAlbums = albumResults;
      let sArtists = artistResults;
      let sPlaylists = playlistResults;

      if (tab === 'all') {
        const res = await jioSaavnApi.searchAll(q);
        sAll = res;
        setSearchAllResults(res);

        // Fetch direct song objects for immediate play/download
        const songsRes = await jioSaavnApi.searchSongs(q, 0, 10);
        if (songsRes?.results) {
          sSongs = songsRes.results;
          setSongResults(songsRes.results);
        }
      } else if (tab === 'songs') {
        const songsRes = await jioSaavnApi.searchSongs(q, 0, 20);
        sSongs = songsRes?.results || [];
        setSongResults(sSongs);
      } else if (tab === 'albums') {
        const albumsRes = await jioSaavnApi.searchAlbums(q, 0, 18);
        sAlbums = albumsRes?.results || [];
        setAlbumResults(sAlbums);
      } else if (tab === 'artists') {
        const artistsRes = await jioSaavnApi.searchArtists(q, 0, 18);
        sArtists = artistsRes?.results || [];
        setArtistResults(sArtists);
      } else if (tab === 'playlists') {
        const playlistsRes = await jioSaavnApi.searchPlaylists(q, 0, 18);
        sPlaylists = playlistsRes?.results || [];
        setPlaylistResults(sPlaylists);
      }

      setSearchCache({
        query: q,
        activeTab: tab,
        searchAllResults: sAll,
        songResults: sSongs,
        albumResults: sAlbums,
        artistResults: sArtists,
        playlistResults: sPlaylists,
      });
    } catch (err) {
      console.warn('Search execution failed', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (tab: 'all' | 'songs' | 'albums' | 'artists' | 'playlists') => {
    setActiveTab(tab);
    executeSearch(query, tab);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query, activeTab);
  };

  return (
    <div className="space-y-8 pb-16 animate-fade-in">
      {hasHistory && (
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-400 hover:text-white transition w-fit"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
      )}

      {/* Search Bar Header */}
      <div className="space-y-4">
        <h1 className="text-2xl md:text-3xl font-extrabold text-white">
          Search Music & Download
        </h1>

        <form onSubmit={handleFormSubmit} className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search for songs, artists, albums, playlists..."
            value={query}
            onChange={e => setQuery(e.target.value)}
            className="w-full pl-12 pr-28 py-3.5 bg-zinc-900 border border-zinc-800 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500 shadow-xl"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-xl transition"
          >
            Search
          </button>
        </form>

        {/* Tab Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => handleTabChange('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'all'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" /> All Results
          </button>

          <button
            onClick={() => handleTabChange('songs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'songs'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Music className="w-3.5 h-3.5" /> Songs
          </button>

          <button
            onClick={() => handleTabChange('albums')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'albums'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <Disc className="w-3.5 h-3.5" /> Albums
          </button>

          <button
            onClick={() => handleTabChange('artists')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'artists'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <User className="w-3.5 h-3.5" /> Artists
          </button>

          <button
            onClick={() => handleTabChange('playlists')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 ${
              activeTab === 'playlists'
                ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20'
                : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
            }`}
          >
            <ListMusic className="w-3.5 h-3.5" /> Playlists
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 text-center text-zinc-400">
          <div className="w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p className="text-sm font-medium">Searching Music database for "{query}"...</p>
        </div>
      )}

      {/* Results Rendering */}
      {!loading && query && (
        <div className="space-y-8">
          {/* ALL TAB */}
          {activeTab === 'all' && (
            <div className="space-y-8">
              {/* Songs Section */}
              {songResults.filter(s => s && s.id).length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Music className="w-4 h-4 text-emerald-400" /> Top Song Matches
                  </h3>
                  <div className="space-y-2">
                    {songResults.filter(s => s && s.id).slice(0, 5).map((song, idx) => (
                      <SongRow key={song.id || `searchsong-${idx}`} song={song} index={idx} playlistQueue={[song]} />
                    ))}
                  </div>
                </div>
              )}

              {/* Grid Songs */}
              {songResults.filter(s => s && s.id).length > 5 && (
                <div className="space-y-3">
                  <h3 className="text-lg font-bold text-white">More Track Downloads</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
                    {songResults.filter(s => s && s.id).slice(5, 10).map((song, idx) => (
                      <SongCard key={song.id || `searchcard-${idx}`} song={song} queueContext={[song]} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* SONGS TAB */}
          {activeTab === 'songs' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Song Results ({songResults.length})</h3>
              <div className="space-y-2">
                {songResults.filter(s => s && s.id).map((song, idx) => (
                  <SongRow key={song.id || `searchsongtab-${idx}`} song={song} index={idx} playlistQueue={[song]} />
                ))}
              </div>
            </div>
          )}

          {/* ALBUMS TAB */}
          {activeTab === 'albums' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Albums</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {albumResults.filter(a => a && a.id).map((album, idx) => (
                  <AlbumCard key={album.id || `searchalbum-${idx}`} album={album} />
                ))}
              </div>
            </div>
          )}

          {/* ARTISTS TAB */}
          {activeTab === 'artists' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Artists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {artistResults.filter(a => a && a.id).map((artist, idx) => (
                  <ArtistCard key={artist.id || `searchartist-${idx}`} artist={artist} />
                ))}
              </div>
            </div>
          )}

          {/* PLAYLISTS TAB */}
          {activeTab === 'playlists' && (
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-white">Playlists</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                {playlistResults.filter(p => p && p.id).map((playlist, idx) => (
                  <PlaylistCard key={playlist.id || `searchplaylist-${idx}`} playlist={playlist} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
