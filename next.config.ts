import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Standalone output is required for the Capacitor Android wrapper
  // (bundles all server assets into a self-contained .next/standalone folder).
  output: "standalone",
  // Disable strict mode to avoid double-render side effects in the WebView.
  reactStrictMode: false,
  typescript: {
    ignoreBuildErrors: true,
  },
  // Configure image domains (not strictly needed for the WebView build,
  // but useful if the app loads remote images).
  images: {
    unoptimized: true,
  },
  // Add headers for the Firebase Messaging service worker.
  async headers() {
    return [
      {
        source: "/firebase-messaging-sw.js",
        headers: [
          { key: "Service-Worker-Allowed", value: "/" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
        ],
      },
    ];
  },
};

export default nextConfig;
