/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    cpus: 2,
    webpackMemoryOptimizations: true,
  },
};

export default nextConfig;
