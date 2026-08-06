import React, { useState } from 'react';
import { usePlayer } from '../context/PlayerContext';
import { useFavorites } from '../context/FavoritesContext';
import {
  getBestImage,
  getPrimaryArtists,
  formatDuration,
  estimateFileSize,
  triggerDownloadFile,
} from '../utils/helpers';
import {
  X,
  Download,
  Copy,
  Check,
  Music,
  Zap,
  HardDrive,
  Play,
  Sparkles,
  ExternalLink,
} from 'lucide-react';
import { PlaybackQuality } from '../types';

export const DownloadModal: React.FC = () => {
  const { isDownloadModalOpen, downloadModalSong, closeDownloadModal, playSong, setPlaybackQuality } = usePlayer();
  const { addDownloadHistoryItem, showToast } = useFavorites();

  const [selectedQuality, setSelectedQuality] = useState<string>('320kbps');
  const [downloadingQuality, setDownloadingQuality] = useState<string | null>(null);
  const [copiedQuality, setCopiedQuality] = useState<string | null>(null);

  if (!isDownloadModalOpen || !downloadModalSong) return null;

  const song = downloadModalSong;
  const imageUrl = getBestImage(song.image, '500x500');
  const artistNames = getPrimaryArtists(song);
  const downloadUrls = song.downloadUrl || [];

  const handleDownload = async (quality: string, url: string) => {
    setDownloadingQuality(quality);
    const cleanName = `${song.name} - ${artistNames}`.replace(/[/\\?%*:|"<>]/g, '');
    const filename = `${cleanName} (${quality}).mp3`;

    showToast(`Starting download: ${song.name} (${quality})`);

    const success = await triggerDownloadFile(url, filename);

    if (success) {
      addDownloadHistoryItem({
        id: `${song.id}_${quality}_${Date.now()}`,
        songName: song.name,
        artistName: artistNames,
        albumName: song.album?.name || 'Single',
        quality,
        imageUrl,
        downloadedAt: new Date().toLocaleString(),
        url,
      });
      showToast(`Downloaded "${song.name}" in ${quality}!`);
    } else {
      showToast('Download failed. Trying direct link...');
      window.open(url, '_blank');
    }

    setDownloadingQuality(null);
  };

  const handleCopyLink = (quality: string, url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedQuality(quality);
    showToast(`Direct stream URL (${quality}) copied!`);
    setTimeout(() => setCopiedQuality(null), 2500);
  };

  const handleStreamQuality = (quality: PlaybackQuality) => {
    setPlaybackQuality(quality);
    playSong(song);
    showToast(`Playing "${song.name}" at ${quality}`);
    closeDownloadModal();
  };

  const qualityLabels: Record<string, { label: string; desc: string; badge?: string; color: string }> = {
    '320kbps': {
      label: '320 kbps',
      desc: 'Very High / Ultra Studio Quality',
      badge: 'Best Audio',
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/50 text-emerald-400',
    },
    '160kbps': {
      label: '160 kbps',
      desc: 'High Quality (Balanced)',
      badge: 'Popular',
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/50 text-cyan-400',
    },
    '96kbps': {
      label: '96 kbps',
      desc: 'Standard Quality',
      color: 'from-zinc-800 to-zinc-800/60 border-zinc-700 text-zinc-300',
    },
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-zinc-900 border border-zinc-800 shadow-2xl text-white">
        {/* Background glow */}
        <div
          className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none"
        />
        <div
          className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl pointer-events-none"
        />

        {/* Modal Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight">Download Audio</h2>
              <p className="text-xs text-zinc-400">Select your preferred audio format & quality</p>
            </div>
          </div>
          <button
            onClick={closeDownloadModal}
            className="p-2 rounded-full bg-zinc-800/80 text-zinc-400 hover:text-white hover:bg-zinc-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="relative p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Song Overview Card */}
          <div className="flex flex-col sm:flex-row items-center gap-5 p-4 rounded-2xl bg-zinc-800/40 border border-zinc-700/50">
            <img
              src={imageUrl}
              alt={song.name}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl object-cover shadow-lg border border-zinc-700/80 shrink-0"
            />
            <div className="flex-1 text-center sm:text-left min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold mb-1">
                <Sparkles className="w-3 h-3" /> Original Music Media
              </div>
              <h3 className="text-lg font-bold text-white truncate">{song.name}</h3>
              <p className="text-sm text-zinc-300 truncate mt-0.5">{artistNames}</p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-zinc-400 mt-2">
                {song.album?.name && <span>Album: {song.album.name}</span>}
                {song.duration && <span>Duration: {formatDuration(song.duration)}</span>}
                {song.year && <span>Year: {song.year}</span>}
                {song.language && <span className="capitalize">Lang: {song.language}</span>}
              </div>
            </div>
          </div>

          {/* Available Quality Options */}
          <div>
            <h4 className="text-sm font-semibold text-zinc-300 mb-3 flex items-center justify-between">
              <span>Select Quality ({downloadUrls.length} Available)</span>
              <span className="text-xs text-emerald-400 font-normal">Fast MP3 Download</span>
            </h4>

            <div className="space-y-3">
              {downloadUrls
                .filter((dl) => dl.quality !== '12kbps' && dl.quality !== '48kbps')
                .map((dl) => {
                const info: { label: string; desc: string; badge?: string; color: string } = qualityLabels[dl.quality] || {
                  label: dl.quality,
                  desc: 'Audio Format',
                  badge: undefined,
                  color: 'bg-zinc-800 text-zinc-300',
                };
                const estSize = estimateFileSize(song.duration, dl.quality);
                const isDownloading = downloadingQuality === dl.quality;
                const isCopied = copiedQuality === dl.quality;

                return (
                  <div
                    key={dl.quality}
                    className={`group relative flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r ${info.color} border transition hover:border-emerald-500/50`}
                  >
                    <div className="flex items-center gap-4 min-w-0 w-full sm:w-auto">
                      <div className="flex items-center justify-center w-11 h-11 rounded-xl bg-zinc-900/60 border border-zinc-700/60 text-white shrink-0">
                        <Music className="w-5 h-5 text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">{info.label}</span>
                          {info.badge && (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-black font-bold text-[10px] tracking-wide uppercase">
                              {info.badge}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-zinc-400 mt-0.5">{info.desc}</p>
                        <div className="flex items-center gap-3 text-[11px] text-zinc-400 mt-1">
                          <span className="flex items-center gap-1">
                            <HardDrive className="w-3 h-3 text-zinc-400" /> Approx. {estSize}
                          </span>
                          <span>•</span>
                          <span>MP3 Audio</span>
                        </div>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-800/80">
                      <button
                        onClick={() => handleStreamQuality(dl.quality as PlaybackQuality)}
                        title="Stream in Player"
                        className="px-3 py-2 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-medium flex items-center gap-1.5 transition cursor-pointer"
                      >
                        <Play className="w-3.5 h-3.5" /> Stream
                      </button>

                      <button
                        onClick={() => handleCopyLink(dl.quality, dl.url)}
                        title="Copy direct MP3 URL"
                        className="p-2.5 rounded-xl bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white transition cursor-pointer"
                      >
                        {isCopied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>

                      <button
                        onClick={() => handleDownload(dl.quality, dl.url)}
                        disabled={isDownloading}
                        className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 active:scale-95 transition disabled:opacity-50 cursor-pointer"
                      >
                        {isDownloading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                            <span>Downloading...</span>
                          </>
                        ) : (
                          <>
                            <Download className="w-4 h-4" />
                            <span>Download MP3</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between p-4 px-6 bg-zinc-950/60 border-t border-zinc-800 text-xs text-zinc-500">
          <span>Official CDN direct download</span>
          <a
            href={song.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-emerald-400 hover:underline cursor-pointer"
          >
            <span>View Original Link</span>
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>
      </div>
    </div>
  );
};
