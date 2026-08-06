import {
  Song,
  SearchAllData,
  AlbumDetails,
  PlaylistDetails,
  ArtistDetails,
  AlbumSearchResult,
  PlaylistSearchResult,
  ArtistMap,
  HomeModuleSection,
} from '../types';
import {
  jiosaavnFetch,
  buildSong,
  buildAlbum,
  buildPlaylist,
  buildArtist,
  buildSearchAll,
  buildSearchSongs,
  buildSearchAlbums,
  buildSearchArtists,
  buildSearchPlaylists,
  buildHomeModules,
  fetchSongSuggestions,
} from './jiosaavnService';

async function fetchApi<T>(endpoint: string): Promise<T | null> {
  try {
    const res = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    const contentType = res.headers.get('content-type') || '';
    if (res.ok && contentType.includes('application/json')) {
      const json = await res.json();
      if (json && json.success) {
        return json.data as T;
      }
    }
  } catch (error) {
    console.warn(`API endpoint ${endpoint} unavailable:`, error);
  }
  return null;
}

export const jioSaavnApi = {
  // Dynamic Home Modules & Featured Playlists
  getHomeModules: async (): Promise<HomeModuleSection[]> => {
    const list = await fetchApi<HomeModuleSection[]>('/api/modules');
    if (list && list.length > 0) return list;

    // Direct fallback - try content.getBrowseModules first (returns real data)
    try {
      const browseData = await jiosaavnFetch('content.getBrowseModules', { language: 'hindi' });
      if (browseData && !browseData.error) {
        return buildHomeModules(browseData);
      }
      const launchData = await jiosaavnFetch('webapi.get', { launch_data: true, type: 'launch_data' });
      return launchData ? buildHomeModules(launchData) : [];
    } catch (err) {
      console.error('Client fallback getHomeModules failed', err);
      return [];
    }
  },

  // Global search
  searchAll: async (query: string): Promise<SearchAllData | null> => {
    if (!query.trim()) return null;
    const res = await fetchApi<SearchAllData>(`/api/search?query=${encodeURIComponent(query)}`);
    if (res) return res;

    // Direct fallback
    try {
      const data = await jiosaavnFetch('autocomplete.get', { query });
      return data ? buildSearchAll(data) : null;
    } catch (err) {
      console.error('Client fallback searchAll failed', err);
      return null;
    }
  },

  // Songs search
  searchSongs: async (
    query: string,
    page: number = 0,
    limit: number = 20
  ): Promise<{ total: number; start: number; results: Song[] } | null> => {
    if (!query.trim()) return null;
    const res = await fetchApi<{ total: number; start: number; results: Song[] }>(
      `/api/search/songs?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    if (res) return res;

    // Direct fallback
    try {
      const data = await jiosaavnFetch('search.getResults', { q: query, p: page, n: limit });
      return data ? buildSearchSongs(data, limit) : null;
    } catch (err) {
      console.error('Client fallback searchSongs failed', err);
      return null;
    }
  },

  // Albums search
  searchAlbums: async (
    query: string,
    page: number = 0,
    limit: number = 20
  ): Promise<{ total: number; start: number; results: AlbumSearchResult[] } | null> => {
    if (!query.trim()) return null;
    const res = await fetchApi<{ total: number; start: number; results: AlbumSearchResult[] }>(
      `/api/search/albums?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    if (res) return res;

    // Direct fallback
    try {
      const data = await jiosaavnFetch('search.getAlbumResults', { q: query, p: page, n: limit });
      return data ? buildSearchAlbums(data, limit) : null;
    } catch (err) {
      console.error('Client fallback searchAlbums failed', err);
      return null;
    }
  },

  // Artists search
  searchArtists: async (
    query: string,
    page: number = 0,
    limit: number = 20
  ): Promise<{ total: number; start: number; results: ArtistMap[] } | null> => {
    if (!query.trim()) return null;
    const res = await fetchApi<{ total: number; start: number; results: ArtistMap[] }>(
      `/api/search/artists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    if (res) return res;

    // Direct fallback
    try {
      const data = await jiosaavnFetch('search.getArtistResults', { q: query, p: page, n: limit });
      return data ? buildSearchArtists(data, limit) : null;
    } catch (err) {
      console.error('Client fallback searchArtists failed', err);
      return null;
    }
  },

  // Playlists search
  searchPlaylists: async (
    query: string,
    page: number = 0,
    limit: number = 20
  ): Promise<{ total: number; start: number; results: PlaylistSearchResult[] } | null> => {
    if (!query.trim()) return null;
    const res = await fetchApi<{ total: number; start: number; results: PlaylistSearchResult[] }>(
      `/api/search/playlists?query=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
    if (res) return res;

    // Direct fallback
    try {
      const data = await jiosaavnFetch('search.getPlaylistResults', { q: query, p: page, n: limit });
      return data ? buildSearchPlaylists(data, limit) : null;
    } catch (err) {
      console.error('Client fallback searchPlaylists failed', err);
      return null;
    }
  },

  // Get song details by ID
  getSongById: async (songId: string): Promise<Song | null> => {
    const list = await fetchApi<Song[]>(`/api/songs/${encodeURIComponent(songId)}`);
    if (list && list.length > 0) return list[0];

    // Direct fallback
    try {
      const data = await jiosaavnFetch('song.getDetails', { pids: songId });
      const songs = data?.songs || [];
      return songs.length > 0 ? buildSong(songs[0]) : null;
    } catch (err) {
      console.error('Client fallback getSongById failed', err);
      return null;
    }
  },

  // Get song details by multiple IDs
  getSongsByIds: async (ids: string): Promise<Song[]> => {
    const list = await fetchApi<Song[]>(`/api/songs?ids=${encodeURIComponent(ids)}`);
    if (list) return list;

    // Direct fallback
    try {
      const data = await jiosaavnFetch('song.getDetails', { pids: ids });
      const songs = data?.songs || [];
      return songs.map(buildSong);
    } catch (err) {
      console.error('Client fallback getSongsByIds failed', err);
      return [];
    }
  },

  // Get song details by JioSaavn URL
  getSongByLink: async (link: string): Promise<Song | null> => {
    const list = await fetchApi<Song[]>(`/api/songs?link=${encodeURIComponent(link)}`);
    if (list && list.length > 0) return list[0];

    // Direct fallback
    try {
      const match = link.match(/jiosaavn\.com\/song\/[^\/]+\/([^/?]+)/);
      const token = match ? match[1] : null;
      if (!token) return null;
      const data = await jiosaavnFetch('webapi.get', { token, type: 'song' });
      const songs = data?.songs || [];
      return songs.length > 0 ? buildSong(songs[0]) : null;
    } catch (err) {
      console.error('Client fallback getSongByLink failed', err);
      return null;
    }
  },

  // Get song recommendations / radio suggestions
  getSongSuggestions: async (songId: string, limit: number = 10): Promise<Song[]> => {
    const list = await fetchApi<Song[]>(`/api/songs/${encodeURIComponent(songId)}/suggestions?limit=${limit}`);
    if (list && list.length > 0) return list;

    // Direct fallback (reco.getreco + station + similar-artist mix)
    try {
      return await fetchSongSuggestions(songId, limit);
    } catch (err) {
      console.error('Client fallback getSongSuggestions failed', err);
      return [];
    }
  },

  // Get album details by ID or link
  getAlbum: async (idOrLink: { id?: string; link?: string }): Promise<AlbumDetails | null> => {
    let res: AlbumDetails | null = null;
    if (idOrLink.link) {
      res = await fetchApi<AlbumDetails>(`/api/albums?link=${encodeURIComponent(idOrLink.link)}`);
    } else if (idOrLink.id) {
      res = await fetchApi<AlbumDetails>(`/api/albums?id=${encodeURIComponent(idOrLink.id)}`);
    }
    if (res) return res;

    // Direct fallback
    try {
      let data: any = null;
      if (idOrLink.link) {
        const match = idOrLink.link.match(/jiosaavn\.com\/album\/[^\/]+\/([^/?]+)/);
        const token = match ? match[1] : null;
        if (token) {
          data = await jiosaavnFetch('webapi.get', { token, type: 'album' });
        }
      } else if (idOrLink.id) {
        data = await jiosaavnFetch('content.getAlbumDetails', { albumid: idOrLink.id });
      }
      return data ? buildAlbum(data) : null;
    } catch (err) {
      console.error('Client fallback getAlbum failed', err);
      return null;
    }
  },

  // Get playlist details by ID or link
  getPlaylist: async (
    idOrLink: { id?: string; link?: string },
    page: number = 0,
    limit: number = 50
  ): Promise<PlaylistDetails | null> => {
    let res: PlaylistDetails | null = null;
    if (idOrLink.link) {
      res = await fetchApi<PlaylistDetails>(
        `/api/playlists?link=${encodeURIComponent(idOrLink.link)}&page=${page}&limit=${limit}`
      );
    } else if (idOrLink.id) {
      res = await fetchApi<PlaylistDetails>(
        `/api/playlists?id=${encodeURIComponent(idOrLink.id)}&page=${page}&limit=${limit}`
      );
    }
    if (res) return res;

    // Direct fallback
    try {
      let data: any = null;
      if (idOrLink.link) {
        const match = idOrLink.link.match(/(?:jiosaavn\.com|saavn\.com)\/(?:featured|s\/playlist)\/[^\/]+\/([^/?]+)|\/([^/?]+)$/);
        const token = match ? match[1] || match[2] : null;
        if (token) {
          data = await jiosaavnFetch('webapi.get', { token, type: 'playlist', n: limit, p: page });
        }
      } else if (idOrLink.id) {
        data = await jiosaavnFetch('playlist.getDetails', { listid: idOrLink.id, n: limit, p: page });
      }
      if (!data) return null;

      const playlist = buildPlaylist(data);
      if (playlist.songs) {
        playlist.songs = playlist.songs.slice(0, limit);
      }
      return playlist;
    } catch (err) {
      console.error('Client fallback getPlaylist failed', err);
      return null;
    }
  },

  // Get artist details by ID or link
  getArtist: async (
    idOrLink: { id?: string; link?: string },
    songCount: number = 20,
    albumCount: number = 10
  ): Promise<ArtistDetails | null> => {
    let res: ArtistDetails | null = null;
    if (idOrLink.link) {
      res = await fetchApi<ArtistDetails>(
        `/api/artists?link=${encodeURIComponent(idOrLink.link)}&songCount=${songCount}&albumCount=${albumCount}`
      );
    } else if (idOrLink.id) {
      res = await fetchApi<ArtistDetails>(
        `/api/artists?id=${encodeURIComponent(idOrLink.id)}&songCount=${songCount}&albumCount=${albumCount}`
      );
    }
    if (res) return res;

    // Direct fallback
    try {
      const params: any = {
        n_song: songCount,
        n_album: albumCount,
        page: 0,
        sort_order: 'desc',
        category: 'popularity',
      };
      let data: any = null;
      if (idOrLink.link) {
        const match = idOrLink.link.match(/jiosaavn\.com\/artist\/[^\/]+\/([^/?]+)/);
        const token = match ? match[1] : null;
        if (token) {
          params.token = token;
          params.type = 'artist';
          data = await jiosaavnFetch('webapi.get', params);
        }
      } else if (idOrLink.id) {
        params.artistId = idOrLink.id;
        data = await jiosaavnFetch('artist.getArtistPageDetails', params);
      }
      return data ? buildArtist(data) : null;
    } catch (err) {
      console.error('Client fallback getArtist failed', err);
      return null;
    }
  },

  // Auto detect JioSaavn URL type and resolve entity
  resolveJioSaavnLink: async (
    url: string
  ): Promise<{
    type: 'song' | 'album' | 'playlist' | 'artist' | 'unknown';
    data: any;
  }> => {
    const cleanUrl = url.trim();
    if (cleanUrl.includes('/song/')) {
      const song = await jioSaavnApi.getSongByLink(cleanUrl);
      return { type: 'song', data: song };
    }
    if (cleanUrl.includes('/album/')) {
      const album = await jioSaavnApi.getAlbum({ link: cleanUrl });
      return { type: 'album', data: album };
    }
    if (cleanUrl.includes('/playlist/') || cleanUrl.includes('/featured/') || cleanUrl.includes('/s/playlist/')) {
      const playlist = await jioSaavnApi.getPlaylist({ link: cleanUrl });
      return { type: 'playlist', data: playlist };
    }
    if (cleanUrl.includes('/artist/')) {
      const artist = await jioSaavnApi.getArtist({ link: cleanUrl });
      return { type: 'artist', data: artist };
    }
    return { type: 'unknown', data: null };
  },
};
