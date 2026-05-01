import torch
from pathlib import Path
from PIL import Image
import json
import os
from src.inference import VAL_TRANSFORM, fast_preprocess_image, TorchClassifier


class ModelRunner:
    def __init__(self, scripted_path=None, quant_path=None, pth_path=None, mapping_path=None, device='cpu', max_workers=4):
        self.device = torch.device(device)
        self.scripted_path = Path(scripted_path) if scripted_path else None
        self.quant_path = Path(quant_path) if quant_path else None
        self.pth_path = Path(pth_path) if pth_path else None
        self.mapping_path = Path(mapping_path) if mapping_path else None
        self.mapping = None

        # Attempt to locate mapping if not provided. Be tolerant of
        # relative paths by resolving them against this module's
        # directory. Do not raise here; allow model loading to proceed
        # even if a mapping file is not present (fallbacks exist).
        if mapping_path:
            try:
                mp = Path(mapping_path)
                if not mp.exists():
                    # Try resolving relative to the model package directory
                    base = Path(__file__).resolve().parent
                    candidate = (base / mp)
                    if candidate.exists():
                        mp = candidate
                if mp.exists():
                    with open(mp, 'r', encoding='utf-8') as f:
                        self.mapping = json.load(f)
                else:
                    # mapping absent; continue without it and let callers
                    # attempt to discover mappings later or fall back
                    # to model-provided classes
                    self.mapping = None
            except Exception:
                # Never crash during initialization due to mapping issues
                self.mapping = None
        else:
            # try finding class_mapping_*.json in same dir as any model path
            cand = None
            for p in [self.scripted_path, self.quant_path, self.pth_path]:
                if p is None:
                    continue
                for f in p.parent.glob('class_mapping*.json'):
                    cand = f
                    break
                if cand:
                    break
            if cand:
                with open(cand, 'r', encoding='utf-8') as f:
                    self.mapping = json.load(f)

        self.model = None
        self.model_nn = None
        self._load_model()

    def _load_model(self):
        errors = []
        # 1) Prefer quantized scripted model
        try:
            if self.quant_path and self.quant_path.exists():
                self.model = torch.jit.load(str(self.quant_path), map_location=self.device)
                self.model_nn = self.model
                return
        except Exception as e:
            errors.append(f"quant: {e}")

        # 2) Try scripted model
        try:
            if self.scripted_path and self.scripted_path.exists():
                self.model = torch.jit.load(str(self.scripted_path), map_location=self.device)
                self.model_nn = self.model
                return
        except Exception as e:
            errors.append(f"scripted: {e}")

        # 3) Try explicit .pth weights via TorchClassifier
        try:
            if self.pth_path and self.pth_path.exists():
                tc = TorchClassifier(str(self.pth_path), str(self.mapping_path) if self.mapping_path else '')
                self.model = tc
                self.model_nn = tc.model
                if self.mapping is None:
                    self.mapping = tc.classes
                return
        except Exception as e:
            errors.append(f"pth: {e}")

        # 4) Final fallback: auto-discover any .pth in parent dirs of provided paths
        candidates = []
        mapping_file = None
        for base in [self.scripted_path, self.quant_path, self.pth_path]:
            if base is None:
                continue
            for ft in base.parent.glob('*.pth'):
                candidates.append(ft)
            for fm in base.parent.glob('class_mapping*.json'):
                mapping_file = str(fm)

        if candidates:
            weights = str(candidates[0])
            tc = TorchClassifier(weights, mapping_file or '')
            self.model = tc
            self.model_nn = tc.model
            if self.mapping is None:
                self.mapping = tc.classes
            return

        raise RuntimeError(f"No model file found. Errors: {'; '.join(errors)}")

    def to(self, device):
        self.device = torch.device(device)
        if self.model_nn is not None and hasattr(self.model_nn, 'to'):
            self.model_nn = self.model_nn.to(self.device)
        return self

    def _preprocess(self, image_path):
        img = Image.open(image_path).convert('RGB')
        # try VAL_TRANSFORM first
        try:
            t = VAL_TRANSFORM(img)
        except Exception:
            t = fast_preprocess_image(img)
        return t

    def _preprocess_pil(self, pil_image):
        # Accepts a PIL Image
        try:
            t = VAL_TRANSFORM(pil_image)
        except Exception:
            t = fast_preprocess_image(pil_image)
        return t

    def predict_image(self, pil_image):
        """Predict from a PIL Image object and return single-result dict."""
        t = self._preprocess_pil(pil_image)
        batch = t if t.ndim == 4 else t.unsqueeze(0)
        batch = batch.to(self.device)
        with torch.inference_mode():
            out = self.model_nn(batch)
            try:
                probs = torch.nn.functional.softmax(out, dim=1)
            except Exception:
                out0 = out[0] if isinstance(out, (list, tuple)) else out
                probs = torch.nn.functional.softmax(out0, dim=1)

        p = probs[0].cpu()
        conf, idx = torch.max(p, dim=0)
        idx_i = int(idx.item())
        conf_f = float(conf.item())
        label = None
        if self.mapping:
            label = self.mapping.get(str(idx_i), {}).get('name') or self.mapping.get(str(idx_i), {}).get('label')
        if label is None:
            label = str(idx_i)

        return {'class': label, 'class_index': idx_i, 'confidence': round(conf_f, 4)}

    def predict_batch(self, image_paths):
        # Preprocess all into a batch tensor
        tensors = []
        for p in image_paths:
            try:
                tensors.append(self._preprocess(p))
            except Exception:
                # return a placeholder low-confidence result
                tensors.append(torch.zeros(1, 3, 224, 224))

        batch = torch.cat([t if t.ndim==4 else t.unsqueeze(0) for t in tensors], dim=0)
        batch = batch.to(self.device)

        with torch.inference_mode():
            out = self.model_nn(batch)
            # handle if scripted model returns logits directly
            try:
                probs = torch.nn.functional.softmax(out, dim=1)
            except Exception:
                # if out is a tuple or different shape
                out0 = out[0] if isinstance(out, (list, tuple)) else out
                probs = torch.nn.functional.softmax(out0, dim=1)

        results = []
        for i in range(probs.shape[0]):
            p = probs[i].cpu()
            conf, idx = torch.max(p, dim=0)
            idx_i = int(idx.item())
            conf_f = float(conf.item())
            label = None
            if self.mapping:
                label = self.mapping.get(str(idx_i), {}).get('name') or self.mapping.get(str(idx_i), {}).get('label')
            if label is None:
                label = str(idx_i)

            results.append({
                'class': label,
                'class_index': idx_i,
                'confidence': round(conf_f, 4)
            })

        return results

    def predict_batch_pil(self, pil_images):
        """Predict from a list of PIL Image objects and return list of result dicts."""
        tensors = []
        for img in pil_images:
            try:
                tensors.append(self._preprocess_pil(img))
            except Exception:
                tensors.append(torch.zeros(1, 3, 224, 224))

        batch = torch.cat([t if t.ndim == 4 else t.unsqueeze(0) for t in tensors], dim=0)
        batch = batch.to(self.device)

        with torch.inference_mode():
            out = self.model_nn(batch)
            try:
                probs = torch.nn.functional.softmax(out, dim=1)
            except Exception:
                out0 = out[0] if isinstance(out, (list, tuple)) else out
                probs = torch.nn.functional.softmax(out0, dim=1)

        results = []
        for i in range(probs.shape[0]):
            p = probs[i].cpu()
            conf, idx = torch.max(p, dim=0)
            idx_i = int(idx.item())
            conf_f = float(conf.item())
            label = None
            if self.mapping:
                label = self.mapping.get(str(idx_i), {}).get('name') or self.mapping.get(str(idx_i), {}).get('label')
            if label is None:
                label = str(idx_i)

            results.append({
                'class': label,
                'class_index': idx_i,
                'confidence': round(conf_f, 4)
            })

        return results
