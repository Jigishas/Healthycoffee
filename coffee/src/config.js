// Backend Configuration
export const BACKEND_CONFIG = {
  PRODUCTION_URL: 'https://healthycoffee.onrender.com',
  LOCAL_FALLBACK: 'http://localhost:8000',  // Backend dev server (model/app.py)
};

// Determine backend URL based on environment
export const getBackendUrl = () => {
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return BACKEND_CONFIG.LOCAL_FALLBACK;
    }
    return BACKEND_CONFIG.PRODUCTION_URL;
  }
  return BACKEND_CONFIG.PRODUCTION_URL;
};

export const BACKEND_URL = getBackendUrl();

export default BACKEND_CONFIG;

