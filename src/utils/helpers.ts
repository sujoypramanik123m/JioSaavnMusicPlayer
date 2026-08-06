import { ImageLink, DownloadLink, Song } from '../types';

export function getBestImage(images?: ImageLink[] | string, preferredQuality: '500x500' | '150x150' | '50x50' = '500x500'): string {
  if (!images) return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80';
  if (typeof images === 'string') return images;
  if (!Array.isArray(images) || images.length === 0) return 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80';

  const exact = images.find(img => img && typeof img === 'object' && img.quality === preferredQuality);
  if (exact && exact.url) return exact.url;

  // Fallback order
  const order = ['500x500', '150x150', '50x50'];
  for (const q of order) {
    const found = images.find(img => img && typeof img === 'object' && img.quality === q);
    if (found && found.url) return found.url;
  }

  return images[0]?.url || 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80';
}

export function getDownloadUrl(downloadUrls?: DownloadLink[], preferredQuality: string = '320kbps'): { quality: string; url: string } | null {
  if (!downloadUrls || !Array.isArray(downloadUrls) || downloadUrls.length === 0) return null;

  const exact = downloadUrls.find(d => d && typeof d === 'object' && d.quality === preferredQuality);
  if (exact && exact.url) return { quality: exact.quality, url: exact.url };

  // Preferred quality hierarchy
  const hierarchy = ['320kbps', '160kbps', '96kbps', '48kbps', '12kbps'];
  for (const q of hierarchy) {
    const found = downloadUrls.find(d => d && typeof d === 'object' && d.quality === q);
    if (found && found.url) return { quality: found.quality, url: found.url };
  }

  return downloadUrls[0] && downloadUrls[0].url ? { quality: downloadUrls[0].quality || preferredQuality, url: downloadUrls[0].url } : null;
}

export function formatDuration(seconds?: number | null): string {
  if (!seconds || isNaN(seconds) || seconds <= 0) return '0:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
}

export function formatNumber(num?: number | null): string {
  if (!num || isNaN(num)) return '0';
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function getPrimaryArtists(song?: Song | null): string {
  if (!song) return 'Unknown Artist';
  if (typeof song.artists === 'string') {
    return song.artists;
  }
  if (song.artists && typeof song.artists === 'object') {
    if (Array.isArray(song.artists.primary) && song.artists.primary.length > 0) {
      return song.artists.primary.map(a => (typeof a === 'string' ? a : a?.name || '')).filter(Boolean).join(', ');
    }
    if (Array.isArray(song.artists.all) && song.artists.all.length > 0) {
      return song.artists.all.map(a => (typeof a === 'string' ? a : a?.name || '')).filter(Boolean).join(', ');
    }
  }
  return 'Unknown Artist';
}

export function decodeHTMLEntities(str: string): string {
  if (!str) return '';
  const txt = document.createElement('textarea');
  txt.innerHTML = str;
  return txt.value;
}

export async function triggerDownloadFile(audioUrl: string, filename: string): Promise<boolean> {
  const cleanFilename = filename.endsWith('.mp3') ? filename : `${filename}.mp3`;
  const proxyUrl = `/api/download?url=${encodeURIComponent(audioUrl)}&name=${encodeURIComponent(cleanFilename)}`;

  try {
    let res = await fetch(proxyUrl);
    const contentType = res.headers.get('content-type') || '';

    if (res.ok && !contentType.includes('text/html') && !contentType.includes('text/plain')) {
      const blob = await res.blob();
      const mp3Blob = new Blob([blob], { type: 'audio/mpeg' });
      const blobUrl = URL.createObjectURL(mp3Blob);

      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = cleanFilename;
      document.body.appendChild(a);
      a.click();

      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
        URL.revokeObjectURL(blobUrl);
      }, 2000);
      return true;
    } else {
      // Fallback direct link
      const a = document.createElement('a');
      a.href = proxyUrl;
      a.download = cleanFilename;
      document.body.appendChild(a);
      a.click();
      setTimeout(() => {
        if (document.body.contains(a)) {
          document.body.removeChild(a);
        }
      }, 1000);
      return true;
    }
  } catch (err) {
    const a = document.createElement('a');
    a.href = proxyUrl;
    a.download = cleanFilename;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => {
      if (document.body.contains(a)) {
        document.body.removeChild(a);
      }
    }, 1000);
    return true;
  }
}

export function estimateFileSize(durationSec?: number | null, quality: string = '320kbps'): string {
  if (!durationSec) return '2-8 MB';
  const kbpsMap: Record<string, number> = {
    '320kbps': 320,
    '160kbps': 160,
    '96kbps': 96,
    '48kbps': 48,
    '12kbps': 12,
  };
  const kbps = kbpsMap[quality] || 160;
  // Size in MegaBytes = (kbps * 1000 / 8 * seconds) / (1024 * 1024)
  const bytes = (kbps * 1000 / 8) * durationSec;
  const mb = bytes / (1024 * 1024);
  return `${mb.toFixed(1)} MB`;
}
