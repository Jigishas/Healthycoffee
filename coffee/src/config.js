// Centralized configuration for backend URLs
export const BACKEND_CONFIG = {
  PRODUCTION_URL: 'https://healthycoffee.onrender.com:8000',
  LOCAL_FALLBACK: 'http://localhost:8000'
};

// Determine which backend URL to use based on environment
export const getBackendUrl = () => {
  // In production (when deployed), use production URL
  // In development (localhost), use localhost for faster development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return BACKEND_CONFIG.LOCAL_FALLBACK;
  }
  return BACKEND_CONFIG.PRODUCTION_URL;
};

// Legacy export for backward compatibility
export const BACKEND_URL = getBackendUrl();
