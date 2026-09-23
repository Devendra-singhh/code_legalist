const CHATBOT_URL = (process.env.CHATBOT_URL || 'http://localhost:3002').replace(/\/$/, '');
const FORUM_URL = (process.env.FORUM_URL || 'http://localhost:5173').replace(/\/$/, '');
const LAWYERS_URL = (process.env.LAWYERS_URL || 'http://localhost:3001').replace(/\/$/, '');

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  async rewrites() {
    return [
      // ── Chatbot Global Proxy ──
      // Mapping /chat to the sub-app's basePath.
      {
        source: '/chat',
        destination: `${CHATBOT_URL}/chat`,
      },
      {
        source: '/chat/:path*',
        destination: `${CHATBOT_URL}/chat/:path*`,
      },
      {
        source: '/api/chat',
        destination: `${CHATBOT_URL}/chat/api/chat`,
      },
      {
        source: '/api/model-preference',
        destination: `${CHATBOT_URL}/chat/api/model-preference`,
      },
      {
        source: '/api/lawyer-chat',
        destination: `${LAWYERS_URL}/lawyers/api/lawyer-chat`,
      },

      // ── Forum Global Proxy ──
      {
        source: '/forum',
        destination: `${FORUM_URL}/forum`,
      },
      {
        source: '/forum/:path*',
        destination: `${FORUM_URL}/forum/:path*`,
      },

      // ── Lawyers Global Proxy ──
      {
        source: '/lawyers',
        destination: `${LAWYERS_URL}/lawyers`,
      },
      {
        source: '/lawyers/:path*',
        destination: `${LAWYERS_URL}/lawyers/:path*`,
      },
    ];
  },
};

export default nextConfig;
