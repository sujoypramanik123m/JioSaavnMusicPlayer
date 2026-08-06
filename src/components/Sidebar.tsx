import React, { useState } from 'react';
import { useFavorites, AppView } from '../context/FavoritesContext';
import { AboutModal } from './AboutModal';
import {
  Home,
  Search,
  Info,
  Sparkles,
  ExternalLink,
} from 'lucide-react';

interface SidebarProps {
  mobileMenuOpen: boolean;
  setMobileMenuOpen: (open: boolean) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileMenuOpen, setMobileMenuOpen }) => {
  const { activeView, navigateTo } = useFavorites();
  const [isAboutOpen, setIsAboutOpen] = useState(false);

  const handleNav = (view: AppView) => {
    navigateTo(view);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Desktop: hover trigger on left edge */}
      <div className="hidden md:block fixed inset-y-0 left-0 w-3 z-40 group/trigger">
        <aside
          className="fixed inset-y-0 left-0 z-40 w-64 bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-800/80 pt-4 flex flex-col justify-between
            -translate-x-full group-hover/trigger:translate-x-0 transition-transform duration-300 ease-in-out shadow-2xl shadow-black/50"
        >
          <div className="p-4 space-y-6 overflow-y-auto">
            <div className="space-y-1">
              <p className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Menu</p>
              <button onClick={() => handleNav('home')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                  activeView === 'home' ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}>
                <Home className={`w-4 h-4 ${activeView === 'home' ? 'text-emerald-400' : 'text-zinc-400'}`} />
                <span>Home</span>
              </button>
              <button onClick={() => handleNav('search')}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                  activeView === 'search' ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}>
                <Search className={`w-4 h-4 ${activeView === 'search' ? 'text-emerald-400' : 'text-zinc-400'}`} />
                <span>Search</span>
              </button>
              <button onClick={() => setIsAboutOpen(true)}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition">
                <Info className="w-4 h-4 text-emerald-400" />
                <span>About Web</span>
              </button>
            </div>
            <div className="p-3.5 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-900/60 border border-zinc-800">
              <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
                <Sparkles className="w-3.5 h-3.5" /> 320 KBPS Studio Audio
              </div>
              <p className="text-[11px] text-zinc-400 leading-relaxed">
                Download high fidelity original MP3 tracks directly from High-Speed Music servers without compression.
              </p>
            </div>
          </div>
          <div className="p-4 border-t border-zinc-800/80 text-[11px] text-zinc-500">
            <a href="https://t.me/NexonBots" target="_blank" rel="noopener noreferrer"
              className="font-bold text-emerald-400 hover:underline flex items-center gap-1">
              <span>copyright 2026 Nexon Bots</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </aside>
      </div>

      {/* Mobile: standard slide-in sidebar */}
      <aside
        className={`md:hidden fixed inset-y-0 left-0 z-30 w-64 bg-zinc-950 border-r border-zinc-800/80 pt-16 flex flex-col justify-between transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6 overflow-y-auto">
          <div className="space-y-1">
            <p className="px-3 text-[11px] font-semibold text-zinc-500 uppercase tracking-wider mb-2">Menu</p>
            <button onClick={() => handleNav('home')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                activeView === 'home' ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}>
              <Home className={`w-4 h-4 ${activeView === 'home' ? 'text-emerald-400' : 'text-zinc-400'}`} /><span>Home</span>
            </button>
            <button onClick={() => handleNav('search')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition ${
                activeView === 'search' ? 'bg-emerald-500/15 text-emerald-400 font-semibold border border-emerald-500/20' : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
              }`}>
              <Search className={`w-4 h-4 ${activeView === 'search' ? 'text-emerald-400' : 'text-zinc-400'}`} /><span>Search</span>
            </button>
            <button onClick={() => { setIsAboutOpen(true); setMobileMenuOpen(false); }}
              className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm text-zinc-400 hover:text-white hover:bg-zinc-900 transition">
              <Info className="w-4 h-4 text-emerald-400" /><span>About Web</span>
            </button>
          </div>
          <div className="p-3.5 rounded-2xl bg-gradient-to-b from-zinc-900 to-zinc-900/60 border border-zinc-800">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs mb-1">
              <Sparkles className="w-3.5 h-3.5" /> 320 KBPS Studio Audio
            </div>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Download high fidelity original MP3 tracks directly from High-Speed Music servers without compression.
            </p>
          </div>
        </div>
        <div className="p-4 border-t border-zinc-800/80 text-[11px] text-zinc-500">
          <a href="https://t.me/NexonBots" target="_blank" rel="noopener noreferrer"
            className="font-bold text-emerald-400 hover:underline flex items-center gap-1">
            <span>copyright 2026 Nexon Bots</span><ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </aside>

      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
    </>
  );
};
