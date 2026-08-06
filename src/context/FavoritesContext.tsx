import React, { createContext, useContext, useState, useEffect } from 'react';
import { Song, DownloadHistoryItem, CustomPlaylist } from '../types';

export type AppView = 'home' | 'search' | 'library' | 'album' | 'playlist' | 'artist' | 'link-result';

export interface SearchCache {
  query: string;
  activeTab: 'all' | 'songs' | 'albums' | 'artists' | 'playlists';
  searchAllResults: any;
  songResults: any[];
  albumResults: any[];
  artistResults: any[];
  playlistResults: any[];
}

interface FavoritesContextType {
  likedSongs: Song[];
  toggleLikeSong: (song: Song) => void;
  isSongLiked: (songId: string) => boolean;

  downloadHistory: DownloadHistoryItem[];
  addDownloadHistoryItem: (item: DownloadHistoryItem) => void;
  clearDownloadHistory: () => void;

  customPlaylists: CustomPlaylist[];
  createPlaylist: (name: string) => void;
  deletePlaylist: (id: string) => void;
  addSongToCustomPlaylist: (playlistId: string, song: Song) => void;
  removeSongFromCustomPlaylist: (playlistId: string, songId: string) => void;

  recentlyPlayed: Song[];
  addToRecentlyPlayed: (song: Song) => void;

  activeView: AppView;
  activeViewData: any;
  navigateTo: (view: AppView, data?: any) => void;
  goBack: () => void;
  hasHistory: boolean;

  searchCache: SearchCache | null;
  setSearchCache: React.Dispatch<React.SetStateAction<SearchCache | null>>;

  toastMessage: string | null;
  showToast: (message: string) => void;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const FavoritesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [likedSongs, setLikedSongs] = useState<Song[]>([]);
  const [downloadHistory, setDownloadHistory] = useState<DownloadHistoryItem[]>([]);
  const [customPlaylists, setCustomPlaylists] = useState<CustomPlaylist[]>([]);
  const [recentlyPlayed, setRecentlyPlayed] = useState<Song[]>([]);

  const [activeView, setActiveView] = useState<AppView>('home');
  const [activeViewData, setActiveViewData] = useState<any>(null);
  const [viewHistory, setViewHistory] = useState<{ view: AppView; data?: any }[]>([]);
  const [searchCache, setSearchCache] = useState<SearchCache | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => (prev === msg ? null : prev));
    }, 3500);
  };

  const toggleLikeSong = (song: Song) => {
    setLikedSongs(prev => {
      const exists = prev.some(s => s.id === song.id);
      if (exists) {
        showToast(`Removed "${song.name}" from Liked Songs`);
        return prev.filter(s => s.id !== song.id);
      } else {
        showToast(`Added "${song.name}" to Liked Songs`);
        return [song, ...prev];
      }
    });
  };

  const isSongLiked = (songId: string) => {
    return likedSongs.some(s => s.id === songId);
  };

  const addDownloadHistoryItem = (item: DownloadHistoryItem) => {
    setDownloadHistory(prev => [item, ...prev.filter(i => i.id !== item.id)]);
  };

  const clearDownloadHistory = () => {
    setDownloadHistory([]);
    showToast('Download history cleared');
  };

  const createPlaylist = (name: string) => {
    if (!name.trim()) return;
    const newPl: CustomPlaylist = {
      id: 'pl_' + Date.now(),
      name: name.trim(),
      createdAt: new Date().toLocaleDateString(),
      songs: [],
    };
    setCustomPlaylists(prev => [...prev, newPl]);
    showToast(`Created playlist "${name}"`);
  };

  const deletePlaylist = (id: string) => {
    setCustomPlaylists(prev => prev.filter(p => p.id !== id));
    showToast('Playlist deleted');
  };

  const addSongToCustomPlaylist = (playlistId: string, song: Song) => {
    setCustomPlaylists(prev =>
      prev.map(pl => {
        if (pl.id === playlistId) {
          if (pl.songs.some(s => s.id === song.id)) {
            showToast(`Song already in "${pl.name}"`);
            return pl;
          }
          showToast(`Added to "${pl.name}"`);
          return { ...pl, songs: [...pl.songs, song] };
        }
        return pl;
      })
    );
  };

  const removeSongFromCustomPlaylist = (playlistId: string, songId: string) => {
    setCustomPlaylists(prev =>
      prev.map(pl => {
        if (pl.id === playlistId) {
          return { ...pl, songs: pl.songs.filter(s => s.id !== songId) };
        }
        return pl;
      })
    );
    showToast('Song removed from playlist');
  };

  const addToRecentlyPlayed = (song: Song) => {
    setRecentlyPlayed(prev => [song, ...prev.filter(s => s.id !== song.id)].slice(0, 30));
  };

  const navigateTo = (view: AppView, data?: any) => {
    // Save current view and data to history stack unless it's identical
    setViewHistory(prev => {
      const last = prev[prev.length - 1];
      if (last && last.view === activeView && JSON.stringify(last.data) === JSON.stringify(activeViewData)) {
        return prev;
      }
      return [...prev, { view: activeView, data: activeViewData }];
    });
    setActiveView(view);
    setActiveViewData(data || null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goBack = () => {
    if (viewHistory.length > 0) {
      const previous = viewHistory[viewHistory.length - 1];
      setViewHistory(prev => prev.slice(0, -1));
      setActiveView(previous.view);
      setActiveViewData(previous.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      setActiveView('home');
      setActiveViewData(null);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <FavoritesContext.Provider
      value={{
        likedSongs,
        toggleLikeSong,
        isSongLiked,
        downloadHistory,
        addDownloadHistoryItem,
        clearDownloadHistory,
        customPlaylists,
        createPlaylist,
        deletePlaylist,
        addSongToCustomPlaylist,
        removeSongFromCustomPlaylist,
        recentlyPlayed,
        addToRecentlyPlayed,
        activeView,
        activeViewData,
        navigateTo,
        goBack,
        hasHistory: viewHistory.length > 0,
        searchCache,
        setSearchCache,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};
