import React, { useState } from 'react';
import { X, Info, ShieldAlert, Sparkles, Music, ExternalLink, ShieldCheck } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'disclaimer'>('info');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800 bg-zinc-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-black shadow-lg shadow-emerald-500/20">
              <Music className="w-5 h-5 font-bold" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Stream & Download</h2>
              <p className="text-xs text-zinc-400">High Quality 320kbps MP3 Music Stream & Downloader</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-full hover:bg-zinc-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Buttons: Info & Disclaimer */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/50 p-2 gap-2">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'info'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            <Info className="w-4 h-4" />
            <span>Info</span>
          </button>

          <button
            onClick={() => setActiveTab('disclaimer')}
            className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 ${
              activeTab === 'disclaimer'
                ? 'bg-emerald-500 text-black shadow-md shadow-emerald-500/20'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/80'
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Disclaimer</span>
          </button>
        </div>

        {/* Body Content */}
        <div className="p-6 overflow-y-auto space-y-4 text-sm text-zinc-300">
          {activeTab === 'info' ? (
            <div className="space-y-4 animate-fade-in">
              {/* Safety Badge */}
              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center gap-3 shadow-md shadow-emerald-500/10">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <h4 className="font-extrabold text-emerald-400 text-sm">This Web is fully safe</h4>
                  <p className="text-[11px] text-zinc-300 mt-0.5">100% clean, ad-free, malware-free & secure streaming platform.</p>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">Ultra High Quality Downloader</h3>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    Stream and download high quality uncompressed 320kbps MP3 audio directly from high-speed servers.
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Key Features</h4>
                <ul className="space-y-2 text-xs text-zinc-300">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Instant MP3 Downloads in 320kbps, 160kbps & 96kbps quality</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Universal Song, Album & Playlist Link Resolver</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>In-browser HD Music Player with live queue and playback controls</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span>Powered by Nexon Bots High Speed Music API</span>
                  </li>
                </ul>
              </div>

              <div className="p-3.5 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between text-xs">
                <span className="text-zinc-400">API Provider:</span>
                <a
                  href="https://t.me/NexonBots"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-bold text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>t.me/NexonBots</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4 animate-fade-in">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-bold text-white text-sm">Legal & Content Disclaimer</h3>
                  <p className="text-xs text-zinc-300 mt-1 leading-relaxed">
                    Please read the terms regarding content ownership and usage below.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-xs text-zinc-400 leading-relaxed">
                <p>
                  1. <strong className="text-zinc-200">No File Hosting:</strong> This website does not store, host, or upload any audio files, MP3s, or copyrighted media on its own servers.
                </p>
                <p>
                  2. <strong className="text-zinc-200">Third-Party CDN:</strong> All music streams and downloadable links are dynamically fetched directly from public CDN servers.
                </p>
                <p>
                  3. <strong className="text-zinc-200">Educational & Personal Use:</strong> This application is developed strictly for personal, non-commercial, and educational demonstration purposes.
                </p>
                <p>
                  4. <strong className="text-zinc-200">Intellectual Property:</strong> All music, logos, album art, and artist trademarks belong to their respective copyright owners.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs">
          <a
            href="https://t.me/NexonBots"
            target="_blank"
            rel="noopener noreferrer"
            className="text-zinc-400 hover:text-emerald-400 transition"
          >
            Copyright 2026 Nexon Bots
          </a>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
