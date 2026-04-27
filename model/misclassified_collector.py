#!/usr/bin/env python3
"""Collect misclassified examples for active review.

Scans `test_dataset/`, runs predictions using the existing classifiers,
and copies misclassified images into `model/misclassified/<model_name>/`.
Also writes a CSV with columns: model, true_label, predicted_label, confidence, src_path, dest_path
"""

import os
import csv
import shutil
from pathlib import Path
import time

from src.inference import TorchClassifier
from optimize_model import LightweightTorchClassifier


def collect_misclassified(output_dir='misclassified'):
    root = Path(__file__).resolve().parent
    test_dir = root / 'test_dataset'
    out_dir = root / output_dir
    out_dir.mkdir(exist_ok=True)

    # Initialize models
    disease_model = TorchClassifier(
        str(root / 'models' / 'leaf_diseases' / 'efficientnet_disease_balanced.pth'),
        str(root / 'models' / 'leaf_diseases' / 'class_mapping_diseases.json')
    )

    deficiency_model = LightweightTorchClassifier(
        str(root / 'models' / 'leaf_deficiencies' / 'efficientnet_deficiency_balanced.pth'),
        str(root / 'models' / 'leaf_deficiencies' / 'class_mapping_deficiencies.json'),
        confidence_threshold=0.3,
        preload=True
    )

    rows = []

    def process_split(split, model, model_name):
        split_path = test_dir / split
        if not split_path.exists():
            return
        model_out = out_dir / model_name
        model_out.mkdir(parents=True, exist_ok=True)

        for class_dir in split_path.iterdir():
            if not class_dir.is_dir():
                continue
            true_label = class_dir.name.strip().lower()
            for img in class_dir.glob('*.jpg'):
                try:
                    start = time.time()
                    res = model.predict(str(img))
                    elapsed = time.time() - start
                    pred = str(res.get('class', '')).strip().lower()
                    conf = float(res.get('confidence', 0.0))

                    if pred != true_label:
                        dest = model_out / f"{true_label}__pred_{pred}__{img.name}"
                        shutil.copy2(img, dest)
                        rows.append([model_name, true_label, pred, conf, str(img), str(dest), elapsed])

                except Exception as e:
                    print(f"Error processing {img}: {e}")

    process_split('diseases', disease_model, 'disease')
    process_split('deficiencies', deficiency_model, 'deficiency')

    # Save CSV
    csv_path = out_dir / 'misclassified_summary.csv'
    with open(csv_path, 'w', newline='', encoding='utf-8') as f:
        writer = csv.writer(f)
        writer.writerow(['model', 'true_label', 'predicted_label', 'confidence', 'src_path', 'dest_path', 'inference_time'])
        for r in rows:
            writer.writerow(r)

    print(f"Saved {len(rows)} misclassified examples to {out_dir} and summary CSV {csv_path}")


if __name__ == '__main__':
    collect_misclassified()
