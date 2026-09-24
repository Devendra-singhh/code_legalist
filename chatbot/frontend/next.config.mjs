/** @type {import('next').NextConfig} */
const nextConfig = {
  // basePath: '/chat' is intentionally removed for standalone deployment on Vercel.
  // If deploying as a sub-path, re-enable it.
  trailingSlash: false,
};

export default nextConfig;

