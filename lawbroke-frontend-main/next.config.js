// @ts-check

const withMDX = require('@next/mdx')({
  extension: /\.mdx?$/
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Keep any existing options here
  reactStrictMode: true,
  swcMinify: true
};

// Export MDX-enabled config
module.exports = withMDX(nextConfig);
