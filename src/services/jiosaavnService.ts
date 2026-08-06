import CryptoJS from 'crypto-js';

const KEY = CryptoJS.enc.Utf8.parse('383465913834659138346591'); // 24 bytes 3DES Key

const QUALITIES = [
  { quality: '96kbps', suffix: '_96' },
  { quality: '160kbps', suffix: '_160' },
  { quality: '320kbps', suffix: '_320' },
];

const IMAGE_QUALITIES = ['50x50', '150x150', '500x500'];

const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Safari/605.1.15',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
];

const JIOSAAVN_API = 'https://www.jiosaavn.com/api.php';

export function createDownloadLinks(encryptedMediaUrl: string) {
  if (!encryptedMediaUrl) return [];
  try {
    const decrypted = CryptoJS.TripleDES.decrypt(
      CryptoJS.lib.CipherParams.create({ ciphertext: CryptoJS.enc.Base64.parse(encryptedMediaUrl) }),
      KEY,
      { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.NoPadding }
    );
    let plainText = decrypted.toString(CryptoJS.enc.Utf8).replace(/\0/g, '').trim();

    return QUALITIES.map(q => ({
      quality: q.quality,
      url: plainText.replace('_96', q.suffix),
    }));
  } catch (error) {
    console.error('Error decrypting media URL:', error);
    return [];
  }
}

export function createImageLinks(link: string) {
  if (!link) return [];
  const secureLink = link.replace(/^http:\/\//, 'https://');
  return IMAGE_QUALITIES.map(q => ({
    quality: q,
    url: secureLink.replace(/150x150|50x50/, q),
  }));
}

export async function jiosaavnFetch(endpoint: string, params: Record<string, any>, ctx: string = 'web6dot0') {
  const queryParams = new URLSearchParams({
    __call: endpoint,
    _format: 'json',
    _marker: '0',
    api_version: '4',
    ctx: ctx,
    ...params,
  });

  const url = `${JIOSAAVN_API}?${queryParams.toString()}`;
  const randomUserAgent = USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];

  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': randomUserAgent,
      },
    });

    if (response.ok) {
      return await response.json();
    }
  } catch (err) {
    if (typeof window !== 'undefined') {
      try {
        const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
        const proxyRes = await fetch(proxyUrl);
        if (proxyRes.ok) {
          return await proxyRes.json();
        }
      } catch (proxyErr) {
        console.warn('CORS proxy fallback also failed:', proxyErr);
      }
    }
    throw err;
  }

  throw new Error(`JioSaavn API Error for endpoint ${endpoint}`);
}

// ─── Radio / Song Suggestions ────────────────────────────────────────────────
// Returns same-genre/theme playable song recommendations for a given song pid.
// This is the single source of truth used by both the backend (server.ts,
// api/index.ts) and the client fallback (src/services/api.ts).
export async function fetchSongSuggestions(songId: string, limit: number = 10): Promise<any[]> {
  if (!songId) return [];

  // 1. PRIMARY: reco.getreco returns genuine "similar / same vibe" songs
  //    (like YouTube autoplay). Must use ctx='android' — 'web6dot0' returns [].
  //    Each item already carries encrypted_media_url, so results are playable.
  try {
    const data = await jiosaavnFetch('reco.getreco', { pid: songId }, 'android');
    let list: any[] = [];
    if (Array.isArray(data)) {
      list = data;
    } else if (data && typeof data === 'object') {
      const keyed = (data as any)[songId];
      const fallbackArr = Object.values(data).find(v => Array.isArray(v));
      list = Array.isArray(keyed) ? keyed : (Array.isArray(fallbackArr) ? (fallbackArr as any[]) : []);
    }
    const songs = list
      .map(buildSong)
      .filter(s => s && s.id && Array.isArray(s.downloadUrl) && s.downloadUrl.length > 0);
    if (songs.length > 0) return songs.slice(0, limit);
  } catch (e) {
    console.warn('reco.getreco failed:', e);
  }

  // 2. FALLBACK: entity station radio (works for some tracks reco misses).
  try {
    const encodedId = JSON.stringify([songId.replace(/ /g, '%20')]);
    const stData = await jiosaavnFetch(
      'webradio.createEntityStation',
      { entity_id: encodedId, entity_type: 'queue' },
      'android'
    );
    const stationId = (stData as any)?.stationid;
    if (stationId) {
      const sgData = await jiosaavnFetch('webradio.getSong', { stationid: stationId, k: limit }, 'android');
      const suggestions: any[] = [];
      if (sgData && typeof sgData === 'object') {
        for (const [key, val] of Object.entries(sgData)) {
          if (key === 'stationid') continue;
          if (typeof val === 'object' && (val as any)?.song) {
            suggestions.push(buildSong((val as any).song));
          }
        }
      }
      const playable = suggestions.filter(s => s && s.id && Array.isArray(s.downloadUrl) && s.downloadUrl.length > 0);
      if (playable.length > 0) return playable.slice(0, limit);
    }
  } catch (e) {
    // ignore, try next fallback
  }

  // 3. LAST RESORT: mix top songs from similar artists (still theme-relevant).
  try {
    const songDetails = await jiosaavnFetch('song.getDetails', { pids: songId });
    const songObj = (songDetails as any)?.songs?.[0];
    const primaryArtistId = songObj?.more_info?.artistMap?.primary_artists?.[0]?.id;
    if (primaryArtistId) {
      const artistData = await jiosaavnFetch('artist.getArtistPageDetails', { artistId: primaryArtistId });
      const similar = (artistData as any)?.similarArtists || [];
      if (similar.length > 0) {
        const mixed: any[] = [];
        await Promise.all(
          similar.slice(0, 3).map(async (sa: any) => {
            try {
              const saData = await jiosaavnFetch('artist.getArtistPageDetails', { artistId: sa.id, n_song: 5 });
              if ((saData as any)?.topSongs) mixed.push(...(saData as any).topSongs.slice(0, 5));
            } catch { /* ignore individual artist errors */ }
          })
        );
        if (mixed.length > 0) {
          mixed.sort(() => Math.random() - 0.5);
          const built = mixed
            .map(buildSong)
            .filter(s => s && s.id && Array.isArray(s.downloadUrl) && s.downloadUrl.length > 0);
          if (built.length > 0) return built.slice(0, limit);
        }
      }
    }
  } catch (e) {
    console.warn('Similar-artist radio fallback failed:', e);
  }

  return [];
}

