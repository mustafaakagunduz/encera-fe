import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'encera.com.tr',
      },
      // API resimler için
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '8080',
      },
      {
        protocol: 'https',
        hostname: '*.elasticbeanstalk.com',
      }
    ],
  },
  experimental: {
    optimizeCss: true,
  },
};

export default nextConfig;
