import os
import json
from src.inference import TorchClassifier
from optimize_model import OptimizedTorchClassifier

# Test different confidence thresholds
thresholds = [0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9]

test_image = '../coffee/src/assets/image1.jpg'

print('Testing different confidence thresholds...')
print('=' * 60)

for threshold in thresholds:
    print(f'\nThreshold: {threshold}')

    # Load models with different thresholds
    disease_classifier = OptimizedTorchClassifier(
        'models/leaf_diseases/efficientnet_disease_balanced.pth',
        'models/leaf_diseases/class_mapping_diseases.json',
        confidence_threshold=threshold
    )

    deficiency_classifier = OptimizedTorchClassifier(
        'models/leaf_deficiencies/efficientnet_deficiency_balanced.pth',
        'models/leaf_deficiencies/class_mapping_deficiencies.json',
        confidence_threshold=threshold
    )

    # Test predictions
    disease_result = disease_classifier.predict(test_image)
    deficiency_result = deficiency_classifier.predict(test_image)

    print(f'  Disease: {disease_result["class"]} (conf: {disease_result["confidence"]:.4f})')
    print(f'  Deficiency: {deficiency_result["class"]} (conf: {deficiency_result["confidence"]:.4f})')
