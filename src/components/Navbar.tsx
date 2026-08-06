import React, { useState } from 'react';
import { useFavorites } from '../context/FavoritesContext';
import { Search, Menu, X } from 'lucide-react';

interface NavbarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { activeView, navigateTo } = useFavorites();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigateTo('search', { query: searchQuery.trim() });
  };

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between h-16 px-4 md:px-8 bg-zinc-950/80 backdrop-blur-xl border-b border-zinc-800/80 text-white">
      {/* Left Branding */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 md:hidden text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 cursor-pointer"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        <button
          onClick={() => navigateTo('home')}
          className="flex items-center gap-2.5 group text-left cursor-pointer"
        >
          <img
            src="/logo.svg"
            alt="LoudSound"
            className="w-9 h-9 rounded-xl shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform"
          />
          <div className="hidden sm:block">
            <span className="font-extrabold text-base tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
              Stream & <span className="text-emerald-400">Download</span>
            </span>
            <span className="block text-[10px] text-zinc-400 -mt-1 font-medium">
              High Quality Music Downloader
            </span>
          </div>
        </button>
      </div>

      {/* Center Search Bar (Hidden on Home and Search views) */}
      {activeView !== 'home' && activeView !== 'search' && (
        <div className="flex-1 max-w-xl mx-4">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search songs, albums, artists or paste Music link..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-24 py-2 text-sm bg-zinc-900/90 border border-zinc-800 rounded-full text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/80 focus:ring-1 focus:ring-emerald-500 transition"
            />
            <button
              type="submit"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs rounded-full transition cursor-pointer"
            >
              Search
            </button>
          </form>
        </div>
      )}
    </header>
  );
};
