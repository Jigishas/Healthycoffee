import torch
from torchvision import models, transforms
from PIL import Image
import json
import numpy as np
from pathlib import Path
from collections import deque
from sklearn.metrics.pairwise import cosine_similarity
import logging

logger = logging.getLogger(__name__)

VAL_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    # Use ImageNet normalization - models were trained/initialized on ImageNet
    transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
])

class TorchClassifier:
    def __init__(self, model_path, classes_path):
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self.model, self.classes = self.load_model_and_mapping(model_path, classes_path)
        self.model.to(self.device)
        self.model.eval()

    def load_model_and_mapping(self, weights_path, mapping_path):
        with open(mapping_path, "r", encoding="utf-8") as f:
            mapping = json.load(f)
        num_classes = len(mapping)
        model = models.efficientnet_b0(weights="IMAGENET1K_V1")
        model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, num_classes)
        # Load state dict and handle common DataParallel 'module.' prefixes
        state_dict = torch.load(weights_path, map_location="cpu")
        # If the checkpoint contains a 'state_dict' key (common in some saves), use it
        if isinstance(state_dict, dict) and 'state_dict' in state_dict:
            state_dict = state_dict['state_dict']

        # Strip 'module.' prefix if present
        new_state = {}
        for k, v in state_dict.items():
            new_key = k
            if k.startswith('module.'):
                new_key = k[len('module.'):]
            new_state[new_key] = v

        try:
            model.load_state_dict(new_state)
        except Exception:
            # fallback: attempt non-strict load to allow minor mismatches
            model.load_state_dict(new_state, strict=False)

        model.eval()
        return model, mapping

    def predict(self, image_path):
        image = Image.open(image_path).convert("RGB")
        input_tensor = VAL_TRANSFORM(image).unsqueeze(0).to(self.device)
        with torch.no_grad():
            outputs = self.model(input_tensor)
            probs = torch.nn.functional.softmax(outputs[0], dim=0)
            confidence, predicted_idx = torch.max(probs, dim=0)
        idx = str(predicted_idx.item())
        info = self.classes.get(idx, {"name": idx})
        return {
            "class": info.get("name", idx),
            "class_index": int(predicted_idx.item()),
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
        "class_index": int(predicted_idx.item()),
        "class": info.get("name", idx),
        "confidence": round(confidence.item(), 4),
        "description": info.get("description", ""),
        "recommendation": info.get("recommendation", "")
    }

class InteractiveMemory:
    """Stores high-confidence predictions in memory for reference"""
    def __init__(self, max_size=1000):
        self.memory = deque(maxlen=max_size)
        self.confidence_threshold = 0.85

    def add_interaction(self, image_embedding, prediction, confidence, true_label=None):
        if confidence > self.confidence_threshold:
            self.memory.append({
                'embedding': image_embedding,  # From EfficientNet's penultimate layer
                'prediction': prediction,
                'confidence': confidence,
                'true_label': true_label if true_label else prediction
            })

    def find_similar(self, current_embedding, threshold=0.7):
        """Find similar past cases using cosine similarity"""
        similarities = []
        for memory_item in self.memory:
            sim = cosine_similarity(current_embedding.reshape(1, -1),
                                  memory_item['embedding'].reshape(1, -1))[0][0]
            if sim > threshold:
                similarities.append((sim, memory_item))

        return sorted(similarities, reverse=True)[:5]  # Top 5 most similar


