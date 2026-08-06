import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { Song, PlaybackQuality } from '../types';
import { getDownloadUrl, getPrimaryArtists, getBestImage, decodeHTMLEntities } from '../utils/helpers';
import { jioSaavnApi } from '../services/api';

interface PlayerContextType {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  playbackQuality: PlaybackQuality;
  repeatMode: 'off' | 'one' | 'all';
  isShuffle: boolean;
  queue: Song[];
  currentIndex: number;

  isPlayerModalOpen: boolean;
  setIsPlayerModalOpen: (open: boolean) => void;

  isDownloadModalOpen: boolean;
  downloadModalSong: Song | null;
  openDownloadModal: (song: Song) => void;
  closeDownloadModal: () => void;

  closePlayer: () => void;

  playSong: (song: Song, newQueue?: Song[], index?: number) => void;
  togglePlayPause: () => void;
  seek: (seconds: number) => void;
  setVolume: (vol: number) => void;
  toggleMute: () => void;
  playNext: () => void;
  playPrevious: () => void;
  toggleShuffle: () => void;
  cycleRepeat: () => void;
  setPlaybackQuality: (quality: PlaybackQuality) => void;
  addToQueue: (song: Song) => void;
  removeFromQueue: (index: number) => void;
  clearQueue: () => void;
}

const PlayerContext = createContext<PlayerContextType | undefined>(undefined);

