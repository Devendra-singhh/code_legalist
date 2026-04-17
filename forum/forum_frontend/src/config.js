// Production URLs
export const PRODUCTION_URLS = {
  HOMEPAGE: 'https://sloq.me',
  FORUM_FRONTEND: 'https://forum.sloq.me',
  BACKEND_API: 'https://backend.sloq.me'
};

// Development URLs
export const DEVELOPMENT_URLS = {
  HOMEPAGE: 'http://localhost:3001',
  FORUM_FRONTEND: 'http://localhost:3002',
  BACKEND_API: 'http://localhost:3003'
};

// Use production URLs by default, or development if in development mode
const isDevelopment = import.meta.env.DEV;

export const URLS = isDevelopment ? DEVELOPMENT_URLS : PRODUCTION_URLS;

// Export individual URLs for convenience
// Allow override via VITE_API_URL set in the environment (e.g., Vercel UI)
export const API_BASE_URL = import.meta.env.VITE_API_URL || URLS.BACKEND_API;
export const HOMEPAGE_URL = URLS.HOMEPAGE;
export const FORUM_URL = URLS.FORUM_FRONTEND;
