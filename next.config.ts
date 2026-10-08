import type { NextConfig } from "next";

// Disable SSL certificate verification for local WordPress (e.g. self-signed certs on headless.local)
if (process.env.NODE_ENV !== "production" || (process.env.WP_BACKEND_URL && process.env.WP_BACKEND_URL.includes(".local"))) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const wpUrl = process.env.WP_BACKEND_URL;
let wpHostname = "headless.local";
if (wpUrl) {
  try {
    wpHostname = new URL(wpUrl).hostname;
  } catch {
    // fallback
  }
}

const nextConfig: NextConfig = {
  images: {
    // Required in Next.js 16+ for local dev domains (headless.local, localhost) resolving to private IP 127.0.0.1
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "headless.local",
      },
      {
        protocol: "http",
        hostname: "headless.local",
      },
      {
        protocol: "https",
        hostname: wpHostname,
      },
      {
        protocol: "http",
        hostname: wpHostname,
      },
      {
        protocol: "https",
        hostname: "**.woocommerce.com",
      },
    ],
  },
  // Allow mobile devices on local network to access the dev server
  allowedDevOrigins: ["192.168.68.105"],
};

export default nextConfig;
