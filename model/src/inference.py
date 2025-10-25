import torch
from torchvision import models, transforms
from PIL import Image
import json
from pathlib import Path

VAL_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

class TorchClassifier:
    def __init__(self, model_path, classes_path):
        self.model, self.classes = self.load_model_and_mapping(model_path, classes_path)

    def load_model_and_mapping(self, weights_path, mapping_path):
        with open(mapping_path, "r", encoding="utf-8") as f:
            mapping = json.load(f)
        num_classes = len(mapping)
        model = models.efficientnet_b0(weights="IMAGENET1K_V1")
        model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, num_classes)
        state_dict = torch.load(weights_path, map_location="cpu")
        model.load_state_dict(state_dict)
        model.eval()
        return model, mapping

    def predict(self, image_path):
        image = Image.open(image_path).convert("RGB")
        input_tensor = VAL_TRANSFORM(image).unsqueeze(0)
        with torch.no_grad():
            outputs = self.model(input_tensor)
            probs = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, predicted_idx = torch.max(probs, dim=0)
        idx = str(predicted_idx.item())
        info = self.classes.get(idx, {"name": idx})
        return {
            "class": info.get("name", idx),
            "confidence": round(confidence.item(), 4),
            "description": info.get("description", ""),
            "recommendation": info.get("recommendation", "")
        }

def load_model_and_mapping(weights_path, mapping_path):
    with open(mapping_path, "r", encoding="utf-8") as f:
        mapping = json.load(f)
    num_classes = len(mapping)
    model = models.efficientnet_b0(weights="IMAGENET1K_V1")
    model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, num_classes)
    state_dict = torch.load(weights_path, map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()
    return model, mapping

def run_inference(model, mapping, image_path, model_name=""):
    image = Image.open(image_path).convert("RGB")
    input_tensor = VAL_TRANSFORM(image).unsqueeze(0)
    with torch.no_grad():
        outputs = model(input_tensor)
        probs = torch.nn.functional.softmax(outputs[0], dim=0)
        confidence, predicted_idx = torch.max(probs, dim=0)
    idx = str(predicted_idx.item())
    info = mapping.get(idx, {"name": idx})
    return {
        "model": model_name,
        "class": info.get("name", idx),
        "confidence": round(confidence.item(), 4),
        "description": info.get("description", ""),
        "recommendation": info.get("recommendation", "")
    }

if __name__ == "__main__":
    image_path = Path(r"C:\Projects\Healthy coffee\model\test_leaf.jpg")
    disease_model, disease_map = load_model_and_mapping(
        r"C:\Projects\Healthy coffee\model\models\leaf_diseases\efficientnet_disease_balanced.pth",
        r"C:\Projects\Healthy coffee\model\models\leaf_diseases\class_mapping_diseases.json"
    )
    deficiency_model, deficiency_map = load_model_and_mapping(
        r"C:\Projects\Healthy coffee\model\models\leaf_deficiencies\efficientnet_deficiency_balanced.pth",
        r"C:\Projects\Healthy coffee\model\models\leaf_deficiencies\class_mapping_deficiencies.json"
    )
    disease_result = run_inference(disease_model, disease_map, image_path, "Disease")
    deficiency_result = run_inference(deficiency_model, deficiency_map, image_path, "Deficiency")
    print("\n=== LEAF HEALTH ANALYSIS ===")
    for result in [disease_result, deficiency_result]:
        print(f"\n--- {result['model']} Model ---")
        print(f"Prediction: {result['class']} ({result['confidence']:.2f})")
        if result['description']:
            print(f"Description: {result['description']}")
        if result['recommendation']:
            print(f"Recommendation: {result['recommendation']}")
