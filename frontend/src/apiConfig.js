// frontend/src/apiConfig.js
const envUrl = import.meta.env.VITE_API_BASE_URL || 'https://sih26108-bis-engine.onrender.com';

// Strip any accidental brackets, quotes, spaces, or trailing slashes
export const API_BASE = String(envUrl)
  .replace(/[\[\]"']/g, '')
  .trim()
  .replace(/\/+$/, '');