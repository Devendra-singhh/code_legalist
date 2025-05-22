// Production URLs
export const PRODUCTION_URLS = {
  HOMEPAGE: 'https://sloq.me',
  FORUM_FRONTEND: 'https://forum.sloq.me',
  BACKEND_API: 'https://forumbackend-owmc0drww-rxhulshxrmxs-projects.vercel.app'
};

// Development URLs
export const DEVELOPMENT_URLS = {
  HOMEPAGE: 'http://localhost:3000',
  FORUM_FRONTEND: 'http://localhost:5173',
  BACKEND_API: 'http://localhost:5000'
};

// Use production URLs by default, or development if in development mode
const isDevelopment = import.meta.env.DEV;

export const URLS = isDevelopment ? DEVELOPMENT_URLS : PRODUCTION_URLS;

// Export individual URLs for convenience
export const API_BASE_URL = URLS.BACKEND_API;
export const HOMEPAGE_URL = URLS.HOMEPAGE;
export const FORUM_URL = URLS.FORUM_FRONTEND;
