import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for Capacitor Android WebView.
  // Generates out/ directory with index.html + static assets.
  output: "export",

  // Disable strict mode to avoid double-render side effects in the WebView.
  reactStrictMode: false,

  typescript: {
    ignoreBuildErrors: true,
  },

  // Images must be unoptimized for static export (no server-side optimization).
  images: {
    unoptimized: true,
  },

  // Trailing slash for consistent routing in WebView.
  trailingSlash: true,
};

export default nextConfig;
