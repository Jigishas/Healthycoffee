// Ping backend service to keep Render free tier awake
const BACKEND_URL = 'https://healthycoffee.onrender.com/health';
const PING_INTERVAL = 12 * 60 * 1000; // 12 minutes in milliseconds

// Dummy data to send with ping
const dummyData = {
  ping_type: 'keep_alive',
  timestamp: new Date().toISOString(),
  source: 'frontend_pinger',
  version: '1.0.0'
};

function pingBackend() {
  fetch(BACKEND_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(dummyData)
  })
  .then(response => {
    if (response.ok) {
      console.log(`[${new Date().toISOString()}] Backend ping successful`);
    } else {
      console.log(`[${new Date().toISOString()}] Backend ping failed with status: ${response.status}`);
    }
  })
  .catch(error => {
    console.log(`[${new Date().toISOString()}] Backend ping failed with error: ${error.message}`);
  });
}

// Start pinging when the page loads
function startPinging() {
  console.log('Starting backend pinger...');
  pingBackend(); // Ping immediately
  setInterval(pingBackend, PING_INTERVAL); // Then ping every 12 minutes
}

// Only start pinging if this is the main page (not in development mode)
if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
  startPinging();
}

export { pingBackend, startPinging };
