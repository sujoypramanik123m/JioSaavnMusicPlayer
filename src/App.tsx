import React, { useState } from 'react';
import { FavoritesProvider, useFavorites } from './context/FavoritesContext';
import { PlayerProvider, usePlayer } from './context/PlayerContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { PlayerBar } from './components/PlayerBar';
import { PlayerModal } from './components/PlayerModal';
import { DownloadModal } from './components/DownloadModal';
import { Toast } from './components/Toast';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ListMusic } from 'lucide-react';

import { HomeView } from './views/HomeView';
import { SearchView } from './views/SearchView';
import { AlbumView } from './views/AlbumView';
import { PlaylistView } from './views/PlaylistView';
import { ArtistView } from './views/ArtistView';
import { LibraryView } from './views/LibraryView';

const MainContent: React.FC = () => {
  const { activeView } = useFavorites();
  const { currentSong, setIsPlayerModalOpen } = usePlayer();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-black antialiased">
      {/* Top Header Navbar */}
      <Navbar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

      {/* Main Container Layout */}
      <div className="flex-1 flex max-w-7xl w-full mx-auto">
        {/* Sidebar */}
        <Sidebar mobileMenuOpen={mobileMenuOpen} setMobileMenuOpen={setMobileMenuOpen} />

        {/* Dynamic View Canvas */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          <ErrorBoundary>
            {activeView === 'home' && <HomeView />}
            {activeView === 'search' && <SearchView />}
            {activeView === 'album' && <AlbumView />}
            {activeView === 'playlist' && <PlaylistView />}
            {activeView === 'artist' && <ArtistView />}
            {activeView === 'library' && <LibraryView />}
          </ErrorBoundary>
          <Footer />
        </main>
      </div>

      {/* Floating Queue/Playlist Button (like scroll to top style) */}
      {currentSong && (
        <button
          onClick={() => setIsPlayerModalOpen(true)}
          className="fixed bottom-24 right-6 z-40 p-3.5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black shadow-2xl hover:scale-110 active:scale-95 transition cursor-pointer border border-emerald-400/20"
          title="Open Current Queue/Playlist"
        >
          <ListMusic className="w-6 h-6" />
        </button>
      )}

      {/* Persistent Bottom Player Bar */}
      <PlayerBar />

      {/* Fullscreen Player Modal */}
      <PlayerModal />

      {/* Download Quality Modal */}
      <DownloadModal />

      {/* Toast Notifications */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <FavoritesProvider>
      <PlayerProvider>
        <MainContent />
      </PlayerProvider>
    </FavoritesProvider>
  );
}
