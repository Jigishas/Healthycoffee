import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import json
import os
from pathlib import Path
import time
import gc

class LightweightTorchClassifier:
    """Memory-optimized classifier for Render free tier (512MB limit)"""
    def __init__(self, model_path, classes_path, confidence_threshold=0.3):
        self.model_path = model_path
        self.classes_path = classes_path
        self.confidence_threshold = confidence_threshold
        self.device = torch.device('cpu')  # Force CPU to save memory
        self.model = None
        self.classes = None

        # Lightweight transform
        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def load_model(self):
        """Lazy load model only when needed"""
        if self.model is None:
            with open(self.classes_path, "r", encoding="utf-8") as f:
                self.classes = json.load(f)
            num_classes = len(self.classes)

            # Use EfficientNet-B0 to match the trained weights
            self.model = models.efficientnet_b0(weights="IMAGENET1K_V1")
            # Replace the final classifier layer
            num_features = self.model.classifier[1].in_features
            self.model.classifier[1] = nn.Linear(num_features, num_classes)

            # Load trained weights with strict=False to ignore classifier differences
            state_dict = torch.load(self.model_path, map_location="cpu")
            self.model.load_state_dict(state_dict, strict=False)
            self.model.to(self.device)
            self.model.eval()

    def unload_model(self):
        """Unload model to free memory"""
        if self.model is not None:
            del self.model
            self.model = None
            gc.collect()
            torch.cuda.empty_cache() if torch.cuda.is_available() else None

    def predict(self, image_path):
        start_time = time.time()

        # Ensure model is loaded
        if self.model is None:
            self.load_model()

        # Load and preprocess image
        image = Image.open(image_path).convert("RGB")
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            outputs = self.model(input_tensor)
            probabilities = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, predicted_idx = torch.max(probabilities, dim=0)

        confidence_val = confidence.item()
        idx = str(predicted_idx.item())
        info = self.classes.get(idx, {"name": idx})

        # Apply confidence threshold
        if confidence_val < self.confidence_threshold:
            prediction_class = "Uncertain"
            description = "Model confidence too low for reliable prediction"
            recommendation = "Please try with a clearer image or consult an expert"
        else:
            prediction_class = info.get("name", idx)
            description = info.get("description", "")
            recommendation = info.get("recommendation", "")

        inference_time = time.time() - start_time

        return {
            "class": prediction_class,
            "confidence": round(confidence_val, 4),
            "description": description,
            "recommendation": recommendation,
            "inference_time": round(inference_time, 4),
            "class_index": idx
        }

    def get_feature_embedding(self, image_path):
        """Extract feature embedding from penultimate layer for similarity matching"""
        image = Image.open(image_path).convert("RGB")
        input_tensor = self.transform(image).unsqueeze(0).to(self.device)

        with torch.no_grad():
            # Get features from the layer before classifier
            features = self.model.features(input_tensor)
            features = self.model.avgpool(features)
            features = torch.flatten(features, 1)
            return features.cpu().numpy().flatten()

def benchmark_models():
    """Benchmark optimized model performance"""
    print("Benchmarking optimized model performance...")
    print("=" * 60)

    # Test images
    test_images = [
        '../coffee/src/assets/image1.jpg',
        '../coffee/src/assets/image2.jpg',
        '../coffee/src/assets/image3.jpg',
        '../coffee/src/assets/image4.jpg'
    ]

    # Load optimized models
    print("Loading optimized models...")
    optimized_disease = OptimizedTorchClassifier(
        'models/leaf_diseases/efficientnet_disease_balanced.pth',
        'models/leaf_diseases/class_mapping_diseases.json'
    )

    optimized_deficiency = OptimizedTorchClassifier(
        'models/leaf_deficiencies/efficientnet_deficiency_balanced.pth',
        'models/leaf_deficiencies/class_mapping_deficiencies.json'
    )

    results = []

    for img_path in test_images:
        if os.path.exists(img_path):
            print(f"\nTesting {os.path.basename(img_path)}:")

            # Disease prediction
            disease_result = optimized_disease.predict(img_path)
            print(f"  Disease: {disease_result['class']} ({disease_result['confidence']:.4f}) - {disease_result['inference_time']:.4f}s")

            # Deficiency prediction
            deficiency_result = optimized_deficiency.predict(img_path)
            print(f"  Deficiency: {deficiency_result['class']} ({deficiency_result['confidence']:.4f}) - {deficiency_result['inference_time']:.4f}s")

            results.append({
                'image': os.path.basename(img_path),
                'disease_time': disease_result['inference_time'],
                'deficiency_time': deficiency_result['inference_time'],
                'total_time': disease_result['inference_time'] + deficiency_result['inference_time']
            })

    # Summary
    if results:
        avg_disease_time = sum(r['disease_time'] for r in results) / len(results)
        avg_deficiency_time = sum(r['deficiency_time'] for r in results) / len(results)
        avg_total_time = sum(r['total_time'] for r in results) / len(results)

        print("\nPerformance Summary:")
        print(f"  Average disease inference time: {avg_disease_time:.4f}s")
        print(f"  Average deficiency inference time: {avg_deficiency_time:.4f}s")
        print(f"  Average total inference time: {avg_total_time:.4f}s")

    print("Optimization complete!")

if __name__ == "__main__":
    benchmark_models()
