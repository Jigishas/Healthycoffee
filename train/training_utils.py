import torch
from torch.utils.data import DataLoader, WeightedRandomSampler
import numpy as np
from collections import Counter


class EarlyStopping:
    def __init__(self, patience=3, min_delta=0.0):
        self.patience = patience
        self.min_delta = min_delta
        self.counter = 0
        self.best_score = None
        self.early_stop = False

    def __call__(self, val_acc):
        if self.best_score is None:
            self.best_score = val_acc
        elif val_acc < self.best_score + self.min_delta:
            self.counter += 1
            print(f"⚠️ No improvement for {self.counter} epoch(s)")
            if self.counter >= self.patience:
                self.early_stop = True
        else:
            self.best_score = val_acc
            self.counter = 0


def create_balanced_loaders(train_dataset, val_dataset, batch_size=32, num_workers=4):
    targets = [label for _, label in train_dataset]
    class_counts = np.bincount(targets)
    print(f"📊 Class counts: {dict(enumerate(class_counts))}")

    class_weights = 1. / class_counts
    sample_weights = [class_weights[t] for t in targets]

    sampler = WeightedRandomSampler(
        weights=sample_weights,
        num_samples=len(sample_weights),
        replacement=True
    )

    train_loader = DataLoader(
        train_dataset,
        batch_size=batch_size,
        sampler=sampler,
        num_workers=num_workers
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=batch_size,
        shuffle=False,
        num_workers=num_workers
    )

    return train_loader, val_loader


def per_class_accuracy(model, dataloader, device, idx_to_class):
    correct_per_class = Counter()
    total_per_class = Counter()

    model.eval()
    with torch.no_grad():
        for images, labels in dataloader:
            images, labels = images.to(device), labels.to(device)
            outputs = model(images)
            _, preds = outputs.max(1)
            for label, pred in zip(labels, preds):
                if pred == label:
                    correct_per_class[label.item()] += 1
                total_per_class[label.item()] += 1

    print("\n📊 Per-class accuracy:")
    for idx, total in total_per_class.items():
        acc = correct_per_class[idx] / total if total > 0 else 0
        print(f"  {idx_to_class[idx]}: {acc:.2%}")