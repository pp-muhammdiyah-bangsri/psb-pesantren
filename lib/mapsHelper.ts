/**
 * Helper utility for parsing and resolving Google Maps Embed URLs
 * Supports full <iframe> snippet, direct embed URL, place link, or query fallback.
 */

export interface MapsStatusInfo {
  type: "empty" | "iframe" | "embed_url" | "shortlink" | "place_url" | "custom";
  isValid: boolean;
  message: string;
}

export function parseGoogleMapsEmbedUrl(
  rawInput?: string,
  defaultQuery: string = "Pondok Pesantren Muhammadiyah Bangsri, Jepara"
): string {
  if (!rawInput || !rawInput.trim()) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(defaultQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  let str = rawInput.trim();

  // 1. If user pasted full <iframe> tag
  if (str.includes("<iframe")) {
    const match = str.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      str = match[1];
    }
  }

  // 2. Official Google Maps Embed URL
  if (str.includes("google.com/maps/embed")) {
    return str;
  }

  // 3. Google Maps with output=embed or query
  if (str.includes("maps.google.com/maps") || str.includes("google.com/maps?")) {
    if (!str.includes("output=embed")) {
      str += (str.includes("?") ? "&" : "?") + "output=embed";
    }
    return str;
  }

  // 4. Place URL format: google.com/maps/place/NAMA_TEMPAT/...
  if (str.includes("google.com/maps/place/")) {
    const placeMatch = str.match(/maps\/place\/([^/@?]+)/);
    if (placeMatch && placeMatch[1]) {
      const placeName = decodeURIComponent(placeMatch[1].replace(/\+/g, " "));
      return `https://maps.google.com/maps?q=${encodeURIComponent(placeName)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
    }
  }

  // 5. Lat,Lng coordinates in URL: @-6.5177,110.7658
  const coordMatch = str.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordMatch) {
    return `https://maps.google.com/maps?q=${coordMatch[1]},${coordMatch[2]}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  // 6. Shortlink check (maps.app.goo.gl / goo.gl/maps)
  // Google blocks shortlinks inside iframes via X-Frame-Options: SAMEORIGIN.
  // We fall back safely to search query so the frame never breaks.
  if (str.includes("goo.gl") || str.includes("maps.app")) {
    return `https://maps.google.com/maps?q=${encodeURIComponent(defaultQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
  }

  // 7. Generic URL fallback
  if (str.startsWith("http://") || str.startsWith("https://")) {
    return str;
  }

  return `https://maps.google.com/maps?q=${encodeURIComponent(defaultQuery)}&t=&z=16&ie=UTF8&iwloc=&output=embed`;
}

export function getMapsInputStatus(rawInput?: string): MapsStatusInfo {
  if (!rawInput || !rawInput.trim()) {
    return {
      type: "empty",
      isValid: true,
      message: "Peta otomatis aktif berdasarkan nama & alamat pesantren.",
    };
  }

  const str = rawInput.trim();

  if (str.includes("<iframe")) {
    const match = str.match(/src=["']([^"']+)["']/i);
    if (match && match[1]) {
      return {
        type: "iframe",
        isValid: true,
        message: "Kode HTML <iframe> terdeteksi dan valid.",
      };
    }
    return {
      type: "iframe",
      isValid: false,
      message: "Kode <iframe> terdeteksi tetapi atribut src tidak ditemukan.",
    };
  }

  if (str.includes("google.com/maps/embed")) {
    return {
      type: "embed_url",
      isValid: true,
      message: "Link resmi Google Maps Embed valid.",
    };
  }

  if (str.includes("maps.app.goo.gl") || str.includes("goo.gl/maps")) {
    return {
      type: "shortlink",
      isValid: false,
      message:
        "Tautan singkat 'Bagikan Link' terdeteksi. Google Maps memblokir shortlink di dalam website (X-Frame-Options). Silakan salin dari tab 'Sematkan peta' (Embed a map) > 'Salin HTML'.",
    };
  }

  if (str.includes("google.com/maps/place/")) {
    return {
      type: "place_url",
      isValid: true,
      message: "Link lokasi Google Maps terdeteksi dan akan otomatis dikonversi.",
    };
  }

  if (str.startsWith("http://") || str.startsWith("https://")) {
    return {
      type: "custom",
      isValid: true,
      message: "Link peta kustom terdeteksi.",
    };
  }

  return {
    type: "custom",
    isValid: true,
    message: "Teks terdeteksi.",
  };
}
