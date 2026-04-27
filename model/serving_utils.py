<<<<<<< HEAD
import torch
from pathlib import Path
from PIL import Image
import json
import os
from src.inference import VAL_TRANSFORM, fast_preprocess_image, TorchClassifier


class ModelRunner:
    def __init__(self, scripted_path=None, quant_path=None, mapping_path=None, device='cpu', max_workers=4):
        self.device = torch.device(device)
        self.scripted_path = Path(scripted_path) if scripted_path else None
        self.quant_path = Path(quant_path) if quant_path else None
        self.mapping = None

        # Attempt to locate mapping if not provided
        if mapping_path:
            with open(mapping_path, 'r', encoding='utf-8') as f:
                self.mapping = json.load(f)
        else:
            # try finding class_mapping_*.json in same dir
            cand = None
            for p in [self.scripted_path, self.quant_path]:
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
        # Prefer quantized scripted model, then scripted, then weight-based TorchClassifier
        try:
            if self.quant_path and self.quant_path.exists():
                self.model = torch.jit.load(str(self.quant_path), map_location=self.device)
            elif self.scripted_path and self.scripted_path.exists():
                self.model = torch.jit.load(str(self.scripted_path), map_location=self.device)
        except Exception:
            self.model = None

        if self.model is None:
            # Fallback: try to locate a .pth weights file in sibling directories
            weights = None
            mapping_file = None
            candidates = []
            for base in [self.scripted_path, self.quant_path]:
                if base is None:
                    continue
                for ft in base.parent.glob('*.pth'):
                    candidates.append(ft)
                for fm in base.parent.glob('class_mapping*.json'):
                    mapping_file = str(fm)

            if candidates:
                weights = str(candidates[0])
                # load with TorchClassifier
                tc = TorchClassifier(weights, mapping_file or '')
                self.model = tc
                self.model_nn = tc.model
                # set mapping if not already loaded
                if self.mapping is None:
                    self.mapping = tc.classes
            else:
                raise RuntimeError('No model file found (no scripted/quant or .pth weights).')

        else:
            # loaded a scripted/quant module
            self.model_nn = self.model

        # ensure model on correct device
        try:
            if hasattr(self.model_nn, 'to'):
                self.model_nn.to(self.device)
        except Exception:
            pass

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
import torch
from pathlib import Path
from PIL import Image
import json
import os
from src.inference import VAL_TRANSFORM, fast_preprocess_image, TorchClassifier


class ModelRunner:
    def __init__(self, scripted_path=None, quant_path=None, mapping_path=None, device='cpu', max_workers=4):
        self.device = torch.device(device)
        self.scripted_path = Path(scripted_path) if scripted_path else None
        self.quant_path = Path(quant_path) if quant_path else None
        self.mapping = None

        # Attempt to locate mapping if not provided
        if mapping_path:
            with open(mapping_path, 'r', encoding='utf-8') as f:
                self.mapping = json.load(f)
        else:
            # try finding class_mapping_*.json in same dir
            cand = None
            for p in [self.scripted_path, self.quant_path]:
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
        # Prefer quantized scripted model, then scripted, then weight-based TorchClassifier
        try:
            if self.quant_path and self.quant_path.exists():
                self.model = torch.jit.load(str(self.quant_path), map_location=self.device)
            elif self.scripted_path and self.scripted_path.exists():
                self.model = torch.jit.load(str(self.scripted_path), map_location=self.device)
        except Exception:
            self.model = None

        if self.model is None:
            # Fallback: try to locate a .pth weights file in sibling directories
            weights = None
            mapping_file = None
            candidates = []
            for base in [self.scripted_path, self.quant_path]:
                if base is None:
                    continue
                for ft in base.parent.glob('*.pth'):
                    candidates.append(ft)
                for fm in base.parent.glob('class_mapping*.json'):
                    mapping_file = str(fm)

            if candidates:
                weights = str(candidates[0])
                # load with TorchClassifier
                tc = TorchClassifier(weights, mapping_file or '')
                self.model = tc
                self.model_nn = tc.model
                # set mapping if not already loaded
                if self.mapping is None:
                    self.mapping = tc.classes
            else:
                raise RuntimeError('No model file found (no scripted/quant or .pth weights).')

        else:
            # loaded a scripted/quant module
            self.model_nn = self.model

        # ensure model on correct device
        try:
            if hasattr(self.model_nn, 'to'):
                self.model_nn.to(self.device)
        except Exception:
            pass

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
>>>>>>> 0499d31 (few updates on new branch)
