export interface ImageLink {
  quality: '50x50' | '150x150' | '500x500' | string;
  url: string;
}

export interface DownloadLink {
  quality: '12kbps' | '48kbps' | '96kbps' | '160kbps' | '320kbps' | string;
  url: string;
}

export interface ArtistMap {
  id: string;
  name: string;
  role?: string;
  image?: ImageLink[] | string;
  type?: string;
  url?: string;
}

export interface SongAlbum {
  id?: string | null;
  name?: string | null;
  url?: string | null;
}

export interface SongArtists {
  primary: ArtistMap[];
  featured: ArtistMap[];
  all: ArtistMap[];
}

export interface Song {
  id: string;
  name: string;
  type?: string;
  year?: string | number | null;
  releaseDate?: string | null;
  duration?: number | null; // in seconds
  label?: string | null;
  explicitContent?: boolean;
  playCount?: number | null;
  language?: string;
  hasLyrics?: boolean;
  lyricsId?: string | null;
  url?: string;
  copyright?: string | null;
  album: SongAlbum;
  artists: SongArtists;
  image: ImageLink[];
  downloadUrl: DownloadLink[];
}

export interface AlbumSearchResult {
  id: string;
  name: string;
  description?: string;
  url?: string;
  year?: number | null;
  type?: string;
  playCount?: number | null;
  language?: string;
  explicitContent?: boolean;
  artists?: SongArtists;
  image: ImageLink[];
}

export interface PlaylistSearchResult {
  id: string;
  name: string;
  type?: string;
  image: ImageLink[];
  url?: string;
  songCount?: number | null;
  language?: string;
  explicitContent?: boolean;
  description?: string;
}

export interface SearchTopQueryItem {
  id: string;
  title: string;
  image: ImageLink[];
  album?: string;
  url?: string;
  type: string;
  language?: string;
  description?: string;
  primaryArtists?: string;
  singers?: string;
}

export interface SearchSongItem {
  id: string;
  title: string;
  image: ImageLink[];
  album?: string;
  url?: string;
  type: string;
  description?: string;
  primaryArtists?: string;
  singers?: string;
  language?: string;
}

export interface SearchAlbumItem {
  id: string;
  title: string;
  image: ImageLink[];
  artist?: string;
  url?: string;
  type: string;
  description?: string;
  year?: string;
  songIds?: string;
  language?: string;
}

export interface SearchArtistItem {
  id: string;
  title: string;
  image: ImageLink[];
  type: string;
  description?: string;
  position?: number;
}

export interface SearchPlaylistItem {
  id: string;
  title: string;
  image: ImageLink[];
  url?: string;
  type: string;
  language?: string;
  description?: string;
}

export interface SearchAllData {
  topQuery: {
    results: SearchTopQueryItem[];
    position?: number;
  };
  songs: {
    results: SearchSongItem[];
    position?: number;
  };
  albums: {
    results: SearchAlbumItem[];
    position?: number;
  };
  artists: {
    results: SearchArtistItem[];
    position?: number;
  };
  playlists: {
    results: SearchPlaylistItem[];
    position?: number;
  };
}

export interface AlbumDetails {
  id: string;
  name: string;
  description?: string;
  type?: string;
  year?: number | null;
  playCount?: number | null;
  language?: string;
  explicitContent?: boolean;
  url?: string;
  songCount?: number | null;
  artists?: SongArtists;
  image: ImageLink[];
  songs?: Song[] | null;
}

export interface PlaylistDetails {
  id: string;
  name: string;
  description?: string;
  type?: string;
  year?: number | null;
  playCount?: number | null;
  language?: string;
  explicitContent?: boolean;
  url?: string;
  songCount?: number;
  followerCount?: number | null;
  lastUpdated?: string | null;
  username?: string | null;
  firstname?: string | null;
  lastname?: string | null;
  image: ImageLink[];
  songs: Song[];
}

export interface ArtistDetails {
  id: string;
  name: string;
  url?: string;
  type?: string;
  followerCount?: number | null;
  fanCount?: number | null;
  isVerified?: boolean;
  dominantLanguage?: string | null;
  dominantType?: string | null;
  bio?: any;
  dob?: string | null;
  fb?: string | null;
  twitter?: string | null;
  wiki?: string | null;
  availableLanguages?: string[] | null;
  isRadioPresent?: boolean;
  image: ImageLink[];
  topSongs?: Song[] | null;
  topAlbums?: AlbumDetails[] | null;
  singles?: Song[] | null;
  similarArtists?: any[] | null;
}

export interface DownloadHistoryItem {
  id: string;
  songName: string;
  artistName: string;
  albumName: string;
  quality: string;
  imageUrl: string;
  downloadedAt: string;
  url: string;
}

export interface CustomPlaylist {
  id: string;
  name: string;
  createdAt: string;
  songs: Song[];
}

export type PlaybackQuality = '320kbps' | '160kbps' | '96kbps' | '48kbps' | '12kbps';

export interface HomeModuleItem {
  id: string;
  title: string;
  subtitle?: string;
  type: 'playlist' | 'album' | 'song' | string;
  image: ImageLink[];
  url?: string;
  explicitContent?: boolean;
  followerCount?: number | null;
}

export interface HomeModuleSection {
  id: string;
  title: string;
  subtitle?: string;
  items: HomeModuleItem[];
}
