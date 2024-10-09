/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      'images.unsplash.com',
      'via.placeholder.com',
      'd3m7r2hywaso4h.cloudfront.net',
      'sketch-design.ma',
      'i.imgur.com'
    ],
  },
}

module.exports = nextConfig