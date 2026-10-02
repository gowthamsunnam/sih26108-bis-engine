// frontend/src/apiConfig.js
let rawUrl = import.meta.env.VITE_API_BASE_URL || "https://sih26108-bis-engine.onrender.com";

// If markdown link format like [text](https://...), extract URL
const mdMatch = String(rawUrl).match(/\((https?:\/\/[^\s\)]+)\)/);
if (mdMatch) {
  rawUrl = mdMatch[1];
}

// Strip any accidental brackets, parentheses, quotes, spaces, or trailing slashes
export const API_BASE = String(rawUrl)
  .replace(/[\[\]\(\)"']/g, '')
  .trim()
  .replace(/\/+$/, '');