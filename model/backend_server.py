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
from io import BytesIO
from PIL import Image
from serving_utils import ModelRunner
from src.recommendations import get_additional_recommendations
from src.explanations import get_explanation, get_recommendation
import gc
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

# Lazy-initialized runner and batcher to reduce memory footprint on low-memory instances.
runner = None
batcher = None
# Two-model runners
disease_runner = None
deficiency_runner = None

# Paths for deficiency model (mirror disease paths)
DEF_SCRIPTED = ROOT / 'models' / 'leaf_deficiencies' / 'efficientnet_deficiency_balanced_scripted.pt'
DEF_QUANT = ROOT / 'models' / 'leaf_deficiencies' / 'efficientnet_deficiency_balanced_quantized.pt'


def create_runner_and_batcher():
    """Create the ModelRunner and Batcher lazily with conservative defaults.

    Use environment variables to override defaults in CI or higher-memory hosts:
      MODEL_MAX_WORKERS (default 1)
      BATCH_MAX_SIZE (default 4)
    """
    global runner, batcher, disease_runner, deficiency_runner
    if disease_runner is None:
        try:
            max_workers = int(os.environ.get('MODEL_MAX_WORKERS', '1'))
        except Exception:
            max_workers = 1
        # Create ModelRunner instances (this may load model weights)
        try:
            disease_runner = ModelRunner(str(SCRIPTED), str(QUANT), device='cpu', max_workers=max_workers)
        except Exception:
            disease_runner = ModelRunner(str(SCRIPTED), None, device='cpu', max_workers=max_workers)
    if deficiency_runner is None:
        try:
            deficiency_runner = ModelRunner(str(DEF_SCRIPTED), str(DEF_QUANT), device='cpu', max_workers=max_workers)
        except Exception:
            deficiency_runner = ModelRunner(str(DEF_SCRIPTED), None, device='cpu', max_workers=max_workers)
    if batcher is None:
        try:
            max_batch_size = int(os.environ.get('BATCH_MAX_SIZE', '4'))
        except Exception:
            max_batch_size = 4
        # keep a lightweight batcher for single-model compatibility, but primary flow uses two runners
        batcher = Batcher(disease_runner, max_batch_size=max_batch_size, max_latency=0.05)


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
            # store a shallow copy of the incoming items (images or paths)
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

                # run model on flattened batch (PIL images expected)
            try:
                # If runner provides predict_batch_pil, prefer it
                if hasattr(self.runner, 'predict_batch_pil'):
                    preds = self.runner.predict_batch_pil(batch)
                else:
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
            # Free large objects and run GC to reduce resident memory.
            try:
                del preds
            except Exception:
                pass
            gc.collect()


# global batcher instance
# Do not create a global batcher here; create it lazily via create_runner_and_batcher()


