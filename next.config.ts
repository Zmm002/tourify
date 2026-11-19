import type { NextConfig } from "next";

// Pengaturan Next.js dan header dasar untuk melindungi halaman web.
const nextConfig: NextConfig = {
  poweredByHeader: false,
  devIndicators: false,
  // Header ini berlaku untuk seluruh halaman dan route aplikasi.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
