// Ping backend service to keep Render free tier awake
const BACKEND_URL = 'https://healthycoffee.onrender.com/health';
const PING_INTERVAL = 8 * 60 * 1000; // 8 minutes in milliseconds

// Dummy data to send with ping
const dummyData = {
  ping_type: 'keep_alive',
  timestamp: new Date().toISOString(),
  source: 'frontend_pinger',
  version: '1.0.0'
};

function pingBackend() {
  fetch(BACKEND_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(response => {
    if (response.ok) {
      console.log(`[${new Date().toISOString()}] ✅ Backend ping successful`);
    } else {
      console.log(`[${new Date().toISOString()}] ⚠️ Backend ping failed with status: ${response.status}`);
    }
  })
  .catch(error => {
    console.log(`[${new Date().toISOString()}] ❌ Backend ping failed with error: ${error.message}`);
  });
}

// Start pinging when the page loads
function startPinging() {
  console.log('🚀 Starting backend pinger for healthycoffee.onrender.com...');
  pingBackend(); // Ping immediately on app load
  setInterval(pingBackend, PING_INTERVAL); // Then ping every 8 minutes
}

// Start pinging regardless of environment - in production it keeps backend alive
// In development it tests connectivity
if (typeof window !== 'undefined') {
  // Uncomment for debugging: log when pinging starts
  // console.log('Environment:', window.location.hostname);
}

export { pingBackend, startPinging };