// ─── Transformations ─────────────────────────────────────────────────────────

export function buildArtistMap(artist: any) {
  return {
    id: artist?.id || null,
    name: artist?.name || '',
    role: artist?.role || '',
    image: createImageLinks(artist?.image || ''),
    type: artist?.type || '',
    url: artist?.perma_url || '',
  };
}

export function buildSong(song: any) {
  const mi = song?.more_info || {};
  const artistMap = mi?.artistMap || {};

  return {
    id: song?.id,
    name: song?.title || song?.song || '',
    type: song?.type || 'song',
    year: song?.year ? parseInt(song.year) : null,
    releaseDate: mi?.release_date || null,
    duration: mi?.duration ? parseInt(mi.duration) : null,
    label: mi?.label || null,
    explicitContent: song?.explicit_content === '1',
    playCount: song?.play_count ? parseInt(song.play_count) : null,
    language: song?.language || '',
    hasLyrics: mi?.has_lyrics === 'true',
    lyricsId: mi?.lyrics_id || null,
    url: song?.perma_url || '',
    copyright: mi?.copyright_text || null,
    album: {
      id: mi?.album_id || null,
      name: mi?.album || null,
      url: mi?.album_url || null,
    },
    artists: {
      primary: (artistMap?.primary_artists || []).map(buildArtistMap),
      featured: (artistMap?.featured_artists || []).map(buildArtistMap),
      all: (artistMap?.artists || []).map(buildArtistMap),
    },
    image: createImageLinks(song?.image || ''),
    downloadUrl: createDownloadLinks(mi?.encrypted_media_url || ''),
  };
}

export function buildAlbum(album: any) {
  const mi = album?.more_info || {};
  const artistMap = mi?.artistMap || {};
  const songsRaw = album?.list || [];

  return {
    id: album?.id,
    name: album?.title || '',
    description: album?.header_desc || '',
    type: album?.type || 'album',
    year: album?.year ? parseInt(album.year) : null,
    playCount: album?.play_count ? parseInt(album.play_count) : null,
    language: album?.language || '',
    explicitContent: album?.explicit_content === '1',
    url: album?.perma_url || '',
    songCount: mi?.song_count ? parseInt(mi.song_count) : null,
    artists: {
      primary: (artistMap?.primary_artists || []).map(buildArtistMap),
      featured: (artistMap?.featured_artists || []).map(buildArtistMap),
      all: (artistMap?.artists || []).map(buildArtistMap),
    },
    image: createImageLinks(album?.image || ''),
    songs: songsRaw.length ? songsRaw.map(buildSong) : null,
  };
}

