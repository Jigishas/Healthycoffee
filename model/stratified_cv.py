#!/usr/bin/env python3
"""Stratified K-Fold evaluation using existing inference models.

This script performs stratified K-fold splits on the available test dataset
and runs the provided (pretrained) models on each fold's test portion to
produce aggregated metrics (accuracy, precision, recall, f1) with mean/std.
"""

from pathlib import Path
import json
import numpy as np
from sklearn.model_selection import StratifiedKFold
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from src.inference import TorchClassifier
from optimize_model import LightweightTorchClassifier


def gather_samples(test_dir: Path, split: str):
    samples = []
    labels = []
    split_path = test_dir / split
    if not split_path.exists():
        return samples, labels
    for class_dir in split_path.iterdir():
        if not class_dir.is_dir():
            continue
        label = class_dir.name.strip().lower()
        for p in class_dir.glob('*.jpg'):
            samples.append(str(p))
            labels.append(label)
    return samples, labels


def evaluate_model_on_splits(model, X, y, n_splits=5):
    skf = StratifiedKFold(n_splits=min(n_splits, max(2, len(np.unique(y)))), shuffle=True, random_state=42)
    accs, precs, recs, f1s = [], [], [], []

    for train_idx, test_idx in skf.split(X, y):
        X_test = [X[i] for i in test_idx]
        y_test = [y[i] for i in test_idx]

        preds = []
        for xp in X_test:
            try:
                r = model.predict(xp)
                preds.append(str(r.get('class', '')).strip().lower())
            except Exception:
                preds.append('error')

        accs.append(accuracy_score(y_test, preds))
        precs.append(precision_score(y_test, preds, average='weighted', zero_division=0))
        recs.append(recall_score(y_test, preds, average='weighted', zero_division=0))
        f1s.append(f1_score(y_test, preds, average='weighted', zero_division=0))

    return {
        'accuracy_mean': float(np.mean(accs)),
        'accuracy_std': float(np.std(accs)),
        'precision_mean': float(np.mean(precs)),
        'precision_std': float(np.std(precs)),
        'recall_mean': float(np.mean(recs)),
        'recall_std': float(np.std(recs)),
        'f1_mean': float(np.mean(f1s)),
        'f1_std': float(np.std(f1s)),
    }


def main():
    root = Path(__file__).resolve().parent
    test_dir = root / 'test_dataset'

    # Disease
    Xd, yd = gather_samples(test_dir, 'diseases')
    disease_model = TorchClassifier(str(root / 'models' / 'leaf_diseases' / 'efficientnet_disease_balanced.pth'),
                                    str(root / 'models' / 'leaf_diseases' / 'class_mapping_diseases.json'))

    if Xd:
        print('Running stratified CV for disease model...')
        disease_results = evaluate_model_on_splits(disease_model, Xd, yd, n_splits=5)
        print(json.dumps(disease_results, indent=2))
    else:
        print('No disease samples found for CV.')

    # Deficiency
    Xf, yf = gather_samples(test_dir, 'deficiencies')
    deficiency_model = LightweightTorchClassifier(str(root / 'models' / 'leaf_deficiencies' / 'efficientnet_deficiency_balanced.pth'),
                                                 str(root / 'models' / 'leaf_deficiencies' / 'class_mapping_deficiencies.json'),
                                                 preload=True)
    if Xf:
        print('Running stratified CV for deficiency model...')
        deficiency_results = evaluate_model_on_splits(deficiency_model, Xf, yf, n_splits=5)
        print(json.dumps(deficiency_results, indent=2))
    else:
        print('No deficiency samples found for CV.')


if __name__ == '__main__':
    main()
