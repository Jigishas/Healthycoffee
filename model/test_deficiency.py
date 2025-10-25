from src.inference import TorchClassifier
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODEL_PATH_DEFICIENCY = BASE_DIR / 'models' / 'leaf_deficiencies' / 'efficientnet_deficiency_balanced.pth'
CLASSES_PATH_DEFICIENCY = BASE_DIR / 'models' / 'leaf_deficiencies' / 'class_mapping_deficiencies.json'

classifier = TorchClassifier(MODEL_PATH_DEFICIENCY, CLASSES_PATH_DEFICIENCY)
print("Deficiency Model loaded:", classifier.model is not None)
print("Classes:", len(classifier.classes))
