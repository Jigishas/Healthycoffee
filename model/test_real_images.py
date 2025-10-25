import os
import json
from pathlib import Path
from PIL import Image
from src.inference import TorchClassifier

# Load models
disease_classifier = TorchClassifier('models/leaf_diseases/efficientnet_disease_balanced.pth', 'models/leaf_diseases/class_mapping_diseases.json')
deficiency_classifier = TorchClassifier('models/leaf_deficiencies/efficientnet_deficiency_balanced.pth', 'models/leaf_deficiencies/class_mapping_deficiencies.json')

# Test with actual coffee leaf images from assets
image_paths = [
    '../coffee/src/assets/image1.jpg',
    '../coffee/src/assets/image2.jpg',
    '../coffee/src/assets/image3.jpg',
    '../coffee/src/assets/image4.jpg',
    '../coffee/src/assets/image5.jpg',
    '../coffee/src/assets/image6.jpg',
    '../coffee/src/assets/image7.jpg',
    '../coffee/src/assets/image8.jpg'
]

print('Testing models with actual coffee leaf images:')
print('=' * 60)

for i, img_path in enumerate(image_paths, 1):
    if os.path.exists(img_path):
        print(f'\n--- Image {i}: {os.path.basename(img_path)} ---')

        try:
            # Disease prediction
            disease_result = disease_classifier.predict(img_path)
            print(f'Disease: {disease_result["class"]} (confidence: {disease_result["confidence"]:.4f})')

            # Deficiency prediction
            deficiency_result = deficiency_classifier.predict(img_path)
            print(f'Deficiency: {deficiency_result["class"]} (confidence: {deficiency_result["confidence"]:.4f})')

        except Exception as e:
            print(f'Error processing {img_path}: {e}')
    else:
        print(f'Image not found: {img_path}')

print('\n' + '=' * 60)
print('Model testing complete')
