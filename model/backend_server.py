"""Minimal Flask server exposing /predict with batching and threaded workers.

Usage (dev):
  pip install flask gunicorn
  python backend_server.py

Production (example):
  gunicorn -w 4 -k gthread -b 0.0.0.0:5000 backend_server:app
"""
from flask import Flask, request, jsonify
try:
    # Prefer flask_cors when available for robust CORS handling
    from flask_cors import CORS
except Exception:
    CORS = None
from pathlib import Path
import tempfile
import os
from serving_utils import ModelRunner
import threading
import time
import uuid
import concurrent.futures

app = Flask(__name__)

# Enable permissive CORS for local development when flask_cors is available.
# In production, tighten `origins` to trusted domains.
if CORS is not None:
    CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


@app.after_request
def _apply_cors_headers(response):
    origin = request.headers.get('Origin')
    if origin:
        response.headers.setdefault('Access-Control-Allow-Origin', '*')
        response.headers.setdefault('Access-Control-Allow-Methods', 'GET,POST,OPTIONS,PUT,DELETE')
        response.headers.setdefault('Access-Control-Allow-Headers', 'Content-Type,Authorization,Cache-Control,X-Requested-With,Accept')
        response.headers.setdefault('Access-Control-Allow-Credentials', 'true')
        response.headers.setdefault('Vary', 'Origin')
    return response

# Configure model paths (change if necessary)
ROOT = Path(__file__).resolve().parent
SCRIPTED = ROOT / 'models' / 'leaf_diseases' / 'efficientnet_disease_balanced_scripted.pt'
QUANT = ROOT / 'models' / 'leaf_diseases' / 'efficientnet_disease_balanced_quantized.pt'

# Initialize runner (CPU)
runner = ModelRunner(str(SCRIPTED), str(QUANT), device='cpu', max_workers=4)


class Batcher:
    """In-memory batcher: collects requests and runs them in batches.

    - Collects incoming image-path lists as requests.
    - Aggregates up to `max_batch_size` or `max_latency` seconds (50ms) before dispatch.
    - Returns a Future with the per-request results.
    """

    def __init__(self, runner, max_batch_size=8, max_latency=0.05):
        self.runner = runner
        self.max_batch_size = max_batch_size
        self.max_latency = max_latency
        self.lock = threading.Condition()
        self.queue = []  # list of (req_id, paths, future)
        self._thread = threading.Thread(target=self._worker, daemon=True)
        self._thread.start()

    def collect(self, paths):
        fut = concurrent.futures.Future()
        req_id = str(uuid.uuid4())
        with self.lock:
            self.queue.append((req_id, list(paths), fut))
            # notify worker
            self.lock.notify()
        return fut

    def _worker(self):
        while True:
            with self.lock:
                if not self.queue:
                    self.lock.wait()
                # wait up to max_latency for more requests
                start = time.time()
                self.lock.wait(timeout=self.max_latency)
                # build batch
                batch = []
                batch_items = []
                while self.queue and len(batch) < self.max_batch_size:
                    req_id, paths, fut = self.queue.pop(0)
                    batch_items.append((req_id, paths, fut))
                    batch.extend(paths)

            if not batch_items:
                continue

            # run model on flattened batch
            try:
                preds = self.runner.predict_batch(batch)
            except Exception as e:
                # set exception on all futures
                for _req_id, _paths, fut in batch_items:
                    fut.set_exception(e)
                continue

            # split predictions back to each request
            idx = 0
            for _req_id, paths, fut in batch_items:
                n = len(paths)
                part = preds[idx: idx + n]
                idx += n
                fut.set_result(part)


# global batcher instance
batcher = Batcher(runner, max_batch_size=16, max_latency=0.05)


@app.route('/predict', methods=['POST'])
def predict():
    # Accept multipart/form-data files under key 'images'
    files = request.files.getlist('images')
    if not files:
        return jsonify({'error': 'No files received (field name "images" expected)'}), 400

    tmpdir = tempfile.mkdtemp()
    paths = []
    try:
        for f in files:
            # use a safe filename
            dest = os.path.join(tmpdir, f.filename)
            f.save(dest)
            paths.append(dest)

        # send to batcher and wait for result
        fut = batcher.collect(paths)
        try:
            results = fut.result(timeout=15.0)
        except concurrent.futures.TimeoutError:
            return jsonify({'error': 'Prediction timed out'}), 504

        return jsonify({'results': results})
    finally:
        # cleanup files
        for p in paths:
            try:
                os.remove(p)
            except Exception:
                pass
        try:
            os.rmdir(tmpdir)
        except Exception:
            pass



    @app.route('/api/v1/upload-image', methods=['POST', 'OPTIONS'])
    def upload_image_api():
        # Simple compatibility wrapper so the frontend can POST 'image' (single file)
        if request.method == 'OPTIONS':
            response = app.make_response('')
            origin = request.headers.get('Origin') or '*'
            response.headers['Access-Control-Allow-Origin'] = origin
            response.headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS'
            response.headers['Access-Control-Allow-Headers'] = 'Content-Type,Authorization,Cache-Control'
            response.headers['Access-Control-Allow-Credentials'] = 'true'
            return response, 204

        # Accept single file under key 'image' for compatibility with frontend
        file = request.files.get('image')
        if not file:
            return jsonify({'error': 'No image file provided (field name "image" expected)'}), 400

        tmpdir = tempfile.mkdtemp()
        try:
            dest = os.path.join(tmpdir, file.filename)
            file.save(dest)
            fut = batcher.collect([dest])
            try:
                results = fut.result(timeout=30.0)
            except concurrent.futures.TimeoutError:
                return jsonify({'error': 'Prediction timed out'}), 504

            return jsonify({'results': results})
        finally:
            try:
                os.remove(dest)
            except Exception:
                pass
            try:
                os.rmdir(tmpdir)
            except Exception:
                pass


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
