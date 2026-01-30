// Centralized configuration for backend URLs
export const BACKEND_CONFIG = {
  PRODUCTION_URL: 'https://healthycoffee.onrender.com',
  LOCAL_FALLBACK: 'http://localhost:8000'
};

// Determine which backend URL to use based on environment
export const getBackendUrl = () => {
  // TESTING: Force localhost to test with local backend
  // Uncomment the line below to use Render production backend
  return BACKEND_CONFIG.LOCAL_FALLBACK;
  
  // Production logic (use when local testing is complete):
  // if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  //   return BACKEND_CONFIG.LOCAL_FALLBACK;
  // }
  // return BACKEND_CONFIG.PRODUCTION_URL;
};

// Dynamic backend URL that updates if environment changes
export const BACKEND_URL = getBackendUrl();

// Export config for easy access
export default BACKEND_CONFIG;
