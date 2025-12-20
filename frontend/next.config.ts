import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      // Proxy all /api/* requests to backend
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*', // Remove /api prefix when forwarding
      },
    ];
  },
  
  // // Optional: For production
  // env: {
  //   NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000',
  // },
};

export default nextConfig;