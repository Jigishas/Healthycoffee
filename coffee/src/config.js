// Backend Configuration
export const BACKEND_CONFIG = {
  PRODUCTION_URL: 'https://healthycoffee.onrender.com',
  // Match the simple Flask dev server default port (backend_server.py runs on 5000)

};

// Determine which backend URL to use based on environment
export const getBackendUrl = () => {
  // Use production backend by default. If running the frontend on localhost
  // (developer testing), fall back to the local backend at port 8000.
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (host === 'localhost' || host === '127.0.0.1') {
      return BACKEND_CONFIG.LOCAL_FALLBACK;
    }
    return BACKEND_CONFIG.PRODUCTION_URL;
  }
  // When running in non-browser environments, prefer production URL
  return BACKEND_CONFIG.PRODUCTION_URL;
};

// Dynamic backend URL that updates if environment changes
export const BACKEND_URL = getBackendUrl();

// Export config for easy access
export default BACKEND_CONFIG;
