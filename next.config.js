/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  assetPrefix: '/stockfinder/',
  basePath: '/stockfinder',
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig