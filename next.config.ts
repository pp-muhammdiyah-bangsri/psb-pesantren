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

  // Header performa & keamanan
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
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
