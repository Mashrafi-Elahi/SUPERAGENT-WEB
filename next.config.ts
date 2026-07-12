import type { NextConfig } from "next";

const backendUrl = (
  process.env.BACKEND_URL ?? "https://super-agent-backend-u4mp.onrender.com"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  turbopack: {
    root: process.cwd(),
  },
  async rewrites() {
    return [
      {
        source: "/backend/:path*",
        destination: `${backendUrl}/:path*`,
      },
    ];
  },
};

export default nextConfig;
