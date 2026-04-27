"""Test-Time Augmentation (TTA) evaluation.

Runs multiple augmentations per image and averages predicted probabilities.
Writes a JSON summary with before/after metrics.
"""
from pathlib import Path
import numpy as np
import json
from collections import defaultdict
from sklearn.metrics import accuracy_score
from src.inference import TorchClassifier, VAL_TRANSFORM
from optimize_model import LightweightTorchClassifier
from PIL import Image
import torchvision.transforms as T


def tta_predict(model, image_path, n=5):
    # generate simple augmentations
    aug_transforms = [
        T.Compose([T.RandomRotation(0)]),
        T.Compose([T.RandomHorizontalFlip(p=1.0)]),
        T.Compose([T.ColorJitter(brightness=0.2)]),
        T.Compose([T.RandomRotation(10)]),
        T.Compose([T.RandomResizedCrop(224, scale=(0.9,1.0))])
    ]

    probs = None
    for i in range(n):
        img = Image.open(image_path).convert('RGB')
        t = aug_transforms[i % len(aug_transforms)]
        img_aug = t(img)
        inp = VAL_TRANSFORM(img_aug).unsqueeze(0)
        out = model.model(inp) if hasattr(model, 'model') else model.model(inp)
        p = np.exp(out[0].detach().cpu().numpy())
        p = p / p.sum()
        probs = p if probs is None else probs + p

    probs = probs / n
    pred_idx = int(np.argmax(probs))
    return pred_idx, float(probs[pred_idx])


def evaluate_tta(model, split_dir):
    y_true = []
    y_pred_base = []
    y_pred_tta = []

    for class_dir in Path(split_dir).iterdir():
        if not class_dir.is_dir():
            continue
        true = class_dir.name.strip().lower()
        for p in class_dir.glob('*.jpg'):
            # base prediction
            r = model.predict(str(p))
            pred_base = str(r.get('class','')).strip().lower()
            # tta prediction
            pred_idx, conf = tta_predict(model, str(p), n=5)
            # map pred_idx back to class name via model.classes mapping
            mapping = model.classes
            pred_tta = mapping.get(str(pred_idx), {}).get('name', str(pred_idx)).strip().lower()

            y_true.append(true)
            y_pred_base.append(pred_base)
            y_pred_tta.append(pred_tta)

    base_acc = accuracy_score(y_true, y_pred_base)
    tta_acc = accuracy_score(y_true, y_pred_tta)
    return {'base_acc': base_acc, 'tta_acc': tta_acc}


def main():
    root = Path(__file__).resolve().parent
    disease_model = TorchClassifier(str(root / 'models' / 'leaf_diseases' / 'efficientnet_disease_balanced.pth'),
                                    str(root / 'models' / 'leaf_diseases' / 'class_mapping_diseases.json'))
    res = evaluate_tta(disease_model, root / 'test_dataset' / 'diseases')
    out = root / 'tta_results.json'
    out.write_text(json.dumps(res, indent=2))
    print('Saved TTA results to', out)


if __name__ == '__main__':
    main()
