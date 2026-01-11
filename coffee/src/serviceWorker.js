// Custom Service Worker registration for Healthy Coffee PWA
// This handles image caching and offline functionality

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', registration);

      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update prompt
              if (confirm('New content is available. Reload to get the latest version?')) {
                window.location.reload();
              }
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_COMPLETE') {
          console.log('Image caching completed during PWA installation');
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Register the service worker
const swRegistration = registerServiceWorker();

// Function to manually cache an image
export const cacheImage = async (imageUrl) => {
  if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({
      type: 'CACHE_IMAGE',
      url: imageUrl
    });
  }
};

// Function to check if app is installed
export const isPWAInstalled = () => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         window.navigator.standalone === true;
};

// Export the registration promise
export default swRegistration;
