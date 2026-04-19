/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      {
        source: '/chat',
        destination: `${process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:3004'}/`,
      },
      {
        source: '/chat/:path*',
        destination: `${process.env.NEXT_PUBLIC_CHATBOT_URL || 'http://localhost:3004'}/:path*`,
      },
      {
        source: '/forum',
        destination: `${process.env.NEXT_PUBLIC_FORUM_URL || 'http://localhost:5173'}/`,
      },
      {
        source: '/forum/:path*',
        destination: `${process.env.NEXT_PUBLIC_FORUM_URL || 'http://localhost:5173'}/:path*`,
      },
      {
        source: '/lawyers',
        destination: `${process.env.NEXT_PUBLIC_LAWYER_URL || 'http://localhost:3001'}/`,
      },
      {
        source: '/lawyers/:path*',
        destination: `${process.env.NEXT_PUBLIC_LAWYER_URL || 'http://localhost:3001'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
