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
