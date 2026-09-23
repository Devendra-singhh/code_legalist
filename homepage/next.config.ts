/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      // ── Chatbot Global Proxy ──
      // Mapping /chat to the sub-app's basePath. 
      // We use the same path on both ends to avoid stripping mismatch.
      {
        source: '/chat',
        destination: 'http://localhost:3002/chat',
      },
      {
        source: '/chat/:path*',
        destination: 'http://localhost:3002/chat/:path*',
      },
      {
        source: '/api/chat',
        destination: 'http://localhost:3002/chat/api/chat',
      },
      {
        source: '/api/model-preference',
        destination: 'http://localhost:3002/chat/api/model-preference',
      },
      {
        source: '/api/lawyer-chat',
        destination: 'http://localhost:3001/lawyers/api/lawyer-chat',
      },



      // ── Forum Global Proxy ──
      {
        source: '/forum',
        destination: 'http://localhost:5173/forum',
      },
      {
        source: '/forum/:path*',
        destination: 'http://localhost:5173/forum/:path*',
      },

      // ── Lawyers Global Proxy ──
      {
        source: '/lawyers',
        destination: 'http://localhost:3001/lawyers',
      },
      {
        source: '/lawyers/:path*',
        destination: 'http://localhost:3001/lawyers/:path*',
      },

    ];
  },
};

export default nextConfig;
