import express from 'express';
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
  fetchSongSuggestions,
} from '../src/services/jiosaavnService.js';

const app = express();

app.use(express.json());

app.use('/api', (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }
  next();
});

const ok = (res: express.Response, data: any) => res.json({ success: true, data });
const err = (res: express.Response, msg: string, status = 400) =>
  res.status(status).json({ success: false, message: msg });

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', engine: 'Vercel Serverless JioSaavn Engine' });
});

app.get('/api/search', async (req, res) => {
  try {
    const query = (req.query.query as string || '').trim();
    if (!query) return err(res, 'query parameter is required');
    const data = await jiosaavnFetch('autocomplete.get', { query });
    if (!data) return err(res, `No results found for '${query}'`, 404);
    return ok(res, buildSearchAll(data));
  } catch (e: any) {
    return err(res, e.message || 'Internal error', 500);
  }
});

app.get('/api/search/songs', async (req, res) => {
  try {
    const query = (req.query.query as string || '').trim();
    const page = parseInt(req.query.page as string || '0');
    const limit = parseInt(req.query.limit as string || '10');
    if (!query) return err(res, 'query parameter is required');
    const data = await jiosaavnFetch('search.getResults', { q: query, p: page, n: limit });
    return ok(res, buildSearchSongs(data, limit));
  } catch (e: any) {
    return err(res, e.message || 'Internal error', 500);
  }
});

app.get('/api/search/albums', async (req, res) => {
  try {
    const query = (req.query.query as string || '').trim();
    const page = parseInt(req.query.page as string || '0');
    const limit = parseInt(req.query.limit as string || '10');
    if (!query) return err(res, 'query parameter is required');
    const data = await jiosaavnFetch('search.getAlbumResults', { q: query, p: page, n: limit });
    return ok(res, buildSearchAlbums(data, limit));
  } catch (e: any) {
    return err(res, e.message || 'Internal error', 500);
  }
});

app.get('/api/search/artists', async (req, res) => {
  try {
    const query = (req.query.query as string || '').trim();
    const page = parseInt(req.query.page as string || '0');
    const limit = parseInt(req.query.limit as string || '10');
    if (!query) return err(res, 'query parameter is required');
    const data = await jiosaavnFetch('search.getArtistResults', { q: query, p: page, n: limit });
    return ok(res, buildSearchArtists(data, limit));
  } catch (e: any) {
    return err(res, e.message || 'Internal error', 500);
  }
});

app.get('/api/search/playlists', async (req, res) => {
  try {
    const query = (req.query.query as string || '').trim();
    const page = parseInt(req.query.page as string || '0');
    const limit = parseInt(req.query.limit as string || '10');
    if (!query) return err(res, 'query parameter is required');
    const data = await jiosaavnFetch('search.getPlaylistResults', { q: query, p: page, n: limit });
    return ok(res, buildSearchPlaylists(data, limit));
  } catch (e: any) {
    return err(res, e.message || 'Internal error', 500);
  }
});

app.get('/api/songs', async (req, res) => {
  try {
    const ids = req.query.ids as string;
    const link = req.query.link as string;
    if (!ids && !link) return err(res, 'Either song IDs or link is required');
    let songs: any[] = [];
    if (link) {
      const match = link.match(/jiosaavn\.com\/song\/[^\/]+\/([^/?]+)/);
      const token = match ? match[1] : null;
      if (!token) return err(res, 'Invalid JioSaavn song link');
      const data = await jiosaavnFetch('webapi.get', { token, type: 'song' });
      songs = data?.songs || [];
    } else {
      const data = await jiosaavnFetch('song.getDetails', { pids: ids });
      songs = data?.songs || [];
    }
    if (!songs || songs.length === 0) return err(res, 'Song not found', 404);
    return ok(res, songs.map(buildSong));
  } catch (e: any) {
    return err(res, e.message || 'Internal error', 500);
  }
});

app.get('/api/songs/:id', async (req, res) => {
  try {
    const songId = req.params.id;
    const data = await jiosaavnFetch('song.getDetails', { pids: songId });
    const songs = data?.songs || [];
    if (!songs || songs.length === 0) return err(res, 'Song not found', 404);
    return ok(res, songs.map(buildSong));
  } catch (e: any) {
    return err(res, e.message || 'Internal error', 500);
  }
});

app.get('/api/songs/:id/suggestions', async (req, res) => {
  try {
    const songId = req.params.id;
    const limit = parseInt(req.query.limit as string || '10');
    const suggestions = await fetchSongSuggestions(songId, limit);
    return ok(res, suggestions);
  } catch (e: any) {
    return err(res, e.message || 'Internal error', 500);
  }
});

app.get('/api/albums', async (req, res) => {
  try {
    const albumId = req.query.id as string;
    const link = req.query.link as string;
    if (!albumId && !link) return err(res, 'Either album ID or link is required');
    let data: any = null;
    if (link) {
      const match = link.match(/jiosaavn\.com\/album\/[^\/]+\/([^/?]+)/);
      const token = match ? match[1] : null;
      if (!token) return err(res, 'Invalid JioSaavn album link');
      data = await jiosaavnFetch('webapi.get', { token, type: 'album' });
    } else {
      data = await jiosaavnFetch('content.getAlbumDetails', { albumid: albumId });
    }
    if (!data) return err(res, 'Album not found', 404);
    return ok(res, buildAlbum(data));
  } catch (e: any) {
    return err(res, e.message || 'Internal error', 500);
  }
});

