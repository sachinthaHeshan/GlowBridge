import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api_g/:path*",
        destination: `${
          process.env.BACKEND_URL || "http://localhost:3005"
        }/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
