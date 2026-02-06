"""Quick evaluation helper to run the disease and deficiency models on a labeled CSV.

CSV format (header): image_path,disease_label,deficiency_label

This script prints accuracy, confusion matrix and top-3 probabilities for first N samples.
"""
import argparse
import os
import csv
from pathlib import Path
import numpy as np
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

from src.inference import TorchClassifier


def load_csv(path):
    rows = []
    with open(path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for r in reader:
            rows.append(r)
    return rows


def main(args):
    csv_path = Path(args.csv)
    if not csv_path.exists():
        print(f"CSV file not found: {csv_path}")
        return

    rows = load_csv(csv_path)
    print(f"Loaded {len(rows)} samples from {csv_path}")

    disease_model = TorchClassifier(args.disease_model, args.disease_map)
    deficiency_model = TorchClassifier(args.def_model, args.def_map)

    true_disease = []
    pred_disease = []

    true_def = []
    pred_def = []

    for i, r in enumerate(rows):
        img = r['image_path']
        if not os.path.exists(img):
            print(f"Missing image: {img}")
            continue

        d_res = disease_model.predict(img)
        f_res = deficiency_model.predict(img)

        true_disease.append(r.get('disease_label'))
        pred_disease.append(d_res['class'])

        true_def.append(r.get('deficiency_label'))
        pred_def.append(f_res['class'])

        if i < args.show:
            print(f"\nSample: {img}")
            print(f"  True disease: {r.get('disease_label')}  Pred: {d_res['class']} ({d_res['confidence']})")
            print(f"  True deficiency: {r.get('deficiency_label')}  Pred: {f_res['class']} ({f_res['confidence']})")

    if true_disease:
        print("\nDisease classification report:")
        print(classification_report(true_disease, pred_disease, zero_division=0))
        print("Confusion matrix:")
        print(confusion_matrix(true_disease, pred_disease))
        print(f"Accuracy: {accuracy_score(true_disease, pred_disease):.4f}")

    if true_def:
        print("\nDeficiency classification report:")
        print(classification_report(true_def, pred_def, zero_division=0))
        print("Confusion matrix:")
        print(confusion_matrix(true_def, pred_def))
        print(f"Accuracy: {accuracy_score(true_def, pred_def):.4f}")


if __name__ == '__main__':
    p = argparse.ArgumentParser()
    p.add_argument('--csv', default='validation_labels.csv', help='CSV with image_path,disease_label,deficiency_label')
    p.add_argument('--disease-model', dest='disease_model', default='models/leaf_diseases/efficientnet_disease_balanced.pth')
    p.add_argument('--disease-map', dest='disease_map', default='models/leaf_diseases/class_mapping_diseases.json')
    p.add_argument('--def-model', dest='def_model', default='models/leaf_deficiencies/efficientnet_deficiency_balanced.pth')
    p.add_argument('--def-map', dest='def_map', default='models/leaf_deficiencies/class_mapping_deficiencies.json')
    p.add_argument('--show', type=int, default=5, help='Number of sample predictions to show')
    args = p.parse_args()
    main(args)