export const PlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [volume, setVolumeState] = useState<number>(0.8);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [playbackQuality, setPlaybackQualityState] = useState<PlaybackQuality>('320kbps');
  const [repeatMode, setRepeatMode] = useState<'off' | 'one' | 'all'>('off');
  const [isShuffle, setIsShuffle] = useState<boolean>(false);

  const [queue, setQueue] = useState<Song[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(-1);

  const [isPlayerModalOpen, setIsPlayerModalOpen] = useState<boolean>(false);
  const [isDownloadModalOpen, setIsDownloadModalOpen] = useState<boolean>(false);
  const [downloadModalSong, setDownloadModalSong] = useState<Song | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Use refs to always have latest values in event handlers (prevents stale closures)
  const queueRef = useRef(queue);
  const currentIndexRef = useRef(currentIndex);
  const currentSongRef = useRef(currentSong);
  const repeatModeRef = useRef(repeatMode);
  const isShuffleRef = useRef(isShuffle);
  const playbackQualityRef = useRef(playbackQuality);
  const isMutedRef = useRef(isMuted);
  const volumeRef = useRef(volume);

  useEffect(() => { queueRef.current = queue; }, [queue]);
  useEffect(() => { currentIndexRef.current = currentIndex; }, [currentIndex]);
  useEffect(() => { currentSongRef.current = currentSong; }, [currentSong]);
  useEffect(() => { repeatModeRef.current = repeatMode; }, [repeatMode]);
  useEffect(() => { isShuffleRef.current = isShuffle; }, [isShuffle]);
  useEffect(() => { playbackQualityRef.current = playbackQuality; }, [playbackQuality]);
  useEffect(() => { isMutedRef.current = isMuted; }, [isMuted]);
  useEffect(() => { volumeRef.current = volume; }, [volume]);

  // Core play function that actually loads and plays audio
  const loadAndPlay = useCallback((song: Song) => {
    const downloadInfo = getDownloadUrl(song.downloadUrl, playbackQualityRef.current);
    if (downloadInfo?.url && audioRef.current) {
      audioRef.current.src = downloadInfo.url;
      audioRef.current.volume = isMutedRef.current ? 0 : volumeRef.current;
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(err => {
          console.warn('Playback error:', err);
          setIsPlaying(false);
        });
    }
  }, []);

  // Handle Play Song
  const playSong = useCallback(async (song: Song, newQueue?: Song[], index?: number) => {
    setCurrentSong(song);

    if (newQueue && newQueue.length > 0) {
      setQueue(newQueue);
      queueRef.current = newQueue;
      const initialIdx = index !== undefined ? index : newQueue.findIndex(s => s.id === song.id);
      const idx = initialIdx >= 0 ? initialIdx : 0;
      setCurrentIndex(idx);
      currentIndexRef.current = idx;
    } else {
      const q = queueRef.current;
      if (!q.some(s => s.id === song.id)) {
        const nextQueue = [...q, song];
        setQueue(nextQueue);
        queueRef.current = nextQueue;
        setCurrentIndex(q.length);
        currentIndexRef.current = q.length;
      } else {
        const idx = q.findIndex(s => s.id === song.id);
        setCurrentIndex(idx);
        currentIndexRef.current = idx;
      }
    }

    loadAndPlay(song);

    // Auto-fetch radio recommendations.
    // IMPORTANT: recommendations must be keyed by the song *pid* (song.id),
    // NOT the perma_url slug — the JioSaavn reco endpoint only accepts the pid.
    if (song?.id) {
      try {
        let suggestions = await jioSaavnApi.getSongSuggestions(song.id, 15);
        
        // Fallback: If official radio is empty, fetch songs by the primary artist
        if (!suggestions || suggestions.length <= 1) {
          let primaryArtist = '';
          const artistsAny = song.artists as any;
          if (typeof artistsAny === 'string') {
            primaryArtist = artistsAny.split(',')[0].trim();
          } else if (song.artists?.primary?.[0]?.name) {
            primaryArtist = song.artists.primary[0].name.trim();
          } else if (song.artists?.all?.[0]?.name) {
            primaryArtist = song.artists.all[0].name.trim();
          }

          if (primaryArtist) {
            const fallbackSearch = await jioSaavnApi.searchSongs(primaryArtist, 0, 15);
            if (fallbackSearch && fallbackSearch.results) {
              suggestions = fallbackSearch.results;
            }
          }
        }

        if (suggestions && suggestions.length > 0) {
          setQueue(prevQueue => {
            const currentId = song.id;
            const existingIds = new Set(prevQueue.map(s => s.id));
            const newSuggestions = suggestions.filter(s => s && s.id && s.id !== currentId && !existingIds.has(s.id));
            const updated = [...prevQueue, ...newSuggestions];
            queueRef.current = updated;
            return updated;
          });
        }
      } catch (err) {
        console.warn('Auto radio recommendations failed:', err);
      }
    }
  }, [loadAndPlay]);

  const playSongRef = useRef(playSong);
  useEffect(() => { playSongRef.current = playSong; }, [playSong]);

  const playNext = useCallback(async () => {
    const q = queueRef.current;
    const idx = currentIndexRef.current;
    const song = currentSongRef.current;

    if (q.length === 0) return;

    let nextIdx = idx + 1;
    if (isShuffleRef.current) {
      nextIdx = Math.floor(Math.random() * q.length);
    }

    if (nextIdx < q.length) {
      playSongRef.current(q[nextIdx], q, nextIdx);
    } else if (repeatModeRef.current === 'all') {
      playSongRef.current(q[0], q, 0);
    } else {
      // Auto fetch more suggestions when queue ends
      if (song?.id) {
        try {
          const suggestions = await jioSaavnApi.getSongSuggestions(song.id, 10);
          if (suggestions && suggestions.length > 0) {
            const existingIds = new Set(q.map(s => s.id));
            const newSuggestions = suggestions.filter(s => s && s.id && !existingIds.has(s.id));
            if (newSuggestions.length > 0) {
              const updatedQueue = [...q, ...newSuggestions];
              queueRef.current = updatedQueue;
              setQueue(updatedQueue);
              playSongRef.current(newSuggestions[0], updatedQueue, q.length);
              return;
            }
          }
        } catch (e) {
          console.warn('Auto suggestions failed', e);
        }
      }
      setIsPlaying(false);
    }
  }, []);

  const playNextRef = useRef(playNext);
  useEffect(() => { playNextRef.current = playNext; }, [playNext]);

  const playPrevious = useCallback(() => {
    if (audioRef.current && audioRef.current.currentTime > 4) {
      audioRef.current.currentTime = 0;
      setCurrentTime(0);
      return;
    }
    const q = queueRef.current;
    const idx = currentIndexRef.current;
    if (q.length === 0) return;

    let prevIdx = idx - 1;
    if (prevIdx < 0) {
      prevIdx = q.length - 1;
    }
    playSongRef.current(q[prevIdx], q, prevIdx);
  }, []);

  // Initialize audio element - only runs ONCE
  useEffect(() => {
    if (!audioRef.current) {
      const audio = new Audio();
      audio.preload = 'auto';
      audioRef.current = audio;
    }

    const audio = audioRef.current;

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleLoadedMetadata = () => {
      setDuration(audio.duration || 0);
    };

    const handleEnded = () => {
      if (repeatModeRef.current === 'one') {
        audio.currentTime = 0;
        audio.play().catch(console.error);
      } else {
        playNextRef.current();
      }
    };

    const handleError = (e: Event) => {
      console.warn('Audio playback error', e);
      setIsPlaying(false);
    };

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []); // Empty deps - only runs once, uses refs for latest values

  // Media Session API integration
  useEffect(() => {
    if (!('mediaSession' in navigator) || !currentSong) return;

    const title = decodeHTMLEntities(currentSong.name);
    const artist = getPrimaryArtists(currentSong);
    const album = currentSong.album?.name ? decodeHTMLEntities(currentSong.album.name) : 'LoudSound Music';

    const artwork500 = getBestImage(currentSong.image, '500x500');
    const artwork150 = getBestImage(currentSong.image, '150x150');
    const artwork50 = getBestImage(currentSong.image, '50x50');

    try {
      navigator.mediaSession.metadata = new MediaMetadata({
        title,
        artist,
        album,
        artwork: [
          { src: artwork500, sizes: '500x500', type: 'image/jpeg' },
          { src: artwork150, sizes: '150x150', type: 'image/jpeg' },
          { src: artwork50, sizes: '50x50', type: 'image/jpeg' },
        ],
      });

      navigator.mediaSession.playbackState = isPlaying ? 'playing' : 'paused';

      navigator.mediaSession.setActionHandler('play', () => {
        if (audioRef.current) {
          audioRef.current.play().then(() => setIsPlaying(true)).catch(console.error);
        }
      });

      navigator.mediaSession.setActionHandler('pause', () => {
        if (audioRef.current) {
          audioRef.current.pause();
          setIsPlaying(false);
        }
      });

      navigator.mediaSession.setActionHandler('previoustrack', () => {
        playPrevious();
      });

      navigator.mediaSession.setActionHandler('nexttrack', () => {
        playNextRef.current();
      });

      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime !== undefined && details.seekTime !== null && audioRef.current) {
          audioRef.current.currentTime = details.seekTime;
          setCurrentTime(details.seekTime);
        }
      });
    } catch (e) {
      console.warn('MediaSession error', e);
    }
  }, [currentSong, isPlaying]);

  // Update MediaSession position state
  useEffect(() => {
    if (!('mediaSession' in navigator) || !('setPositionState' in navigator.mediaSession) || !currentSong) return;
    if (duration > 0 && !isNaN(duration) && !isNaN(currentTime)) {
      try {
        navigator.mediaSession.setPositionState({
          duration: Math.max(0, duration),
          playbackRate: audioRef.current?.playbackRate || 1,
          position: Math.min(Math.max(0, currentTime), duration),
        });
      } catch (e) {
        // ignore
      }
    }
  }, [currentTime, duration, currentSong]);

  // Update document title
  useEffect(() => {
    if (currentSong) {
      document.title = `${isPlaying ? '▶' : '⏸'} ${decodeHTMLEntities(currentSong.name)} - ${getPrimaryArtists(currentSong)}`;
    } else {
      document.title = 'LoudSound Music - Stream & Download';
    }
  }, [currentSong, isPlaying]);

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current || !currentSongRef.current) return;

    if (audioRef.current.paused) {
      audioRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(console.error);
    } else {
      audioRef.current.pause();
      setIsPlaying(false);
    }
  }, []);

  const seek = useCallback((seconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = seconds;
      setCurrentTime(seconds);
    }
  }, []);

  const setVolume = useCallback((vol: number) => {
    const clamped = Math.max(0, Math.min(1, vol));
    setVolumeState(clamped);
    volumeRef.current = clamped;
    if (audioRef.current) {
      audioRef.current.volume = isMutedRef.current ? 0 : clamped;
    }
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prev => {
      const nextMuted = !prev;
      isMutedRef.current = nextMuted;
      if (audioRef.current) {
        audioRef.current.volume = nextMuted ? 0 : volumeRef.current;
      }
      return nextMuted;
    });
  }, []);

  const toggleShuffle = useCallback(() => {
    setIsShuffle(prev => {
      isShuffleRef.current = !prev;
      return !prev;
    });
  }, []);

  const cycleRepeat = useCallback(() => {
    setRepeatMode(prev => {
      const next = prev === 'off' ? 'all' : prev === 'all' ? 'one' : 'off';
      repeatModeRef.current = next;
      return next;
    });
  }, []);

  const setPlaybackQuality = useCallback((quality: PlaybackQuality) => {
    setPlaybackQualityState(quality);
    playbackQualityRef.current = quality;
    const song = currentSongRef.current;
    if (song && audioRef.current) {
      const currentPos = audioRef.current.currentTime;
      const wasPlaying = !audioRef.current.paused;
      const downloadInfo = getDownloadUrl(song.downloadUrl, quality);
      if (downloadInfo?.url) {
        audioRef.current.src = downloadInfo.url;
        audioRef.current.currentTime = currentPos;
        if (wasPlaying) {
          audioRef.current.play().catch(console.error);
        }
      }
    }
  }, []);

  const addToQueue = useCallback((song: Song) => {
    setQueue(prev => {
      const updated = [...prev, song];
      queueRef.current = updated;
      return updated;
    });
  }, []);

  const removeFromQueue = useCallback((index: number) => {
    setQueue(prev => {
      const next = [...prev];
      next.splice(index, 1);
      queueRef.current = next;
      return next;
    });
    setCurrentIndex(prev => {
      const newIdx = index < prev ? prev - 1 : prev;
      currentIndexRef.current = newIdx;
      return newIdx;
    });
  }, []);

  const clearQueue = useCallback(() => {
    const song = currentSongRef.current;
    const newQueue = song ? [song] : [];
    const newIndex = song ? 0 : -1;
    setQueue(newQueue);
    queueRef.current = newQueue;
    setCurrentIndex(newIndex);
    currentIndexRef.current = newIndex;
  }, []);

  const openDownloadModal = useCallback((song: Song) => {
    setDownloadModalSong(song);
    setIsDownloadModalOpen(true);
  }, []);

  const closeDownloadModal = useCallback(() => {
    setIsDownloadModalOpen(false);
    setDownloadModalSong(null);
  }, []);

  const closePlayer = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentSong(null);
    currentSongRef.current = null;
    setIsPlayerModalOpen(false);
    if ('mediaSession' in navigator) {
      navigator.mediaSession.playbackState = 'none';
    }
  }, []);

  return (
    <PlayerContext.Provider
      value={{
        currentSong,
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        playbackQuality,
        repeatMode,
        isShuffle,
        queue,
        currentIndex,
        isPlayerModalOpen,
        setIsPlayerModalOpen,
        isDownloadModalOpen,
        downloadModalSong,
        openDownloadModal,
        closeDownloadModal,
        closePlayer,
        playSong,
        togglePlayPause,
        seek,
        setVolume,
        toggleMute,
        playNext,
        playPrevious,
        toggleShuffle,
        cycleRepeat,
        setPlaybackQuality,
        addToQueue,
        removeFromQueue,
        clearQueue,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};

export const usePlayer = () => {
  const context = useContext(PlayerContext);
  if (!context) {
    throw new Error('usePlayer must be used within a PlayerProvider');
  }
  return context;
};
