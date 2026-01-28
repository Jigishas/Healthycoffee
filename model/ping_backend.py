import requests
import time

# URL to ping
URL = "https://healthycoffee.onrender.com/health"

# Interval in seconds (12 minutes = 720 seconds, set to 5 for testing)
PING_INTERVAL = 720

def ping_backend():
    while True:
        try:
            response = requests.get(URL, timeout=10)
            if response.status_code == 200:
                print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Ping successful: {URL}")
            else:
                print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Ping failed with status code: {response.status_code}")
        except requests.exceptions.RequestException as e:
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Ping failed due to network error: {e}")
        except Exception as e:
            print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}] Unexpected error: {e}")

        # Wait for the next ping
        time.sleep(PING_INTERVAL)

if __name__ == "__main__":
    print("Starting backend pinger...")
    ping_backend()
