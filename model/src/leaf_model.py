import torch
from torchvision import models
import os

class LeafDiagnosisModel:
    def __init__(self, model_path='models/leaf_diagnosis/efficientnet_v1.pth', device='cpu'):
        self.device = device
        self.model = models.efficientnet_b0(weights=None)
        num_classes = 15  # Sum of all classes in classes.yaml
        self.model.classifier[1] = torch.nn.Linear(self.model.classifier[1].in_features, num_classes)
        self.model.load_state_dict(torch.load(model_path, map_location=device))
        self.model.eval()
        self.model.to(device)

    def predict(self, img_tensor):
        with torch.no_grad():
            img_tensor = img_tensor.unsqueeze(0).to(self.device)
            outputs = self.model(img_tensor)
            probs = torch.softmax(outputs, dim=1)[0]
            conf, pred_idx = torch.max(probs, dim=0)
            return int(pred_idx), float(conf)

    def get_class_name(self, idx, classes):
        flat_classes = []
        for v in classes.values():
            flat_classes.extend(v)
        return flat_classes[idx]