class AdaptiveClassifier:
    """Uses feature embeddings to find similar past cases and boost confidence"""
    def __init__(self, base_model):
        self.base_model = base_model
        self.feature_memory = {}  # disease_class -> list of feature vectors
        self.confidence_boost = 0.1  # Boost for familiar patterns

    def predict_with_memory(self, image_path):
        # Get base prediction
        base_result = self.base_model.predict(image_path)

        # Get feature embedding (second-to-last layer)
        feature_vector = self.get_feature_embedding(image_path)

        # Check against memory for similar cases
        memory_confidence_boost = self.check_feature_similarity(feature_vector)

        # Adjust confidence based on memory matches
        adjusted_confidence = min(base_result.get('confidence', 0.5) + memory_confidence_boost, 1.0)

        return {
            'class': base_result.get('class', base_result.get('prediction', 'unknown')),
            'confidence': adjusted_confidence,
            'base_confidence': base_result.get('confidence', adjusted_confidence),
            'memory_boost': memory_confidence_boost,
            'similar_cases': self.get_similar_cases(feature_vector),
            'class_index': base_result.get('class_index', 0),
            'description': base_result.get('description', ''),
            'recommendation': base_result.get('recommendation', '')
        }

    def get_feature_embedding(self, image_path):
        """Extract feature embedding from penultimate layer"""
        image = Image.open(image_path).convert("RGB")
        input_tensor = VAL_TRANSFORM(image).unsqueeze(0).to(self.base_model.device)

        with torch.no_grad():
            # Get features from the layer before classifier
            features = self.base_model.model.features(input_tensor)
            features = self.base_model.model.avgpool(features)
            features = torch.flatten(features, 1)
            return features.cpu().numpy().flatten()

    def check_feature_similarity(self, feature_vector):
        """Check if current features match stored patterns"""
        boost = 0.0
        for class_name, stored_features in self.feature_memory.items():
            for stored_feature in stored_features:
                sim = cosine_similarity(feature_vector.reshape(1, -1),
                                      stored_feature.reshape(1, -1))[0][0]
                if sim > 0.8:  # High similarity threshold
                    boost += self.confidence_boost
                    break  # Only boost once per class
        return boost

    def get_similar_cases(self, feature_vector):
        """Get count of similar cases in memory"""
        count = 0
        for stored_features in self.feature_memory.values():
            for stored_feature in stored_features:
                sim = cosine_similarity(feature_vector.reshape(1, -1),
                                      stored_feature.reshape(1, -1))[0][0]
                if sim > 0.7:
                    count += 1
        return count

    def update_memory(self, image_path, confirmed_diagnosis):
        """Update memory with confirmed cases"""
        feature_vector = self.get_feature_embedding(image_path)

        if confirmed_diagnosis not in self.feature_memory:
            self.feature_memory[confirmed_diagnosis] = []

        self.feature_memory[confirmed_diagnosis].append(feature_vector)

        # Keep only recent examples to prevent memory bloat
        if len(self.feature_memory[confirmed_diagnosis]) > 100:
            self.feature_memory[confirmed_diagnosis].pop(0)


class ConfidenceCalibrator:
    """Dynamically adjusts confidence estimates based on recent performance"""
    def __init__(self):
        self.prediction_history = deque(maxlen=500)
        self.calibration_map = {}  # class -> confidence calibration factor

    def record_prediction(self, prediction, was_correct):
        self.prediction_history.append({
            'predicted_class': prediction['class'],
            'confidence': prediction['confidence'],
            'correct': was_correct
        })
        self.update_calibration()

    def update_calibration(self):
        """Analyze recent performance per class"""
        class_stats = {}
        for item in self.prediction_history:
            cls = item['predicted_class']
            if cls not in class_stats:
                class_stats[cls] = {'total': 0, 'correct': 0}

            class_stats[cls]['total'] += 1
            if item['correct']:
                class_stats[cls]['correct'] += 1

        # Update calibration factors
        for cls, stats in class_stats.items():
            if stats['total'] > 10:  # Minimum samples
                actual_accuracy = stats['correct'] / stats['total']
                # Simple calibration: adjust confidence toward actual accuracy
                self.calibration_map[cls] = actual_accuracy

    def apply_calibration(self, prediction):
        class_key = prediction.get('class', prediction.get('prediction', ''))
        if class_key in self.calibration_map:
            calibrated_conf = (prediction.get('confidence', 0.5) + self.calibration_map[class_key]) / 2
            return calibrated_conf
        return prediction.get('confidence', 0.5)


