/** @type {import('next').NextConfig} */
const nextConfig = {
  basePath: '/chat',
  // Disabling trailing slash to avoid the redirect loop seen earlier
  trailingSlash: false,
};

export default nextConfig;
