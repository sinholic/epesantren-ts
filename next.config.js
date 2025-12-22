/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Ignore PHP files during build
  pageExtensions: ['ts', 'tsx', 'js', 'jsx'],
  // Output configuration for Vercel
  output: 'standalone',
  // Environment variables
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },
}

module.exports = nextConfig