class InteractiveCoffeeDiagnosis:
    """Main wrapper combining all interactive learning mechanisms"""
    def __init__(self, disease_model_path, disease_classes_path,
                 deficiency_model_path, deficiency_classes_path):
        self.disease_classifier = AdaptiveClassifier(
            TorchClassifier(disease_model_path, disease_classes_path)
        )
        self.deficiency_classifier = AdaptiveClassifier(
            TorchClassifier(deficiency_model_path, deficiency_classes_path)
        )

        self.disease_memory = InteractiveMemory()
        self.deficiency_memory = InteractiveMemory()

        self.disease_calibrator = ConfidenceCalibrator()
        self.deficiency_calibrator = ConfidenceCalibrator()

        self.last_disease_prediction = None
        self.last_deficiency_prediction = None

    def diagnose(self, image_path):
        """Enhanced diagnosis with interactive learning"""
        # Get predictions with memory
        disease_result = self.disease_classifier.predict_with_memory(image_path)
        deficiency_result = self.deficiency_classifier.predict_with_memory(image_path)

        # Get feature embeddings for memory lookup
        disease_features = self.disease_classifier.get_feature_embedding(image_path)
        deficiency_features = self.deficiency_classifier.get_feature_embedding(image_path)

        # Check interactive memory for similar cases
        disease_similar = self.disease_memory.find_similar(disease_features)
        deficiency_similar = self.deficiency_memory.find_similar(deficiency_features)

        # Apply confidence calibration
        disease_result['confidence'] = self.disease_calibrator.apply_calibration(disease_result)
        deficiency_result['confidence'] = self.deficiency_calibrator.apply_calibration(deficiency_result)

        # Store last predictions for feedback
        self.last_disease_prediction = disease_result
        self.last_deficiency_prediction = deficiency_result

        # Prepare enhanced response
        response = {
            'disease_prediction': {
                **disease_result,
                'similar_previous_cases': len(disease_similar),
                'certainty_level': self.get_certainty_level(disease_result['confidence'])
            },
            'deficiency_prediction': {
                **deficiency_result,
                'similar_previous_cases': len(deficiency_similar),
                'certainty_level': self.get_certainty_level(deficiency_result['confidence'])
            },
            'learning_stats': {
                'disease_memory_size': len(self.disease_memory.memory),
                'deficiency_memory_size': len(self.deficiency_memory.memory),
                'disease_calibration_classes': len(self.disease_calibrator.calibration_map),
                'deficiency_calibration_classes': len(self.deficiency_calibrator.calibration_map)
            },
            'status': 'success'
        }

        return response

    def provide_feedback(self, image_path, disease_feedback=None, deficiency_feedback=None):
        """User provides feedback on the diagnosis"""
        disease_features = self.disease_classifier.get_feature_embedding(image_path)
        deficiency_features = self.deficiency_classifier.get_feature_embedding(image_path)

        feedback_applied = {'disease': False, 'deficiency': False}

        # Update disease memory and calibration
        if disease_feedback and self.last_disease_prediction:
            true_label = disease_feedback
            self.disease_memory.add_interaction(
                disease_features,
                self.last_disease_prediction['class'],
                self.last_disease_prediction['confidence'],
                true_label
            )
            self.disease_classifier.update_memory(image_path, true_label)

            # Record calibration data
            was_correct = (self.last_disease_prediction['class'] == true_label)
            self.disease_calibrator.record_prediction(self.last_disease_prediction, was_correct)
            feedback_applied['disease'] = True

        # Update deficiency memory and calibration
        if deficiency_feedback and self.last_deficiency_prediction:
            true_label = deficiency_feedback
            self.deficiency_memory.add_interaction(
                deficiency_features,
                self.last_deficiency_prediction['class'],
                self.last_deficiency_prediction['confidence'],
                true_label
            )
            self.deficiency_classifier.update_memory(image_path, true_label)

            # Record calibration data
            was_correct = (self.last_deficiency_prediction['class'] == true_label)
            self.deficiency_calibrator.record_prediction(self.last_deficiency_prediction, was_correct)
            feedback_applied['deficiency'] = True

        return {
            "status": "feedback_incorporated",
            "disease_memory_size": len(self.disease_memory.memory),
            "deficiency_memory_size": len(self.deficiency_memory.memory),
            "feedback_applied": feedback_applied
        }

    def get_certainty_level(self, confidence):
        """Convert confidence to human-readable certainty level"""
        if confidence >= 0.9:
            return "Very High"
        elif confidence >= 0.8:
            return "High"
        elif confidence >= 0.7:
            return "Moderate"
        elif confidence >= 0.6:
            return "Low"
        else:
            return "Very Low"


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
