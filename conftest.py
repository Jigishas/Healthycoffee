import threading
import time
import os

import pytest

# Start the Flask app defined in model.app on port 8000 for tests
@pytest.fixture(scope='session', autouse=True)
def start_test_server():
    # Import the app module
    import model.app as appmod

    # Prefer gevent WSGI server if available for stability, otherwise
    # fall back to Flask's built-in server in a background thread.
    try:
        from gevent.pywsgi import WSGIServer
        server = WSGIServer(('0.0.0.0', 8000), appmod.app)
        thread = threading.Thread(target=server.serve_forever, daemon=True)
        thread.start()
        # Give server a moment to start
        time.sleep(1)

        yield

        try:
            server.stop()
        except Exception:
            pass
    except Exception:
        # Fallback to Flask dev server in a thread
        thread = threading.Thread(target=lambda: appmod.app.run(host='0.0.0.0', port=8000, debug=False, use_reloader=False), daemon=True)
        thread.start()
        time.sleep(1)
        yield
