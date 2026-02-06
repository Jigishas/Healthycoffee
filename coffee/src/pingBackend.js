// Ping backend service to keep Render free tier awake and responsive
const BACKEND_URL = 'https://healthycoffee.onrender.com/health';
const PING_INTERVAL = 10 * 60 * 1000; // 10 minutes - keep connection alive
const RETRY_ATTEMPTS = 3;
const RETRY_DELAY = 5000; // 5 seconds

function pingBackend(retryCount = 0) {
  fetch(BACKEND_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    },
    mode: 'cors'
  })
  .then(response => {
    if (response.ok) {
      console.log(`[${new Date().toLocaleTimeString()}] ✅ Backend online & responsive`);
      // Dispatch custom event for other components to listen
      window.dispatchEvent(new CustomEvent('backend-health', { detail: { status: 'healthy' } }));
    } else {
      console.log(`[${new Date().toLocaleTimeString()}] ⚠️ Backend responded with status: ${response.status}`);
      window.dispatchEvent(new CustomEvent('backend-health', { detail: { status: 'degraded', code: response.status } }));
    }
  })
  .catch(error => {
    console.log(`[${new Date().toLocaleTimeString()}] ❌ Ping error: ${error.message}`);
    window.dispatchEvent(new CustomEvent('backend-health', { detail: { status: 'offline', error: error.message } }));

    // Retry logic
    if (retryCount < RETRY_ATTEMPTS) {
      console.log(`[${new Date().toLocaleTimeString()}] 🔄 Retrying ping in ${RETRY_DELAY / 1000} seconds...`);
      setTimeout(() => pingBackend(retryCount + 1), RETRY_DELAY);
    }
  });
}

// Check backend health on demand
function checkBackendHealth() {
  return new Promise((resolve) => {
    fetch(BACKEND_URL, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache'
      },
      mode: 'cors'
    })
    .then(response => {
      resolve(response.ok);
    })
    .catch(() => {
      resolve(false);
    });
  });
}

// Start pinging when the page loads
function startPinging() {
  console.log('🚀 Backend health monitor started');
  pingBackend(); // Ping immediately on app load
  setInterval(pingBackend, PING_INTERVAL); // Then ping every 10 minutes
}

export { pingBackend, startPinging, checkBackendHealth };
