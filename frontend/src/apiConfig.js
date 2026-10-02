const rawUrl = import.meta.env.VITE_API_BASE_URL || 'https://sih26108-bis-engine.onrender.com';

// Strip brackets, quotes, spaces, and trailing slashes
export const API_BASE = rawUrl
  .replace(/[\[\]"']/g, '')
  .trim()
  .replace(/\/+$/, '');