export function buildPlaylist(playlist: any) {
  const mi = playlist?.more_info || {};
  const songsRaw = Array.isArray(playlist?.list) ? playlist.list : (Array.isArray(playlist?.songs) ? playlist.songs : []);

  return {
    id: playlist?.id || playlist?.listid,
    name: playlist?.title || playlist?.listname || playlist?.name || '',
    description: playlist?.header_desc || playlist?.description || '',
    type: playlist?.type || 'playlist',
    year: playlist?.year ? parseInt(playlist.year) : null,
    playCount: playlist?.play_count ? parseInt(playlist.play_count) : null,
    language: playlist?.language || '',
    explicitContent: playlist?.explicit_content === '1',
    url: playlist?.perma_url || playlist?.url || '',
    songCount: songsRaw.length,
    followerCount: mi?.follower_count ? parseInt(mi.follower_count) : null,
    lastUpdated: mi?.last_updated || null,
    username: mi?.username || null,
    firstname: mi?.firstname || null,
    lastname: mi?.lastname || null,
    image: createImageLinks(playlist?.image || ''),
    songs: songsRaw.map(buildSong),
  };
}

export function buildArtist(artist: any) {
  const safeJson = (val: any) => {
    if (!val) return null;
    try {
      return typeof val === 'string' ? JSON.parse(val) : val;
    } catch {
      return val;
    }
  };

  return {
    id: artist?.artistId || artist?.id,
    name: artist?.name || '',
    url: artist?.urls?.overview || artist?.perma_url || '',
    type: artist?.type || 'artist',
    followerCount: artist?.follower_count ? parseInt(artist.follower_count) : null,
    fanCount: artist?.fan_count || null,
    isVerified: artist?.isVerified || false,
    dominantLanguage: artist?.dominantLanguage || null,
    dominantType: artist?.dominantType || null,
    bio: safeJson(artist?.bio),
    dob: artist?.dob || null,
    fb: artist?.fb || null,
    twitter: artist?.twitter || null,
    wiki: artist?.wiki || null,
    availableLanguages: artist?.availableLanguages || null,
    isRadioPresent: artist?.isRadioPresent || false,
    image: createImageLinks(artist?.image || ''),
    topSongs: artist?.topSongs?.length ? artist.topSongs.map(buildSong) : null,
    topAlbums: artist?.topAlbums?.length ? artist.topAlbums.map(buildAlbum) : null,
    singles: artist?.singles?.length ? artist.singles.map(buildSong) : null,
    similarArtists: artist?.similarArtists?.length
      ? artist.similarArtists.map((sa: any) => ({
          id: sa?.id,
          name: sa?.name,
          url: sa?.perma_url,
          image: createImageLinks(sa?.image_url || ''),
          languages: safeJson(sa?.languages),
          wiki: sa?.wiki,
          dob: sa?.dob,
          fb: sa?.fb,
          twitter: sa?.twitter,
          isRadioPresent: sa?.isRadioPresent,
          type: sa?.type,
          dominantType: sa?.dominantType,
          aka: sa?.aka,
          bio: safeJson(sa?.bio),
          similarArtists: safeJson(sa?.similar),
        }))
      : null,
  };
}

export function buildSearchAll(data: any) {
  const mapSection = (section: any, mapper: (item: any) => any) => ({
    results: (section?.data || []).map(mapper),
    position: section?.position || 0,
  });

  const topQueryItem = (item: any) => {
    const mi = item?.more_info || {};
    return {
      id: item?.id,
      title: item?.title,
      image: createImageLinks(item?.image || ''),
      album: mi?.album,
      url: item?.perma_url,
      type: item?.type,
      language: mi?.language,
      description: item?.description,
      primaryArtists: mi?.primary_artists,
      singers: mi?.singers,
    };
  };

  const songItem = (item: any) => {
    const mi = item?.more_info || {};
    return {
      id: item?.id,
      title: item?.title,
      image: createImageLinks(item?.image || ''),
      album: mi?.album,
      url: item?.perma_url,
      type: item?.type,
      description: item?.description,
      primaryArtists: mi?.primary_artists,
      singers: mi?.singers,
      language: mi?.language,
    };
  };

  const albumItem = (item: any) => {
    const mi = item?.more_info || {};
    return {
      id: item?.id,
      title: item?.title,
      image: createImageLinks(item?.image || ''),
      artist: mi?.music,
      url: item?.perma_url,
      type: item?.type,
      description: item?.description,
      year: mi?.year,
      songIds: mi?.song_pids,
      language: mi?.language,
    };
  };

  const artistItem = (item: any) => ({
    id: item?.id,
    title: item?.title,
    image: createImageLinks(item?.image || ''),
    type: item?.type,
    description: item?.description,
    position: item?.position,
  });

  const playlistItem = (item: any) => {
    const mi = item?.more_info || {};
    return {
      id: item?.id,
      title: item?.title,
      image: createImageLinks(item?.image || ''),
      url: item?.perma_url,
      type: item?.type,
      language: mi?.language,
      description: item?.description,
    };
  };

  return {
    topQuery: mapSection(data?.topquery, topQueryItem),
    songs: mapSection(data?.songs, songItem),
    albums: mapSection(data?.albums, albumItem),
    artists: mapSection(data?.artists, artistItem),
    playlists: mapSection(data?.playlists, playlistItem),
  };
}

