import type { NextConfig } from "next";

// Disable SSL certificate verification for local development WordPress (e.g. self-signed certs)
if (process.env.NODE_ENV !== "production" || (process.env.WP_BACKEND_URL && process.env.WP_BACKEND_URL.includes(".local"))) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
}

const wpUrl = process.env.WP_BACKEND_URL;
let wpHostname = "";
if (wpUrl) {
  try {
    wpHostname = new URL(wpUrl).hostname;
  } catch {
    // ignore invalid URL
  }
}

const nextConfig: NextConfig = {
  images: {
    // Required in Next.js 16+ for local dev domains resolving to private IP 127.0.0.1
    dangerouslyAllowLocalIP: true,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      ...(wpHostname
        ? [
            {
              protocol: "https" as const,
              hostname: wpHostname,
            },
            {
              protocol: "http" as const,
              hostname: wpHostname,
            },
          ]
        : []),
      {
        protocol: "https",
        hostname: "**.woocommerce.com",
      },
      {
        protocol: "https",
        hostname: "secure.gravatar.com",
      },
      {
        protocol: "https",
        hostname: "**.gravatar.com",
      },
      {
        protocol: "https",
        hostname: "**.wordpress.org",
      },
    ],
  },
  // Allow mobile devices on local network to access the dev server
  allowedDevOrigins: ["192.168.68.105"],
};

export default nextConfig;
