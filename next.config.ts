import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
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
