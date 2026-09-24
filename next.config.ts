import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Kompres response otomatis (gzip)
  compress: true,

  // Optimasi gambar: izinkan domain Google Drive
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
      { protocol: "https", hostname: "drive.google.com" },
      { protocol: "https", hostname: "qqqrhipksbxfokqzfysb.supabase.co" },
    ],
    // Format modern lebih ringan (WebP/AVIF)
    formats: ["image/avif", "image/webp"],
    // Cache gambar 7 hari
    minimumCacheTTL: 604800,
  },

  // Header keamanan & performa
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Cache halaman statis 1 jam, revalidasi di background
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          // Preconnect ke Supabase & Google agar DNS cepat
          {
            key: "Link",
            value: [
              "<https://qqqrhipksbxfokqzfysb.supabase.co>; rel=preconnect",
              "<https://lh3.googleusercontent.com>; rel=preconnect",
            ].join(", "),
          },
        ],
      },
      {
        // Cache font & assets statis 1 tahun
        source: "/_next/static/(.*)",
        headers: [
          { key: "Cache-Control", value: "public, max-age=31536000, immutable" },
        ],
      },
    ];
  },
};

export default nextConfig;