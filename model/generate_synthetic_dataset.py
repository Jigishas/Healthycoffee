#!/usr/bin/env python3
"""Generate a small synthetic test dataset for smoke testing.

Creates simple colored images for each class found in model mappings under `models/`.
This is intended only for quick smoke tests and not for training.
"""

from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
import json
import random


def load_mappings(models_dir):
    mappings = {}
    for sub in models_dir.iterdir():
        if not sub.is_dir():
            continue
        for mf in sub.glob('class_mapping*.json'):
            try:
                data = json.loads(mf.read_text(encoding='utf-8'))
                names = [v.get('name', str(v)).strip().lower() for k, v in data.items()]
                mappings[sub.name] = names
            except Exception:
                continue
    return mappings


def make_image(text, size=(256,256), color=None):
    color = color or tuple(random.randint(40,220) for _ in range(3))
    img = Image.new('RGB', size, color)
    draw = ImageDraw.Draw(img)
    try:
        font = ImageFont.load_default()
    except Exception:
        font = None
    # draw label
    draw.text((8,8), text[:32], fill=(255,255,255), font=font)
    return img


def generate(output_dir='test_dataset', samples_per_class=5):
    root = Path(__file__).resolve().parent
    models_dir = root / 'models'
    mappings = load_mappings(models_dir)

    out_root = root / output_dir
    out_root.mkdir(parents=True, exist_ok=True)

    # For compatibility with existing layout, create diseases/ and deficiencies/
    for split in ['diseases', 'deficiencies']:
        split_dir = out_root / split
        split_dir.mkdir(parents=True, exist_ok=True)

    # Distribute model mapping classes across splits by name heuristic
    for model_name, class_names in mappings.items():
        if 'disease' in model_name.lower():
            target = out_root / 'diseases'
        else:
            target = out_root / 'deficiencies'

        for cname in class_names:
            cls_dir = target / cname.replace(' ', '_')
            cls_dir.mkdir(parents=True, exist_ok=True)
            for i in range(samples_per_class):
                img = make_image(cname)
                img_path = cls_dir / f'{cname.replace(" ","_")}_{i+1}.jpg'
                img.save(img_path, quality=85)

    print(f'Synthetic dataset generated at {out_root} (samples_per_class={samples_per_class})')


if __name__ == '__main__':
    generate()
