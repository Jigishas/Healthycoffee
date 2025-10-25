from src.inference import TorchClassifier
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH_DISEASE = BASE_DIR / 'models' / 'leaf_diseases' / 'efficientnet_disease_balanced.pth'
CLASSES_PATH_DISEASE = BASE_DIR / 'models' / 'leaf_diseases' / 'class_mapping_diseases.json'

classifier = TorchClassifier(MODEL_PATH_DISEASE, CLASSES_PATH_DISEASE)
print("Disease Model loaded:", classifier.model is not None)
print("Classes:", len(classifier.classes))
