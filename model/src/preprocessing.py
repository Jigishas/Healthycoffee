import torch
from PIL import Image
import numpy as np

def preprocess_image(img_path):
    """Fast PIL-based preprocessing for speed optimization"""
    # Load image with PIL
    image = Image.open(img_path).convert("RGB")

    # Resize to 256, then center crop to 224
    width, height = image.size
    if width > height:
        new_width = int(256 * width / height)
        new_height = 256
    else:
        new_width = 256
        new_height = int(256 * height / width)
    image = image.resize((new_width, new_height), Image.BILINEAR)

    # Center crop
    left = (new_width - 224) // 2
    top = (new_height - 224) // 2
    right = left + 224
    bottom = top + 224
    image = image.crop((left, top, right, bottom))

    # Convert to tensor and normalize
    img_array = np.array(image).astype(np.float32) / 255.0
    img_array = (img_array - [0.485, 0.456, 0.406]) / [0.229, 0.224, 0.225]
    img_tensor = torch.from_numpy(img_array).permute(2, 0, 1).float()
    return img_tensor.unsqueeze(0)
