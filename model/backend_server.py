"""Run the main backend app implemented in :mod:`app.py`.

This module is a thin runner that imports the Flask `app` from
``model/app.py`` and runs it. All HTTP routes and model logic are
implemented in `model/app.py` (the production-ready application).

Usage:
  python model/backend_server.py

For production, prefer running the app via a WSGI server that imports
``model.app:app`` (for example, ``gunicorn -w 4 -k gthread model.app:app``).
"""

import os

# Import the Flask app defined in model/app.py
try:
    from app import app  # when running inside the model/ directory
except Exception:
    # Fall back to package-style import when available
    from model.app import app


if __name__ == '__main__':
    port = int(os.environ.get('PORT', '5000'))
    try:
        # Prefer gevent WSGI server if available
        from gevent.pywsgi import WSGIServer
        print(f"Starting WSGI server on port {port}")
        http_server = WSGIServer(('0.0.0.0', port), app)
        http_server.serve_forever()
    except Exception:
        app.run(host='0.0.0.0', port=port, threaded=True)
