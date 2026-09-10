import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  async redirects() {
    return [
      { source: '/home', destination: '/', permanent: false },
      { source: '/overview', destination: '/', permanent: false },
      { source: '/dashboard', destination: '/', permanent: false },
      { source: '/data', destination: '/analytics', permanent: false },
      { source: '/docs', destination: '/about', permanent: false },
      { source: '/about-us', destination: '/about', permanent: false },
    ];
  },
};

export default nextConfig;
