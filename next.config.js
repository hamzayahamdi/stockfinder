/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  assetPrefix: '.',
  basePath: '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig
