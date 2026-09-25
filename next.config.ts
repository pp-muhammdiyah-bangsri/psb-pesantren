import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kompres response otomatis (gzip)
  compress: true,

  // Optimasi domain gambar eksternal
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "img.youtube.com" },
      { protocol: "https", hostname: "i.ytimg.com" },
      { protocol: "https", hostname: "qqqrhipksbxfokqzfysb.supabase.co" },
    ],
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 604800,
  },

  // Header keamanan
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Mencegah MIME sniffing
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Mencegah clickjacking
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Mencegah XSS reflection
          { key: "X-XSS-Protection", value: "1; mode=block" },
          // Memaksa HTTPS
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          // Referrer Policy
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // Content Security Policy (S-1)
          {
            key: "Content-Security-Policy",
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js butuh ini
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://lh3.googleusercontent.com https://*.googleusercontent.com https://img.youtube.com https://i.ytimg.com https://qqqrhipksbxfokqzfysb.supabase.co",
              "media-src 'self' blob:",
              "frame-src https://www.youtube.com https://www.youtube-nocookie.com",
              "connect-src 'self' https://qqqrhipksbxfokqzfysb.supabase.co https://lh3.googleusercontent.com",
            ].join("; "),
          },
          // Preconnect ke CDN utama untuk akselerasi DNS
          {
            key: "Link",
            value: [
              "<https://qqqrhipksbxfokqzfysb.supabase.co>; rel=preconnect",
              "<https://lh3.googleusercontent.com>; rel=preconnect",
              "<https://img.youtube.com>; rel=preconnect",
            ].join(", "),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