export function buildSearchSongs(data: any, limit: number) {
  return {
    total: parseInt(data?.total || 0),
    start: parseInt(data?.start || 0),
    results: (data?.results || []).slice(0, limit).map(buildSong),
  };
}

export function buildSearchAlbums(data: any, limit: number) {
  const results = (data?.results || []).slice(0, limit).map((item: any) => {
    const mi = item?.more_info || {};
    const am = mi?.artistMap || {};
    return {
      id: item?.id,
      name: item?.title,
      description: item?.header_desc,
      url: item?.perma_url,
      year: item?.year ? parseInt(item.year) : null,
      type: item?.type,
      playCount: item?.play_count ? parseInt(item.play_count) : null,
      language: item?.language,
      explicitContent: item?.explicit_content === '1',
      artists: {
        primary: (am?.primary_artists || []).map(buildArtistMap),
        featured: (am?.featured_artists || []).map(buildArtistMap),
        all: (am?.artists || []).map(buildArtistMap),
      },
      image: createImageLinks(item?.image || ''),
    };
  });

  return {
    total: parseInt(data?.total || 0),
    start: parseInt(data?.start || 0),
    results,
  };
}

export function buildSearchArtists(data: any, limit: number) {
  return {
    total: parseInt(data?.total || 0),
    start: parseInt(data?.start || 0),
    results: (data?.results || []).slice(0, limit).map(buildArtistMap),
  };
}

export function buildSearchPlaylists(data: any, limit: number) {
  const results = (data?.results || []).slice(0, limit).map((item: any) => {
    const mi = item?.more_info || {};
    return {
      id: item?.id,
      name: item?.title,
      type: item?.type,
      image: createImageLinks(item?.image || ''),
      url: item?.perma_url,
      songCount: mi?.song_count ? parseInt(mi.song_count) : null,
      language: mi?.language,
      explicitContent: item?.explicit_content === '1',
    };
  });

  return {
    total: parseInt(data?.total || 0),
    start: parseInt(data?.start || 0),
    results,
  };
}

export function buildHomeModules(launchData: any) {
  const parseItems = (list: any[]) => {
    if (!Array.isArray(list)) return [];
    return list
      .filter(item => item && (item.type === 'playlist' || item.type === 'album' || item.type === 'song' || item.type === 'channel'))
      .map(item => {
        const mi = item?.more_info || {};
        return {
          id: item?.id || item?.listid || '',
          title: item?.title || item?.name || item?.header_desc || 'Music',
          subtitle: item?.subtitle || item?.header_desc || mi?.firstname || mi?.music || '',
          type: item?.type || 'playlist',
          image: createImageLinks(item?.image || ''),
          url: item?.perma_url || '',
          explicitContent: item?.explicit_content === '1',
          followerCount: mi?.follower_count ? parseInt(mi.follower_count) : null,
          songCount: mi?.song_count ? parseInt(mi.song_count) : null,
        };
      });
  };

  const sections: any[] = [];

  // Top Playlists (editorial + community)
  const topPlaylists = parseItems(launchData?.top_playlists || []);
  if (topPlaylists.length > 0) {
    sections.push({
      id: 'top_playlists',
      title: 'Top Playlists',
      subtitle: 'Handpicked playlists for you',
      items: topPlaylists,
    });
  }

  // Charts
  const charts = parseItems(launchData?.charts || []);
  if (charts.length > 0) {
    sections.push({
      id: 'top_charts',
      title: 'Top Charts',
      subtitle: 'Official trending music charts',
      items: charts,
    });
  }

  // New Trending (songs, albums, playlists mixed)
  const newTrending = parseItems(launchData?.new_trending || []);
  if (newTrending.length > 0) {
    sections.push({
      id: 'new_trending',
      title: 'New & Trending',
      subtitle: 'Fresh releases & viral hits',
      items: newTrending,
    });
  }

  // New Albums
  const newAlbums = parseItems(launchData?.new_albums || []);
  if (newAlbums.length > 0) {
    sections.push({
      id: 'new_albums',
      title: 'New Releases',
      subtitle: 'Latest albums & singles',
      items: newAlbums,
    });
  }

  return sections;
}