@app.route('/predict', methods=['POST'])
def predict():
    # Accept multipart/form-data files under key 'images'
    files = request.files.getlist('images')
    if not files:
        return jsonify({'error': 'No files received (field name "images" expected)'}), 400
    # Read files into in-memory PIL images and use streaming/batched inference
    images = []
    try:
        for f in files:
            try:
                # Use file.stream if available to avoid copying into temp files
                stream = getattr(f, 'stream', None)
                if stream is not None:
                    img = Image.open(stream).convert('RGB')
                else:
                    img = Image.open(BytesIO(f.read())).convert('RGB')
                images.append(img)
            except Exception:
                # skip invalid images
                continue

        if not images:
            return jsonify({'error': 'No valid image files provided'}), 400

        # Ensure the two runners exist (lazy init)
        create_runner_and_batcher()

        # Run both models on the batch of PIL images
        try:
            disease_results = disease_runner.predict_batch_pil(images) if hasattr(disease_runner, 'predict_batch_pil') else disease_runner.predict_batch([None])
        except Exception as e:
            disease_results = [{'class': 'Unknown', 'class_index': -1, 'confidence': 0.0} for _ in images]

        try:
            deficiency_results = deficiency_runner.predict_batch_pil(images) if hasattr(deficiency_runner, 'predict_batch_pil') else deficiency_runner.predict_batch([None])
        except Exception as e:
            deficiency_results = [{'class': 'Unknown', 'class_index': -1, 'confidence': 0.0} for _ in images]

        # Compose per-image rich payloads
        payloads = []
        for i in range(len(images)):
            d = disease_results[i] if i < len(disease_results) else {'class': 'Unknown', 'class_index': -1, 'confidence': 0.0}
            f = deficiency_results[i] if i < len(deficiency_results) else {'class': 'Unknown', 'class_index': -1, 'confidence': 0.0}
            try:
                recommendations = get_additional_recommendations(disease_class=d.get('class_index', -1), deficiency_class=f.get('class_index', -1))
            except Exception:
                recommendations = []
            disease_expl = get_explanation(d.get('class', 'Unknown'), 'disease') if 'get_explanation' in globals() else None
            disease_rec = get_recommendation(d.get('class', 'Unknown'), 'disease') if 'get_recommendation' in globals() else None
            deficiency_expl = get_explanation(f.get('class', 'Unknown'), 'deficiency') if 'get_explanation' in globals() else None
            deficiency_rec = get_recommendation(f.get('class', 'Unknown'), 'deficiency') if 'get_recommendation' in globals() else None

            payloads.append({
                'disease_prediction': {**d, 'explanation': disease_expl, 'recommendation': disease_rec},
                'deficiency_prediction': {**f, 'explanation': deficiency_expl, 'recommendation': deficiency_rec},
                'recommendations': recommendations,
                'processing_time': 0.0,
                'model_version': 'dev_runner',
                'api_version': 'v1.0',
                'status': 'success'
            })

        # If single image, return object; else list
        return jsonify(payloads[0] if len(payloads) == 1 else payloads)
    finally:
        # Explicitly delete PIL images to free memory
        try:
            for im in images:
                try:
                    del im
                except Exception:
                    pass
        except Exception:
            pass
        gc.collect()

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

    # Ensure runner/batcher exist before processing
    create_runner_and_batcher()

    # Accept single file under key 'image' for compatibility with frontend
    file = request.files.get('image')
    if not file:
        return jsonify({'error': 'No image file provided (field name "image" expected)'}), 400

    # Read file into PIL image (streaming, no disk writes)
    try:
        stream = getattr(file, 'stream', None)
        if stream is not None:
            img = Image.open(stream).convert('RGB')
        else:
            img = Image.open(BytesIO(file.read())).convert('RGB')
    except Exception:
        return jsonify({'error': 'Invalid image file provided'}), 400

    # Run two-model flow for single upload
    create_runner_and_batcher()

    try:
        disease_res = disease_runner.predict_batch_pil([img]) if hasattr(disease_runner, 'predict_batch_pil') else [{'class': 'Unknown', 'class_index': -1, 'confidence': 0.0}]
    except Exception:
        disease_res = [{'class': 'Unknown', 'class_index': -1, 'confidence': 0.0}]

    try:
        deficiency_res = deficiency_runner.predict_batch_pil([img]) if hasattr(deficiency_runner, 'predict_batch_pil') else [{'class': 'Unknown', 'class_index': -1, 'confidence': 0.0}]
    except Exception:
        deficiency_res = [{'class': 'Unknown', 'class_index': -1, 'confidence': 0.0}]

    d = disease_res[0] if disease_res else {'class': 'Unknown', 'class_index': -1, 'confidence': 0.0}
    f = deficiency_res[0] if deficiency_res else {'class': 'Unknown', 'class_index': -1, 'confidence': 0.0}

    try:
        recommendations = get_additional_recommendations(disease_class=d.get('class_index', -1), deficiency_class=f.get('class_index', -1))
    except Exception:
        recommendations = []

    disease_expl = get_explanation(d.get('class', 'Unknown'), 'disease')
    disease_rec = get_recommendation(d.get('class', 'Unknown'), 'disease')
    deficiency_expl = get_explanation(f.get('class', 'Unknown'), 'deficiency')
    deficiency_rec = get_recommendation(f.get('class', 'Unknown'), 'deficiency')

    response = {
        'disease_prediction': {**d, 'explanation': disease_expl, 'recommendation': disease_rec},
        'deficiency_prediction': {**f, 'explanation': deficiency_expl, 'recommendation': deficiency_rec},
        'recommendations': recommendations,
        'processing_time': 0.0,
        'model_version': 'dev_runner',
        'api_version': 'v1.0',
        'status': 'success'
    }

    try:
        del img
    except Exception:
        pass
    gc.collect()
    return jsonify(response)


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
