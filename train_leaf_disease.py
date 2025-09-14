import torch
import torch.nn as nn
import torch.optim as optim
from torchvision import datasets, transforms, models
import time, os

from training_utils import create_balanced_loaders, per_class_accuracy, EarlyStopping
def main():
    
    train_transform = transforms.Compose([
        transforms.RandomResizedCrop(224, scale=(0.8, 1.0)),
        transforms.RandomHorizontalFlip(),
        transforms.RandomRotation(20),
        transforms.ColorJitter(brightness=0.3, contrast=0.3, saturation=0.3),
        transforms.ToTensor()
    ])

    val_transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor()
    ])

    
    train_dir = "data/leaf_diseases/train"
    val_dir   = "data/leaf_diseases/val"

    train_dataset = datasets.ImageFolder(train_dir, transform=train_transform)
    val_dataset   = datasets.ImageFolder(val_dir, transform=val_transform)

    idx_to_class = {v: k for k, v in train_dataset.class_to_idx.items()}
    num_classes = len(idx_to_class)

    
    train_loader, val_loader = create_balanced_loaders(train_dataset, val_dataset, batch_size=32, num_workers=4)

    
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    model = models.efficientnet_b0(weights="IMAGENET1K_V1")
    model.classifier[1] = nn.Linear(model.classifier[1].in_features, num_classes)
    model = model.to(device)

    criterion = nn.CrossEntropyLoss()
    optimizer = optim.Adam(model.parameters(), lr=1e-4)

    
    epochs = 20
    best_acc = 0.0
    save_path = "models/leaf_diseases/efficientnet_disease_balanced.pth"
    os.makedirs(os.path.dirname(save_path), exist_ok=True)

    early_stopping = EarlyStopping(patience=4, min_delta=0.001)

    for epoch in range(epochs):
        start_time = time.time()
        print(f"\n===== Epoch {epoch+1}/{epochs} =====")

        
        model.train()
        running_loss = 0.0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)

            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()

            running_loss += loss.item() * images.size(0)

        epoch_loss = running_loss / len(train_loader.dataset)

        
        model.eval()
        correct, total = 0, 0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                _, preds = outputs.max(1)
                correct += (preds == labels).sum().item()
                total += labels.size(0)

        val_acc = correct / total
        print(f"Loss: {epoch_loss:.4f} | Val Acc: {val_acc:.4f} | Time: {time.time()-start_time:.1f}s")

        per_class_accuracy(model, val_loader, device, idx_to_class)

        if val_acc > best_acc:
            best_acc = val_acc
            torch.save(model.state_dict(), save_path)
            print(f"💾 New best model saved with acc {best_acc:.4f}")

        early_stopping(val_acc)
        if early_stopping.early_stop:
            print("⏹ Early stopping triggered — no improvement.")
            break

    print(f"\n✅ Training complete. Best Val Acc: {best_acc:.4f}")

if __name__ == "__main__":
    import multiprocessing
    multiprocessing.freeze_support()

    main()
