/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['lh3.googleusercontent.com', 'avatars.githubusercontent.com'],
  },
  env: {
    NEXT_PUBLIC_FORUM_URL: process.env.NEXT_PUBLIC_FORUM_URL || 'https://forumfrontend-kzyqs2twi-rxhulshxrmxs-projects.vercel.app',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://forumbackend-e759zx3lh-rxhulshxrmxs-projects.vercel.app',
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

module.exports = nextConfig;
