// Custom Service Worker registration for Healthy Coffee PWA
// This handles image caching and offline functionality with improved update handling

let updatePromptShown = false;

const registerServiceWorker = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', registration);

      // Handle updates with improved UX
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, show update prompt
              showUpdatePrompt(newWorker);
            }
          });
        }
      });

      // Listen for messages from service worker
      navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'CACHE_COMPLETE') {
          console.log('Image caching completed during PWA installation');
        }
        if (event.data && event.data.type === 'UPDATE_AVAILABLE') {
          showUpdatePrompt();
        }
      });

      // Periodic update check every 60 minutes
      setInterval(() => {
        checkForUpdates(registration);
      }, 60 * 60 * 1000); // 60 minutes

      // Also check on page visibility change (when user returns to app)
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          checkForUpdates(registration);
        }
      });

      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }
};

// Check for service worker updates
const checkForUpdates = async (registration) => {
  try {
    await registration.update();
    console.log('Checked for service worker updates');
  } catch (error) {
    console.error('Error checking for updates:', error);
  }
};

// Show update prompt with better UX
const showUpdatePrompt = (worker) => {
  if (updatePromptShown) return; // Prevent multiple prompts
  
  // Create custom update notification instead of confirm dialog
  const updateDiv = document.createElement('div');
  updateDiv.id = 'pwa-update-prompt';
  updateDiv.innerHTML = `
    <div style="
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white;
      padding: 16px 20px;
      border-radius: 12px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      z-index: 10000;
      max-width: 320px;
      font-family: system-ui, -apple-system, sans-serif;
      animation: slideIn 0.3s ease-out;
    ">
      <div style="font-weight: 600; margin-bottom: 8px; font-size: 16px;">
        🚀 Update Available
      </div>
      <div style="font-size: 14px; margin-bottom: 12px; opacity: 0.95;">
        A new version of Healthy Coffee is ready with improvements and bug fixes.
      </div>
      <div style="display: flex; gap: 8px;">
        <button id="update-now" style="
          background: white;
          color: #059669;
          border: none;
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          cursor: pointer;
          font-size: 13px;
          flex: 1;
        ">Update Now</button>
        <button id="update-later" style="
          background: rgba(255,255,255,0.2);
          color: white;
          border: 1px solid rgba(255,255,255,0.3);
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 500;
          cursor: pointer;
          font-size: 13px;
        ">Later</button>
      </div>
    </div>
    <style>
      @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
    </style>
  `;
  
  document.body.appendChild(updateDiv);
  updatePromptShown = true;
  
  // Handle update now
  document.getElementById('update-now').addEventListener('click', () => {
    if (worker) {
      // Tell service worker to skip waiting
      worker.postMessage({ type: 'SKIP_WAITING' });
    }
    // Reload after a short delay to allow service worker to activate
    setTimeout(() => {
      window.location.reload();
    }, 500);
    removeUpdatePrompt();
  });
  
  // Handle update later
  document.getElementById('update-later').addEventListener('click', () => {
    removeUpdatePrompt();
    // Reset flag after 5 minutes to allow showing again
    setTimeout(() => {
      updatePromptShown = false;
    }, 5 * 60 * 1000);
  });
};

// Remove update prompt
const removeUpdatePrompt = () => {
  const prompt = document.getElementById('pwa-update-prompt');
  if (prompt) {
    prompt.style.animation = 'slideIn 0.3s ease-out reverse';
    setTimeout(() => prompt.remove(), 300);
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
