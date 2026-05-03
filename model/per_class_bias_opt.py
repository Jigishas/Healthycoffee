#!/usr/bin/env python3
"""Per-class additive bias optimizer.

Learns an additive bias vector (one value per class) applied to model logits
to minimize NLL on a validation set. Saves bias vector and reports metrics
before/after.
"""

import argparse
from pathlib import Path
import json
import torch
import torch.nn as nn
import numpy as np
from sklearn.metrics import accuracy_score

from src.inference import load_model_and_mapping, VAL_TRANSFORM


def collect_logits_labels(model, mapping, image_paths, device='cpu'):
    logits_list = []
    labels = []
    name_to_idx = {v['name'].strip().lower(): int(k) for k, v in mapping.items()}

    for p in image_paths:
        image = __import__('PIL').Image.open(p).convert('RGB')
        inp = VAL_TRANSFORM(image).unsqueeze(0)
        with torch.no_grad():
            logits = model(inp)[0].cpu()
        logits_list.append(logits.numpy())
        true = Path(p).parent.name.strip().lower()
        labels.append(name_to_idx.get(true, 0))

    return np.stack(logits_list, axis=0), np.array(labels)


def fit_bias(logits, labels, max_iter=500):
    # logits: numpy [N,C]
    device = torch.device('cpu')
    logits_t = torch.tensor(logits, dtype=torch.float32, device=device)
    labels_t = torch.tensor(labels, dtype=torch.long, device=device)

    C = logits_t.shape[1]
    bias = nn.Parameter(torch.zeros(C, dtype=torch.float32, device=device))
    nll = nn.CrossEntropyLoss()

    try:
        optimizer = torch.optim.LBFGS([bias], max_iter=200, line_search_fn='strong_wolfe')

        def closure():
            optimizer.zero_grad()
            scaled = logits_t + bias.unsqueeze(0)
            loss = nll(scaled, labels_t)
            loss.backward()
            return loss

        optimizer.step(closure)
        return bias.detach().cpu().numpy().tolist()
    except Exception:
        # Fallback to Adam
        opt = torch.optim.Adam([bias], lr=1e-2)
        for i in range(max_iter):
            opt.zero_grad()
            scaled = logits_t + bias.unsqueeze(0)
            loss = nll(scaled, labels_t)
            loss.backward()
            opt.step()
        return bias.detach().cpu().numpy().tolist()


def apply_bias_and_eval(bias, logits, labels):
    scaled = logits + np.array(bias)[None, :]
    probs = np.exp(scaled - np.max(scaled, axis=1, keepdims=True))
    probs = probs / probs.sum(axis=1, keepdims=True)
    preds = probs.argmax(axis=1)
    acc = accuracy_score(labels, preds)
    ll = -np.mean(np.log(probs[np.arange(len(labels)), labels] + 1e-12))
    return acc, ll


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--model', help='path to model .pth', required=False)
    parser.add_argument('--mapping', help='path to class mapping json', required=False)
    parser.add_argument('--valdir', help='validation/val dataset dir', required=False)
    parser.add_argument('--out', help='output json path', default='per_class_bias.json')
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    model_path = args.model or str(root / 'models' / 'leaf_diseases' / 'efficientnet_disease_balanced.pth')
    mapping_path = args.mapping or str(root / 'models' / 'leaf_diseases' / 'class_mapping_diseases.json')

    model, mapping = load_model_and_mapping(model_path, mapping_path)

    val_dir = args.valdir or str(root / 'test_dataset' / 'diseases')
    val_dir = Path(val_dir)
    image_paths = []
    for class_dir in val_dir.iterdir():
        if not class_dir.is_dir():
            continue
        for p in class_dir.glob('*.jpg'):
            image_paths.append(str(p))

    if not image_paths:
        print('No validation images found for bias optimization.')
        return

    logits, labels = collect_logits_labels(model, mapping, image_paths)

    before_acc, before_nll = apply_bias_and_eval([0.0] * logits.shape[1], logits, labels)
    print(f'Before bias - acc: {before_acc:.4f}, nll: {before_nll:.4f}')

    bias = fit_bias(logits, labels)
    print('Fitted per-class bias (first 10):', bias[:10])

    after_acc, after_nll = apply_bias_and_eval(bias, logits, labels)
    print(f'After bias - acc: {after_acc:.4f}, nll: {after_nll:.4f}')

    out = Path(args.out)
    out.write_text(json.dumps({'bias': bias, 'before': {'acc': float(before_acc), 'nll': float(before_nll)}, 'after': {'acc': float(after_acc), 'nll': float(after_nll)}}, indent=2))
    print('Saved bias results to', out)


if __name__ == '__main__':
    main()
