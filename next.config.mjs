/** @type {import('next').NextConfig} */

// When building for GitHub Pages the site lives under
// https://<user>.github.io/<repo>/  so we need a basePath. The deploy workflow
// sets NEXT_PUBLIC_BASE_PATH to "/<repo>". Local builds leave it empty.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

const nextConfig = {
  reactStrictMode: true,
  // Static HTML export — required for GitHub Pages (no Node runtime there).
  output: 'export',
  // App-router / next/image needs the default loader disabled for static export.
  images: { unoptimized: true },
  // GitHub Pages serves /Treepoint/<route>/index.html cleanly with a trailing slash.
  trailingSlash: true,
  basePath,
  assetPrefix: basePath ? `${basePath}/` : '',
  experimental: {
    optimizePackageImports: ['three', '@react-three/drei', '@react-three/fiber'],
  },
  webpack: (config) => {
    config.module.rules.push({
      test: /\.(glsl|vs|fs|vert|frag)$/,
      type: 'asset/source',
    });
    return config;
  },
};

export default nextConfig;
