#!/usr/bin/env python3
"""Temperature scaling calibration for model confidence.

Fits a single temperature parameter on a validation set by minimizing
negative log-likelihood. Applies temperature to logits at inference time
and writes before/after metrics.
"""

import torch
import torch.nn as nn
from pathlib import Path
import numpy as np
from sklearn.metrics import log_loss, accuracy_score
import json

from src.inference import load_model_and_mapping, VAL_TRANSFORM
import argparse


class TemperatureScaler(nn.Module):
    def __init__(self):
        super().__init__()
        self.temperature = nn.Parameter(torch.ones(1) * 1.0)

    def forward(self, logits):
        # logits: torch.Tensor [N, C]
        return logits / self.temperature


def collect_logits_labels(model, mapping, image_paths, device='cpu'):
    logits_list = []
    labels = []
    # Build reverse mapping from name to index
    name_to_idx = {v['name'].strip().lower(): int(k) for k, v in mapping.items()}

    for p in image_paths:
        image = __import__('PIL').Image.open(p).convert('RGB')
        inp = VAL_TRANSFORM(image).unsqueeze(0)
        with torch.no_grad():
            logits = model(inp)[0].cpu()
        logits_list.append(logits.numpy())
        # infer true label from path (parent folder)
        true = Path(p).parent.name.strip().lower()
        labels.append(name_to_idx.get(true, 0))

    return np.stack(logits_list, axis=0), np.array(labels)


def fit_temperature(logits, labels):
    # logits: numpy [N,C], labels: numpy [N]
    logits_t = torch.tensor(logits, dtype=torch.float32)
    labels_t = torch.tensor(labels, dtype=torch.long)

    temp_model = TemperatureScaler()
    nll = nn.CrossEntropyLoss()

    # Try LBFGS first (fast), but on some Windows/BLAS installs it may fail.
    try:
        optimizer = torch.optim.LBFGS([temp_model.temperature], max_iter=50, line_search_fn='strong_wolfe')

        def closure():
            optimizer.zero_grad()
            scaled = temp_model(logits_t)
            loss = nll(scaled, labels_t)
            loss.backward()
            return loss

        optimizer.step(closure)
        return float(temp_model.temperature.item())
    except Exception:
        # Fallback: simple grid search over plausible temperatures
        logits_np = logits_t.numpy()
        labels_np = labels_t.numpy()
        temps = np.linspace(0.5, 5.0, 46)
        best_temp = 1.0
        best_nll = float('inf')
        for t in temps:
            scaled = logits_np / t
            probs = np.exp(scaled - np.max(scaled, axis=1, keepdims=True))
            probs = probs / probs.sum(axis=1, keepdims=True)
            nll_val = -np.mean(np.log(probs[np.arange(len(labels_np)), labels_np] + 1e-12))
            if nll_val < best_nll:
                best_nll = nll_val
                best_temp = float(t)
        return best_temp


def apply_temperature_and_eval(temperature, logits, labels):
    scaled = logits / temperature
    probs = np.exp(scaled - np.max(scaled, axis=1, keepdims=True))
    probs = probs / probs.sum(axis=1, keepdims=True)
    preds = probs.argmax(axis=1)
    acc = accuracy_score(labels, preds)
    ll = -np.mean(np.log(probs[np.arange(len(labels)), labels] + 1e-12))
    return acc, ll


def main():
    root = Path(__file__).resolve().parent
    # Use disease model as example
    model, mapping = load_model_and_mapping(str(root / 'models' / 'leaf_diseases' / 'efficientnet_disease_balanced.pth'),
                                           str(root / 'models' / 'leaf_diseases' / 'class_mapping_diseases.json'))

    # gather validation images from test_dataset/diseases (use as val for demo)
    val_dir = root / 'test_dataset' / 'diseases'
    image_paths = []
    for class_dir in val_dir.iterdir():
        if not class_dir.is_dir():
            continue
        for p in class_dir.glob('*.jpg'):
            image_paths.append(str(p))

    if not image_paths:
        print('No validation images found for temperature scaling.')
        return

    logits, labels = collect_logits_labels(model, mapping, image_paths)

    before_acc, before_nll = apply_temperature_and_eval(1.0, logits, labels)
    print(f'Before scaling - acc: {before_acc:.4f}, nll: {before_nll:.4f}')

    temp = fit_temperature(logits, labels)
    print(f'Fitted temperature: {temp:.4f}')

    after_acc, after_nll = apply_temperature_and_eval(temp, logits, labels)
    print(f'After scaling - acc: {after_acc:.4f}, nll: {after_nll:.4f}')

    # Save calibration
    out = root / 'temperature_scaling.json'
    out.write_text(json.dumps({'temperature': float(temp),
                               'before': {'acc': float(before_acc), 'nll': float(before_nll)},
                               'after': {'acc': float(after_acc), 'nll': float(after_nll)}}, indent=2))
    print('Saved temperature scaling results to', out)


if __name__ == '__main__':
    main()
