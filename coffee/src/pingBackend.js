// Ping backend service to keep Render free tier awake and responsive
const BACKEND_URL = 'https://healthycoffee.onrender.com/health';
const PING_INTERVAL = 5 * 60 * 1000; // 5 minutes - more aggressive pinging

function pingBackend() {
  fetch(BACKEND_URL, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
    }
  })
  .then(response => {
    if (response.ok) {
      console.log(`[${new Date().toLocaleTimeString()}] ✅ Backend online & responsive`);
    } else {
      console.log(`[${new Date().toLocaleTimeString()}] ⚠️ Backend responded with status: ${response.status}`);
    }
  })
  .catch(error => {
    console.log(`[${new Date().toLocaleTimeString()}] ❌ Ping error: ${error.message}`);
  });
}

// Start pinging when the page loads
function startPinging() {
  console.log('🚀 Backend health monitor started');
  pingBackend(); // Ping immediately on app load
  setInterval(pingBackend, PING_INTERVAL); // Then ping every 5 minutes
}

export { pingBackend, startPinging };
