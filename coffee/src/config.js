// Centralized configuration for backend URLs
export const BACKEND_CONFIG = {
  PRODUCTION_URL: 'https://healthycoffee.onrender.com',
  LOCAL_FALLBACK: 'http://localhost:8000'
};

// Determine which backend URL to use based on environment
export const getBackendUrl = () => {
  // In development (localhost), use localhost for faster development
  if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
    return BACKEND_CONFIG.LOCAL_FALLBACK;
  }
  // Always use production URL for deployed frontend
  return BACKEND_CONFIG.PRODUCTION_URL;
};

// Dynamic backend URL that updates if environment changes
export const BACKEND_URL = getBackendUrl();

// Export config for easy access
export default BACKEND_CONFIG;
