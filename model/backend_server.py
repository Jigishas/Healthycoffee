"""Minimal Flask server exposing /predict with batching and threaded workers.

Usage (dev):
  pip install flask gunicorn
  python backend_server.py

Production (example):
  gunicorn -w 4 -k gthread -b 0.0.0.0:5000 backend_server:app
"""
from flask import Flask, request, jsonify
from pathlib import Path
import tempfile
import os
from serving_utils import ModelRunner

app = Flask(__name__)

# Configure model paths (change if necessary)
ROOT = Path(__file__).resolve().parent
SCRIPTED = ROOT / 'models' / 'leaf_diseases' / 'efficientnet_disease_balanced_scripted.pt'
QUANT = ROOT / 'models' / 'leaf_diseases' / 'efficientnet_disease_balanced_quantized.pt'

# Initialize runner (CPU)
runner = ModelRunner(str(SCRIPTED), str(QUANT), device='cpu', max_workers=4)


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
            dest = os.path.join(tmpdir, f.filename)
            f.save(dest)
            paths.append(dest)

        results = runner.predict_batch(paths)
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


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, threaded=True)
