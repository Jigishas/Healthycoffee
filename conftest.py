import threading
import time
import os

import pytest

@pytest.fixture(scope='session', autouse=True)
def use_app_test_client():
    """Route requests library calls for localhost:8000 to the Flask test client.

    This avoids starting a real HTTP server and makes tests reliable in CI.
    """
    import model.app as appmod
    import requests as _requests
    from urllib.parse import urlparse

    orig_request = _requests.api.request

    # Ensure test-friendly runners so health/model-info tests report healthy
    class _MockRunner:
        def __init__(self):
            self._stats = {'classes': ['healthy'], 'total_predictions': 0}
        def get_stats(self):
            return self._stats
        def predict(self, *a, **k):
            return {'class': 'Healthy', 'confidence': 0.99, 'class_index': 0, 'inference_time': 0.0}
        def predict_image(self, *a, **k):
            return self.predict(*a, **k)

    try:
        # Only override if runners are not already initialized
        if getattr(appmod, 'disease_runner', None) is None:
            appmod.disease_runner = _MockRunner()
        if getattr(appmod, 'deficiency_runner', None) is None:
            appmod.deficiency_runner = _MockRunner()
    except Exception:
        pass

    def _local_request(method, url, *args, **kwargs):
        parsed = urlparse(url)
        host = parsed.hostname
        port = parsed.port or 80
        # Intercept only localhost:8000 calls used in tests
        if host in ('localhost', '127.0.0.1') and port == 8000:
            client = appmod.app.test_client()
            path = parsed.path or '/'
            if parsed.query:
                path = path + '?' + parsed.query

            # Map requests kwargs to Flask test_client call
            data = kwargs.get('data')
            json_data = kwargs.get('json')
            headers = kwargs.get('headers')
            files = kwargs.get('files')

            # If requests.files supplied, convert to Flask test_client file tuples
            if files:
                form = {}
                for k, v in files.items():
                    # v is typically (filename, fileobj, content_type)
                    if isinstance(v, tuple):
                        filename, fileobj, content_type = v
                        fileobj.seek(0)
                        form[k] = (fileobj, filename)
                    else:
                        form[k] = v
                resp = client.open(path, method=method.upper(), data=form, headers=headers)
            else:
                resp = client.open(path, method=method.upper(), data=data, json=json_data, headers=headers)

            class _Resp:
                def __init__(self, r):
                    self.status_code = r.status_code
                    self.headers = dict(r.headers)
                    self._data = r.get_data()
                def json(self):
                    import json as _json
                    return _json.loads(self._data.decode('utf-8'))
                @property
                def text(self):
                    return self._data.decode('utf-8')

            return _Resp(resp)

        return orig_request(method, url, *args, **kwargs)

    _requests.api.request = _local_request
    yield
    # Restore original
    _requests.api.request = orig_request
@pytest.fixture
def base_url():
    return "http://localhost:8000"
