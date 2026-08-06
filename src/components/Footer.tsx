import React from 'react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 px-4 border-t border-zinc-800/60 bg-zinc-950 text-center text-xs text-zinc-500">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-zinc-400">LoudSound Music Provider</span>
          <span className="text-zinc-600">•</span>
          <span>320kbps MP3 Engine</span>
        </div>
        <div>
          <a
            href="https://t.me/NexonBots"
            target="_blank"
            rel="noopener noreferrer"
            className="font-bold text-emerald-400 hover:text-emerald-300 hover:underline transition"
          >
            Copyright 2026 Nexon Bots
          </a>
        </div>
      </div>
    </footer>
  );
};
