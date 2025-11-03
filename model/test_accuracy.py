import os
import json
from pathlib import Path
from src.inference import TorchClassifier
from optimize_model import OptimizedTorchClassifier

# Test with available images from coffee assets
test_images = [
    '../coffee/src/assets/image1.jpg',
    '../coffee/src/assets/image2.jpg',
    '../coffee/src/assets/image3.jpg',
    '../coffee/src/assets/image4.jpg',
    '../coffee/src/assets/image5.jpg',
    '../coffee/src/assets/image6.jpg',
    '../coffee/src/assets/image7.jpg',
    '../coffee/src/assets/image8.jpg'
]

print('Testing model predictions on available images...')
print('=' * 60)

# Load models
disease_classifier = OptimizedTorchClassifier(
    'models/leaf_diseases/efficientnet_disease_balanced.pth',
    'models/leaf_diseases/class_mapping_diseases.json',
    confidence_threshold=0.3
)

deficiency_classifier = OptimizedTorchClassifier(
    'models/leaf_deficiencies/efficientnet_deficiency_balanced.pth',
    'models/leaf_deficiencies/class_mapping_deficiencies.json',
    confidence_threshold=0.3
)

results = []
for img_path in test_images:
    if os.path.exists(img_path):
        print(f'\nTesting {os.path.basename(img_path)}:')

        # Disease prediction
        disease_result = disease_classifier.predict(img_path)
        print(f'  Disease: {disease_result["class"]} (conf: {disease_result["confidence"]:.4f})')

        # Deficiency prediction
        deficiency_result = deficiency_classifier.predict(img_path)
        print(f'  Deficiency: {deficiency_result["class"]} (conf: {deficiency_result["confidence"]:.4f})')

        results.append({
            'image': os.path.basename(img_path),
            'disease': disease_result,
            'deficiency': deficiency_result
        })

print('\nSummary:')
print(f'Tested {len(results)} images')
uncertain_disease = sum(1 for r in results if r['disease']['class'] == 'Uncertain')
uncertain_deficiency = sum(1 for r in results if r['deficiency']['class'] == 'Uncertain')
print(f'Disease model uncertain predictions: {uncertain_disease}/{len(results)}')
print(f'Deficiency model uncertain predictions: {uncertain_deficiency}/{len(results)}')
