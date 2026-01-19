// Centralized configuration for backend URLs
export const BACKEND_CONFIG = {
  PRODUCTION_URL: 'https://healthycoffee.onrender.com',
  LOCAL_FALLBACK: 'http://localhost:8000'
};

// Determine which backend URL to use based on environment
export const getBackendUrl = () => {
  // In production (when deployed), use production URL
  // In development (localhost), try production first, fallback to localhost
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    return BACKEND_CONFIG.PRODUCTION_URL;
  }
  return BACKEND_CONFIG.PRODUCTION_URL; // Always try production first
};

// Legacy export for backward compatibility
export const BACKEND_URL = getBackendUrl();
