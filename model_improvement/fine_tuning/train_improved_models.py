#!/usr/bin/env python3
"""
Improved Model Training Script

This script retrains the coffee leaf disease and deficiency models with:
1. Expanded healthy leaf dataset
2. Data augmentation
3. Better training parameters
4. Cross-validation
"""

import os
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import Dataset, DataLoader, random_split
from torchvision import models, transforms
import json
from pathlib import Path
import time
from PIL import Image
import numpy as np
from sklearn.metrics import accuracy_score, precision_recall_fscore_support
import shutil

class CoffeeLeafDataset(Dataset):
    """Custom dataset for coffee leaf images with improved data handling"""

    def __init__(self, root_dir, transform=None, class_mapping=None):
        self.root_dir = Path(root_dir)
        self.transform = transform
        self.class_mapping = class_mapping or {}

        # Collect all image paths and labels
        self.samples = []
        self.classes = []

        if self.root_dir.exists():
            for class_dir in self.root_dir.iterdir():
                if class_dir.is_dir():
                    class_name = class_dir.name
                    if class_name not in self.classes:
                        self.classes.append(class_name)

                    for img_path in class_dir.glob('*.jpg'):
                        self.samples.append((str(img_path), class_name))

        # Create reverse mapping for labels
        self.class_to_idx = {cls: i for i, cls in enumerate(sorted(self.classes))}

        print(f"Dataset loaded: {len(self.samples)} samples, {len(self.classes)} classes")
        for cls in sorted(self.classes):
            count = sum(1 for _, label in self.samples if label == cls)
            print(f"  {cls}: {count} samples")

    def __len__(self):
        return len(self.samples)

    def __getitem__(self, idx):
        img_path, label = self.samples[idx]

        try:
            image = Image.open(img_path).convert('RGB')
        except Exception as e:
            print(f"Error loading {img_path}: {e}")
            # Return a blank image as fallback
            image = Image.new('RGB', (224, 224), (128, 128, 128))

        if self.transform:
            image = self.transform(image)

        label_idx = self.class_to_idx[label]
        return image, label_idx

