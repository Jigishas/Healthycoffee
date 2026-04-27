"""Serving utilities: load scripted/quantized models, batch predictor, caching.

Provides `ModelRunner` with `predict_batch(paths)` which returns list of dicts.
"""
from pathlib import Path
from functools import lru_cache
from concurrent.futures import ThreadPoolExecutor
import torch
from PIL import Image
import numpy as np
from src.inference import VAL_TRANSFORM


class ModelRunner:
    def __init__(self, scripted_path=None, quantized_path=None, device='cpu', max_workers=4):
        self.device = torch.device(device)
        self.model = None
        self.load_model(scripted_path, quantized_path)
        self.executor = ThreadPoolExecutor(max_workers=max_workers)

    def load_model(self, scripted_path, quantized_path):
        # Prefer quantized CPU model if provided
        try:
            if quantized_path and Path(quantized_path).exists():
                self.model = torch.jit.load(str(quantized_path), map_location='cpu')
            elif scripted_path and Path(scripted_path).exists():
                self.model = torch.jit.load(str(scripted_path), map_location=self.device)
            else:
                raise FileNotFoundError('Model file not found')
            self.model.eval()
        except Exception as e:
            raise

    @staticmethod
    @lru_cache(maxsize=1024)
    def _cached_preprocess(path):
        img = Image.open(path).convert('RGB')
        return VAL_TRANSFORM(img).unsqueeze(0)

    def _predict_single(self, path):
        try:
            inp = self._cached_preprocess(path).to(self.device)
            with torch.no_grad():
                out = self.model(inp)
                probs = torch.nn.functional.softmax(out[0], dim=0).cpu().numpy()
                pred_idx = int(np.argmax(probs))
            return {'class_index': pred_idx, 'confidence': float(probs[pred_idx])}
        except Exception as e:
            return {'error': str(e)}

    def predict_batch(self, paths):
        # Run predictions in parallel using thread pool
        futures = [self.executor.submit(self._predict_single, p) for p in paths]
        return [f.result() for f in futures]