app.get('/api/playlists', async (req, res) => {
  try {
    const plId = req.query.id as string;
    const link = req.query.link as string;
    const page = parseInt(req.query.page as string || '0');
    const limit = parseInt(req.query.limit as string || '10');
    if (!plId && !link) return err(res, 'Either playlist ID or link is required');
    let data: any = null;
    if (link) {
      const match = link.match(/(?:jiosaavn\.com|saavn\.com)\/(?:featured|s\/playlist)\/[^\/]+\/([^/?]+)|\/([^/?]+)$/);
      const token = match ? match[1] || match[2] : null;
      if (!token) return err(res, 'Invalid JioSaavn playlist link');
      data = await jiosaavnFetch('webapi.get', { token, type: 'playlist', n: limit, p: page });
    } else {
      data = await jiosaavnFetch('playlist.getDetails', { listid: plId, n: limit, p: page });
    }
    if (!data) return err(res, 'Playlist not found', 404);
    const playlist = buildPlaylist(data);
    if (playlist.songs) {
      playlist.songs = playlist.songs.slice(0, limit);
    }
    return ok(res, playlist);
  } catch (e: any) {
    return err(res, e.message || 'Internal error', 500);
  }
});

app.get('/api/artists', async (req, res) => {
  try {
    const artistId = req.query.id as string;
    const link = req.query.link as string;
    const page = parseInt(req.query.page as string || '0');
    const songCount = parseInt(req.query.songCount as string || '10');
    const albumCount = parseInt(req.query.albumCount as string || '10');
    const sortBy = (req.query.sortBy as string) || 'popularity';
    const sortOrder = (req.query.sortOrder as string) || 'desc';
    if (!artistId && !link) return err(res, 'Either artist ID or link is required');
    const params: any = {
      n_song: songCount,
      n_album: albumCount,
      page: page,
      sort_order: sortOrder,
      category: sortBy,
    };
    let data: any = null;
    if (link) {
      const match = link.match(/jiosaavn\.com\/artist\/[^\/]+\/([^/?]+)/);
      const token = match ? match[1] : null;
      if (!token) return err(res, 'Invalid JioSaavn artist link');
      params.token = token;
      params.type = 'artist';
      data = await jiosaavnFetch('webapi.get', params);
    } else {
      params.artistId = artistId;
      data = await jiosaavnFetch('artist.getArtistPageDetails', params);
    }
    if (!data) return err(res, 'Artist not found', 404);
    return ok(res, buildArtist(data));
  } catch (e: any) {
    return err(res, e.message || 'Internal error', 500);
  }
});

app.get('/api/artists/:id', async (req, res) => {
  try {
    const artistId = req.params.id;
    const page = parseInt(req.query.page as string || '0');
    const songCount = parseInt(req.query.songCount as string || '10');
    const albumCount = parseInt(req.query.albumCount as string || '10');
    const sortBy = (req.query.sortBy as string) || 'popularity';
    const sortOrder = (req.query.sortOrder as string) || 'desc';
    const data = await jiosaavnFetch('artist.getArtistPageDetails', {
      artistId: artistId,
      n_song: songCount,
      n_album: albumCount,
      page: page,
      sort_order: sortOrder,
      category: sortBy,
    });
    if (!data) return err(res, 'Artist not found', 404);
    return ok(res, buildArtist(data));
  } catch (e: any) {
    return err(res, e.message || 'Internal error', 500);
  }
});

app.get('/api/download', async (req, res) => {
  try {
    const rawUrl = req.query.url as string;
    const rawName = (req.query.name as string) || 'AudioTrack';

    if (!rawUrl) {
      return res.status(400).send('Missing url parameter');
    }

    let cleanName = rawName.replace(/[/\\?%*:|"<>]/g, '').trim() || 'Track';
    if (!cleanName.toLowerCase().endsWith('.mp3')) {
      cleanName = `${cleanName}.mp3`;
    }

    const audioRes = await fetch(rawUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*',
        'Referer': 'https://www.jiosaavn.com/',
      },
    });

    if (!audioRes.ok) {
      return res.status(audioRes.status).send('Failed to fetch audio stream');
    }

    const arrayBuf = await audioRes.arrayBuffer();
    const buffer = Buffer.from(arrayBuf);

    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', buffer.length.toString());
    res.setHeader(
      'Content-Disposition',
      `attachment; filename="${encodeURIComponent(cleanName)}"; filename*=UTF-8''${encodeURIComponent(cleanName)}`
    );

    return res.send(buffer);
  } catch (e: any) {
    console.error('Download proxy error:', e);
    if (!res.headersSent) {
      return res.status(500).send('Download failed: ' + e.message);
    }
  }
});

export default app;