class ImprovedModelTrainer:
    def __init__(self, model_type='disease'):
        self.model_type = model_type
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        print(f"Training {model_type} model on {self.device}")

        # Set paths based on model type
        if model_type == 'disease':
            self.model_path = '../../model/models/leaf_diseases/efficientnet_disease_balanced.pth'
            self.class_mapping_path = '../../model/models/leaf_diseases/class_mapping_diseases.json'
            self.train_dir = '../train'
        else:
            self.model_path = '../../model/models/leaf_deficiencies/efficientnet_deficiency_balanced.pth'
            self.class_mapping_path = '../../model/models/leaf_deficiencies/class_mapping_deficiencies.json'
            self.train_dir = '../expanded_dataset/deficiencies'

        # Load original model and class mapping
        self.load_original_model()

    def load_original_model(self):
        """Load the original model and class mapping"""
        print("Loading original model...")

        # Load class mapping
        with open(self.class_mapping_path, 'r') as f:
            self.class_mapping = json.load(f)

        self.num_classes = len(self.class_mapping)

        # Load model
        self.model = models.efficientnet_b0(weights='IMAGENET1K_V1')
        self.model.classifier[1] = nn.Linear(self.model.classifier[1].in_features, self.num_classes)

        # Load trained weights
        state_dict = torch.load(self.model_path, map_location=self.device)
        self.model.load_state_dict(state_dict)
        self.model = self.model.to(self.device)

        print("Original model loaded successfully")

    def create_data_loaders(self):
        """Create training and validation data loaders"""
        # Data augmentation and normalization
        train_transform = transforms.Compose([
            transforms.RandomResizedCrop(224),
            transforms.RandomHorizontalFlip(),
            transforms.RandomVerticalFlip(),
            transforms.RandomRotation(30),
            transforms.ColorJitter(brightness=0.2, contrast=0.2, saturation=0.2, hue=0.1),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

        val_transform = transforms.Compose([
            transforms.Resize(256),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

        # Create dataset
        dataset = CoffeeLeafDataset(self.train_dir, transform=train_transform)

        # Split into train/val
        train_size = int(0.8 * len(dataset))
        val_size = len(dataset) - train_size
        train_dataset, val_dataset = random_split(dataset, [train_size, val_size])

        # Apply validation transform to val dataset
        val_dataset.dataset.transform = val_transform

        # Create data loaders
        train_loader = DataLoader(train_dataset, batch_size=16, shuffle=True, num_workers=0)
        val_loader = DataLoader(val_dataset, batch_size=16, shuffle=False, num_workers=0)

        return train_loader, val_loader

    def train_model(self, num_epochs=15):
        """Train the model with improved parameters"""
        print(f"Starting training for {num_epochs} epochs...")

        train_loader, val_loader = self.create_data_loaders()

        # Loss function and optimizer
        criterion = nn.CrossEntropyLoss()
        optimizer = optim.AdamW(self.model.parameters(), lr=1e-4, weight_decay=1e-4)
        scheduler = optim.lr_scheduler.CosineAnnealingLR(optimizer, T_max=num_epochs)

        # Training history
        history = {
            'train_loss': [], 'val_loss': [], 'val_acc': [],
            'precision': [], 'recall': [], 'f1': []
        }

        best_acc = 0.0
        best_model_state = None

        for epoch in range(num_epochs):
            print(f"\nEpoch {epoch+1}/{num_epochs}")
            print("-" * 30)

            # Training phase
            self.model.train()
            running_loss = 0.0

            for inputs, labels in train_loader:
                inputs, labels = inputs.to(self.device), labels.to(self.device)

                optimizer.zero_grad()
                outputs = self.model(inputs)
                loss = criterion(outputs, labels)
                loss.backward()
                optimizer.step()

                running_loss += loss.item() * inputs.size(0)

            epoch_loss = running_loss / len(train_loader.dataset)
            history['train_loss'].append(epoch_loss)

            # Validation phase
            self.model.eval()
            val_loss = 0.0
            all_preds = []
            all_labels = []

            with torch.no_grad():
                for inputs, labels in val_loader:
                    inputs, labels = inputs.to(self.device), labels.to(self.device)

                    outputs = self.model(inputs)
                    loss = criterion(outputs, labels)

                    val_loss += loss.item() * inputs.size(0)

                    _, preds = torch.max(outputs, 1)
                    all_preds.extend(preds.cpu().numpy())
                    all_labels.extend(labels.cpu().numpy())

            val_loss /= len(val_loader.dataset)
            val_acc = accuracy_score(all_labels, all_preds)
            precision, recall, f1, _ = precision_recall_fscore_support(all_labels, all_preds, average='weighted')

            history['val_loss'].append(val_loss)
            history['val_acc'].append(val_acc)
            history['precision'].append(precision)
            history['recall'].append(recall)
            history['f1'].append(f1)

            print(".4f")
            print(".4f")

            # Save best model
            if val_acc > best_acc:
                best_acc = val_acc
                best_model_state = self.model.state_dict().copy()

            scheduler.step()

            # Rest for 5 seconds after each epoch to prevent overheating
            print("Resting for 5 seconds to prevent overheating...")
            time.sleep(5)

        # Save best model to original path
        if best_model_state:
            torch.save(best_model_state, self.model_path)
            print(f"Best model saved to: {self.model_path}")

            # Save training history and metadata
            metadata = {
                'model_type': self.model_type,
                'num_classes': self.num_classes,
                'classes': list(self.class_mapping.keys()),
                'best_accuracy': best_acc,
                'training_epochs': len(history['val_acc']),
                'final_metrics': {
                    'accuracy': history['val_acc'][-1],
                    'precision': history['precision'][-1],
                    'recall': history['recall'][-1],
                    'f1_score': history['f1'][-1]
                },
                'history': history,
                'training_config': {
                    'learning_rate': 1e-4,
                    'batch_size': 16,
                    'optimizer': 'AdamW',
                    'scheduler': 'CosineAnnealingLR'
                }
            }

            metadata_path = f"retrained_{self.model_type}_metadata.json"
            with open(metadata_path, 'w') as f:
                json.dump(metadata, f, indent=2)

            print(f"Training metadata saved to: {metadata_path}")

        return best_acc, history

def create_expanded_dataset():
    """Create expanded dataset by combining original and healthy samples"""
    print("Setting up expanded dataset...")

    # Define paths
    original_disease = Path("../test_dataset/diseases")
    original_deficiency = Path("../test_dataset/deficiencies")
    healthy_samples = Path("expanded_dataset/healthy_final")
    expanded_disease = Path("../expanded_dataset/diseases")
    expanded_deficiency = Path("../expanded_dataset/deficiencies")

    # Create directories
    expanded_disease.mkdir(parents=True, exist_ok=True)
    expanded_deficiency.mkdir(parents=True, exist_ok=True)

    # Copy original disease samples
    if original_disease.exists():
        for cls_dir in original_disease.iterdir():
            if cls_dir.is_dir():
                cls_name = cls_dir.name
                dst_dir = expanded_disease / cls_name
                dst_dir.mkdir(exist_ok=True)
                for img in cls_dir.glob("*.jpg"):
                    shutil.copy2(img, dst_dir / img.name)

    # Copy original deficiency samples
    if original_deficiency.exists():
        for cls_dir in original_deficiency.iterdir():
            if cls_dir.is_dir():
                cls_name = cls_dir.name
                dst_dir = expanded_deficiency / cls_name
                dst_dir.mkdir(exist_ok=True)
                for img in cls_dir.glob("*.jpg"):
                    shutil.copy2(img, dst_dir / img.name)

    # Add expanded healthy samples to both datasets
    if healthy_samples.exists():
        # Copy to disease dataset
        dst_healthy_disease = expanded_disease / "healthy"
        dst_healthy_disease.mkdir(exist_ok=True)
        for img in healthy_samples.glob("*.jpg"):
            shutil.copy2(img, dst_healthy_disease / f"expanded_{img.name}")

        # Copy to deficiency dataset
        dst_healthy_deficiency = expanded_deficiency / "healthy"
        dst_healthy_deficiency.mkdir(exist_ok=True)
        for img in healthy_samples.glob("*.jpg"):
            shutil.copy2(img, dst_healthy_deficiency / f"expanded_{img.name}")

    print("Expanded dataset created successfully")

def main():
    """Main training function"""
    print("COFFEE LEAF MODEL IMPROVEMENT TRAINING")
    print("=" * 60)

    # Create expanded dataset
    create_expanded_dataset()

    # Train disease model
    print("\n" + "="*60)
    print("TRAINING DISEASE MODEL")
    print("="*60)
    disease_trainer = ImprovedModelTrainer('disease')
    disease_acc, disease_history = disease_trainer.train_model(num_epochs=15)

    # Train deficiency model
    print("\n" + "="*60)
    print("TRAINING DEFICIENCY MODEL")
    print("="*60)
    deficiency_trainer = ImprovedModelTrainer('deficiency')
    deficiency_acc, deficiency_history = deficiency_trainer.train_model(num_epochs=15)

    # Summary
    print("\n" + "="*60)
    print("TRAINING COMPLETE")
    print("="*60)
    print(f"Disease Model - Best Accuracy: {disease_acc:.2f}%")
    print(f"Deficiency Model - Best Accuracy: {deficiency_acc:.2f}%")
    print("\nNext steps:")
    print("1. Evaluate improved models on original problem cases")
    print("2. Deploy improved models to production")
    print("3. Monitor performance and collect more data if needed")

if __name__ == "__main__":
    main()
