// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // Remove output: 'export' to allow middleware usage
  output: 'export', // 👈 this replaces `next export`
  images: {
    unoptimized: true, // 👈 required if using next/image with static export
  },
};

export default nextConfig;