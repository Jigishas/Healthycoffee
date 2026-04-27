"""Production-ready server with in-memory batching (50ms) for `/predict`.

Usage:
  PORT=5001 python backend_server_prod.py
  gunicorn -w 4 -k gthread -b 0.0.0.0:5001 backend_server_prod:app
"""
from flask import Flask, request, jsonify
from pathlib import Path
import tempfile
import os
from serving_utils import ModelRunner
import threading
import time
import uuid
import concurrent.futures

app = Flask(__name__)

ROOT = Path(__file__).resolve().parent
SCRIPTED = ROOT / 'models' / 'leaf_diseases' / 'efficientnet_disease_balanced_scripted.pt'
QUANT = ROOT / 'models' / 'leaf_diseases' / 'efficientnet_disease_balanced_quantized.pt'

runner = ModelRunner(str(SCRIPTED), str(QUANT), device='cpu', max_workers=4)


class Batcher:
    def __init__(self, runner, max_batch_size=16, max_latency=0.05):
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
            self.lock.notify()
        return fut

    def _worker(self):
        while True:
            with self.lock:
                if not self.queue:
                    self.lock.wait()
                self.lock.wait(timeout=self.max_latency)
                batch = []
                batch_items = []
                while self.queue and len(batch) < self.max_batch_size:
                    req_id, paths, fut = self.queue.pop(0)
                    batch_items.append((req_id, paths, fut))
                    batch.extend(paths)

            if not batch_items:
                continue

            try:
                preds = self.runner.predict_batch(batch)
            except Exception as e:
                for _req_id, _paths, fut in batch_items:
                    fut.set_exception(e)
                continue

            idx = 0
            for _req_id, paths, fut in batch_items:
                n = len(paths)
                part = preds[idx: idx + n]
                idx += n
                fut.set_result(part)


batcher = Batcher(runner, max_batch_size=16, max_latency=0.05)


@app.route('/predict', methods=['POST'])
def predict():
    files = request.files.getlist('images')
    if not files:
        return jsonify({'error': 'No files received (field name "images" expected)'}), 400

    tmpdir = tempfile.mkdtemp()
    paths = []
    try:
        for f in files:
            dest = os.path.join(tmpdir, f.filename)
            f.save(dest)
            paths.append(dest)

        fut = batcher.collect(paths)
        try:
            results = fut.result(timeout=15.0)
        except concurrent.futures.TimeoutError:
            return jsonify({'error': 'Prediction timed out'}), 504

        return jsonify({'results': results})
    finally:
        for p in paths:
            try:
                os.remove(p)
            except Exception:
                pass
        try:
            os.rmdir(tmpdir)
        except Exception:
            pass


if __name__ == '__main__':
    port = int(os.getenv('PORT', '5001'))
    app.run(host='0.0.0.0', port=port, threaded=True)
