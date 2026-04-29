import threading
import time
import os

import pytest

# Start the Flask app defined in model.app on port 8000 for tests
@pytest.fixture(scope='session', autouse=True)
def start_test_server():
    try:
        from gevent.pywsgi import WSGIServer
    except Exception:
        raise RuntimeError('gevent is required to run the test server fixture')

    # Import the app module
    import model.app as appmod

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
