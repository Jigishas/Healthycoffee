import { useState, useEffect } from 'react';

const BACKEND_URL = 'https://healthycoffee.onrender.com';

const useBackendHealth = () => {
  const [status, setStatus] = useState('checking');
  const [isOnline, setIsOnline] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const [lastChecked, setLastChecked] = useState(null);

  const checkHealth = async () => {
    setIsChecking(true);
    try {
      const response = await fetch(`${BACKEND_URL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.ok) {
        setIsOnline(true);
        setIsOffline(false);
        setStatus('online');
      } else {
        setIsOnline(false);
        setIsOffline(true);
        setStatus('offline');
      }
    } catch {
      setIsOnline(false);
      setIsOffline(true);
      setStatus('offline');
    }
    setLastChecked(new Date());
    setIsChecking(false);
  };

  useEffect(() => {
    checkHealth();
    const interval = setInterval(checkHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  return { status, isOnline, isOffline, isChecking, lastChecked };
};

export default useBackendHealth;
