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
from src.inference import VAL_TRANSFORM


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


def evaluate_model_on_splits(model, X, y, n_splits=5, retrain_head=False, num_epochs=2, device='cpu'):
    # Determine safe number of splits: cannot exceed number of samples or smallest class count
    n_samples = len(y)
    if n_samples < 2:
        raise ValueError(f'Not enough samples for cross-validation (n_samples={n_samples})')

    # compute counts per class
    from collections import Counter
    class_counts = Counter(y)
    min_class_count = min(class_counts.values())

    safe_splits = min(n_splits, n_samples, min_class_count)
    if safe_splits < 2:
        # fallback to simple train/test split evaluation
        safe_splits = None

    if safe_splits:
        skf = StratifiedKFold(n_splits=safe_splits, shuffle=True, random_state=42)
        split_iter = skf.split(X, y)
    else:
        # simple single split: 80/20
        from sklearn.model_selection import train_test_split
        train_idx, test_idx = train_test_split(range(n_samples), test_size=0.2, stratify=y if min_class_count>1 else None, random_state=42)
        split_iter = [(train_idx, test_idx)]
    accs, precs, recs, f1s = [], [], [], []

    for train_idx, test_idx in split_iter:
        X_test = [X[i] for i in test_idx]
        y_test = [y[i] for i in test_idx]

        # Optionally retrain a lightweight head on the training split
        if retrain_head:
            # Prepare a fresh model copy and train only the classifier head
            import torch
            from torch.utils.data import DataLoader, Dataset
            from torchvision import transforms

            class FoldDataset(Dataset):
                def __init__(self, paths, labels, transform=None):
                    self.paths = paths
                    self.labels = labels
                    self.transform = transform

                def __len__(self):
                    return len(self.paths)

                def __getitem__(self, idx):
                    img = __import__('PIL').Image.open(self.paths[idx]).convert('RGB')
                    if self.transform:
                        img = self.transform(img)
                    return img, self.labels[idx]

            train_X = [X[i] for i in train_idx]
            train_y = [y[i] for i in train_idx]

            # Build label mapping for this fold
            classes = sorted(list(set(y)))
            class_to_idx = {c: i for i, c in enumerate(classes)}
            idx_to_class = {i: c for c, i in class_to_idx.items()}

            # Build model scaffold
            base_model = model.model if hasattr(model, 'model') else model
            torch.manual_seed(42)
            # Create a lightweight copy by re-instantiating EfficientNet-B0 and loading weights if possible
            import torchvision.models as vm
            net = vm.efficientnet_b0(weights=vm.EfficientNet_B0_Weights.IMAGENET1K_V1)
            # Attempt to load state_dict from base_model
            try:
                net.load_state_dict(base_model.state_dict(), strict=False)
            except Exception:
                pass

            # Freeze feature layers
            for param in net.features.parameters():
                param.requires_grad = False

            num_classes = len(set(y))
            net.classifier[1] = torch.nn.Linear(net.classifier[1].in_features, num_classes)
            net = net.to(device)

            # convert labels to indices for training
            train_y_idx = [class_to_idx[l] for l in train_y]
            train_ds = FoldDataset(train_X, train_y_idx, transform=VAL_TRANSFORM)
            train_loader = DataLoader(train_ds, batch_size=16, shuffle=True)

            optimizer = torch.optim.AdamW(filter(lambda p: p.requires_grad, net.parameters()), lr=1e-4)
            criterion = torch.nn.CrossEntropyLoss()

            net.train()
            for ep in range(num_epochs):
                for xb, yb in train_loader:
                    xb = xb.to(device)
                    yb = yb.to(device)
                    optimizer.zero_grad()
                    out = net(xb)
                    loss = criterion(out, yb)
                    loss.backward()
                    optimizer.step()

            # Use the retrained head for predictions
            def predict_fn(p):
                img = __import__('PIL').Image.open(p).convert('RGB')
                inp = VAL_TRANSFORM(img).unsqueeze(0).to(device)
                with torch.no_grad():
                    out = net(inp)
                    pred_idx = int(out.argmax(dim=1).item())
                return idx_to_class.get(pred_idx, str(pred_idx))

            preds = []
            for xp in X_test:
                try:
                    preds.append(predict_fn(xp))
                except Exception:
                    preds.append('error')
        else:
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
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--retrain-head', action='store_true', help='Retrain classifier head per fold')
    parser.add_argument('--epochs', type=int, default=2, help='Epochs for retraining head')
    args = parser.parse_args()

    # Disease
    Xd, yd = gather_samples(test_dir, 'diseases')
    disease_model = TorchClassifier(str(root / 'models' / 'leaf_diseases' / 'efficientnet_disease_balanced.pth'),
                                    str(root / 'models' / 'leaf_diseases' / 'class_mapping_diseases.json'))

    if Xd:
        print('Running stratified CV for disease model...')
        disease_results = evaluate_model_on_splits(disease_model, Xd, yd, n_splits=5, retrain_head=args.retrain_head, num_epochs=args.epochs)
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
        deficiency_results = evaluate_model_on_splits(deficiency_model, Xf, yf, n_splits=5, retrain_head=args.retrain_head, num_epochs=args.epochs)
        print(json.dumps(deficiency_results, indent=2))
    else:
        print('No deficiency samples found for CV.')


if __name__ == '__main__':
    main()
