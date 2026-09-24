/**
 * Utility untuk memproses URL media (Google Drive, YouTube, direct URL)
 * Menjamin gambar dari Google Drive dapat ditampilkan langsung di browser tanpa autentikasi/CORS issue,
 * dan mengenali link/iframe video YouTube secara otomatis.
 */

export interface MediaInfo {
  type: "image" | "youtube";
  thumbnailUrl: string;
  originalUrl: string;
  youtubeId?: string;
  embedUrl?: string;
}

export function parseMediaUrl(url: string | null | undefined): MediaInfo {
  if (!url) {
    return {
      type: "image",
      thumbnailUrl: "",
      originalUrl: "",
    };
  }

  const trimmed = url.trim();

  // 1. Cek apakah ini embed iframe YouTube atau URL YouTube
  let youtubeId: string | null = null;

  // Dari atribut src iframe
  const iframeMatch = trimmed.match(/src=["'](?:https?:)?\/\/(?:www\.)?youtube\.com\/embed\/([a-zA-Z0-9_-]+)/i);
  if (iframeMatch) {
    youtubeId = iframeMatch[1];
  }

  // Dari link YouTube biasa (watch, youtu.be, embed, shorts)
  if (!youtubeId) {
    const ytMatch = trimmed.match(/(?:youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i);
    if (ytMatch) {
      youtubeId = ytMatch[1];
    }
  }

  if (youtubeId) {
    return {
      type: "youtube",
      thumbnailUrl: `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`,
      originalUrl: trimmed,
      youtubeId,
      embedUrl: `https://www.youtube.com/embed/${youtubeId}?autoplay=1`,
    };
  }

  // 2. Cek apakah ini Google Drive
  let driveId: string | null = null;

  const fileMatch = trimmed.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (fileMatch) driveId = fileMatch[1];

  if (!driveId) {
    const idMatch = trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (idMatch) driveId = idMatch[1];
  }

  if (!driveId && trimmed.includes("lh3.googleusercontent.com/d/")) {
    const lh3Match = trimmed.match(/lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/);
    if (lh3Match) driveId = lh3Match[1];
  }

  if (driveId) {
    // Format langsung lh3.googleusercontent.com/d/ID adalah format thumbnail resmi Google yang sangat cepat & publik
    // Hindari =w600 karena Google memproses ulang secara dinamis di server yang memicu delay 2-5 detik
    const directUrl = `https://lh3.googleusercontent.com/d/${driveId}`;
    return {
      type: "image",
      thumbnailUrl: directUrl,
      originalUrl: directUrl,
    };
  }

  // 3. Format URL gambar biasa
  return {
    type: "image",
    thumbnailUrl: trimmed,
    originalUrl: trimmed,
  };
}

export function toDirectImageUrl(url: string | null | undefined): string {
  return parseMediaUrl(url).thumbnailUrl;
}
