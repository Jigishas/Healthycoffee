#!/usr/bin/env python3
"""Apply saved per-class bias to model and fine-tune last layer.

Usage examples:
  python model/apply_and_finetune_bias.py --bias per_class_bias.json
  python model/apply_and_finetune_bias.py --bias per_class_bias.json --train_dir model/train_dataset --save fine_tuned.pth
"""

import argparse
from pathlib import Path
import json
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
import numpy as np
from sklearn.metrics import accuracy_score

from src.inference import load_model_and_mapping, VAL_TRANSFORM


class ImagePathDataset(Dataset):
    def __init__(self, image_paths, transform):
        self.image_paths = image_paths
        self.transform = transform

    def __len__(self):
        return len(self.image_paths)

    def __getitem__(self, idx):
        p = self.image_paths[idx]
        img = Image.open(p).convert('RGB')
        return self.transform(img), idx


def collect_paths_labels(val_dir, mapping):
    val_dir = Path(val_dir)
    image_paths = []
    labels = []
    name_to_idx = {v['name'].strip().lower(): int(k) for k, v in mapping.items()}
    for class_dir in val_dir.iterdir():
        if not class_dir.is_dir():
            continue
        for p in class_dir.glob('*.jpg'):
            image_paths.append(str(p))
            true = class_dir.name.strip().lower()
            labels.append(name_to_idx.get(true, 0))
    return image_paths, np.array(labels)


def eval_model(model, mapping, image_paths, labels, device):
    model.to(device)
    model.eval()
    probs_list = []
    preds = []
    batch = []
    for p in image_paths:
        img = Image.open(p).convert('RGB')
        inp = VAL_TRANSFORM(img).unsqueeze(0).to(device)
        with torch.no_grad():
            out = model(inp)[0].cpu().numpy()
        probs = np.exp(out - np.max(out))
        probs = probs / probs.sum()
        preds.append(int(probs.argmax()))
        probs_list.append(probs)
    acc = accuracy_score(labels, preds)
    nll = -np.mean([np.log(probs[i] + 1e-12) for probs, i in zip(probs_list, labels)])
    return acc, nll


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--bias', required=True, help='path to per_class_bias.json')
    parser.add_argument('--valdir', help='validation dir', default=str(Path(__file__).resolve().parent / 'test_dataset' / 'diseases'))
    parser.add_argument('--train_dir', help='training dir for fine-tuning (optional)', default=None)
    parser.add_argument('--save', help='path to save fine-tuned model', default='fine_tuned_last_layer.pth')
    parser.add_argument('--model', help='path to model .pth', required=False)
    parser.add_argument('--mapping', help='path to mapping json', required=False)
    args = parser.parse_args()

    root = Path(__file__).resolve().parent
    model_path = args.model or str(root / 'models' / 'leaf_diseases' / 'efficientnet_disease_balanced.pth')
    mapping_path = args.mapping or str(root / 'models' / 'leaf_diseases' / 'class_mapping_diseases.json')

    model, mapping = load_model_and_mapping(model_path, mapping_path)

    # Load bias
    bias_json = Path(args.bias)
    if not bias_json.exists():
        print('Bias file not found:', bias_json)
        return
    bias_data = json.loads(bias_json.read_text())
    bias = bias_data.get('bias') if isinstance(bias_data, dict) else bias_data

    image_paths, labels = collect_paths_labels(args.valdir, mapping)
    if not image_paths:
        print('No validation images found at', args.valdir)
        return

    device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

    # Evaluate before applying bias
    before_acc, before_nll = eval_model(model, mapping, image_paths, labels, device)
    print(f'Before applying bias - acc: {before_acc:.4f}, nll: {before_nll:.4f}')

    # Apply bias to classifier bias term if available
    try:
        final_linear = model.classifier[1]
        if final_linear.bias is None:
            final_linear.bias = nn.Parameter(torch.zeros_like(final_linear.weight[:, 0]))
        with torch.no_grad():
            b = torch.tensor(bias, dtype=torch.float32)
            if b.shape[0] != final_linear.bias.shape[0]:
                print('Bias length mismatch; skipping direct bias application')
            else:
                final_linear.bias += b
                print('Applied bias to model.classifier[1].bias')
    except Exception as e:
        print('Failed to apply bias to classifier bias:', e)

    # Evaluate after applying bias
    after_acc, after_nll = eval_model(model, mapping, image_paths, labels, device)
    print(f'After applying bias - acc: {after_acc:.4f}, nll: {after_nll:.4f}')

    # Fine-tune last layer
    train_paths = None
    train_labels = None
    if args.train_dir:
        train_paths, train_labels = collect_paths_labels(args.train_dir, mapping)
    else:
        # fallback to valdir with a warning
        train_paths, train_labels = image_paths, labels
        print('No train_dir provided; fine-tuning on validation set (not recommended)')

    dataset = ImagePathDataset(train_paths, VAL_TRANSFORM)
    loader = DataLoader(dataset, batch_size=16, shuffle=True)

    # Freeze all except final linear
    for p in model.parameters():
        p.requires_grad = False
    final_linear = model.classifier[1]
    for p in final_linear.parameters():
        p.requires_grad = True

    model.to(device)
    model.train()
    criterion = nn.CrossEntropyLoss()
    optimizer = torch.optim.Adam(final_linear.parameters(), lr=1e-3, weight_decay=1e-4)

    epochs = 5
    for epoch in range(epochs):
        total_loss = 0.0
        count = 0
        for batch_x, idxs in loader:
            batch_x = batch_x.to(device)
            batch_labels = torch.tensor(train_labels[list(idxs.numpy())], dtype=torch.long, device=device)
            optimizer.zero_grad()
            outputs = model(batch_x)
            loss = criterion(outputs, batch_labels)
            loss.backward()
            optimizer.step()
            total_loss += float(loss.item()) * batch_x.size(0)
            count += batch_x.size(0)
        avg = total_loss / max(1, count)
        print(f'Epoch {epoch+1}/{epochs} - loss: {avg:.4f}')

    # Evaluate after fine-tuning
    final_acc, final_nll = eval_model(model, mapping, image_paths, labels, device)
    print(f'After fine-tuning - acc: {final_acc:.4f}, nll: {final_nll:.4f}')

    # Save fine-tuned model weights
    torch.save(model.state_dict(), args.save)
    print('Saved fine-tuned model to', args.save)


if __name__ == '__main__':
    main()
