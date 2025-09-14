import os
import torch
from torchvision import datasets, transforms

def get_leaf_dataloader(data_dir, batch_size=32, train=True):
    transform = transforms.Compose([
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    ])
    folder = 'train' if train else 'val'
    dataset_path = os.path.join(data_dir, folder)
    if not os.path.isdir(dataset_path):
        raise FileNotFoundError(f"Dataset folder not found: {dataset_path}")
    dataset = datasets.ImageFolder(
        root=dataset_path,
        transform=transform
    )
    loader = torch.utils.data.DataLoader(
        dataset,
        batch_size=batch_size,
        shuffle=train,
        num_workers=0,
        pin_memory=False 
    )
    return loader, dataset.class_to_idx