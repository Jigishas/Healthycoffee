#!/usr/bin/env python3
"""
Test script for Leaf Rust detection accuracy

This script tests the backend's ability to accurately detect coffee leaf rust.
It can be run against the local API or production backend.
"""

import requests
import os
import sys
import json
from pathlib import Path
from PIL import Image
import io
import base64
import time

# Configuration
LOCAL_URL = "http://localhost:8000"
PRODUCTION_URL = "https://healthycoffee.onrender.com"

TEST_IMAGE_DIR = "test_dataset/diseases"

def test_leaf_rust_detection(base_url, image_path=None):
    """
    Test leaf rust detection on a single image or create a test image
    
    Args:
        base_url: API base URL
        image_path: Path to test image (optional)
    """
    print(f"\n{'='*60}")
    print(f"Testing Leaf Rust Detection")
    print(f"Backend URL: {base_url}")
    print(f"{'='*60}\n")
    
    # First check health endpoint
    print("1. Checking backend health...")
    try:
        response = requests.get(f"{base_url}/health", timeout=10)
        if response.status_code == 200:
            health_data = response.json()
            print(f"   ✓ Backend is healthy")
            print(f"   - Disease model loaded: {health_data.get('models_loaded', {}).get('disease_model', False)}")
            print(f"   - Deficiency model loaded: {health_data.get('models_loaded', {}).get('deficiency_model', False)}")
        else:
            print(f"   ✗ Health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"   ✗ Cannot connect to backend: {e}")
        return False
    
    # Get model info
    print("\n2. Getting model information...")
    try:
        response = requests.get(f"{base_url}/api/model-info", timeout=10)
        if response.status_code == 200:
            model_info = response.json()
            print(f"   ✓ Model version: {model_info.get('model_version', 'Unknown')}")
            print(f"   - Disease classes: {model_info.get('disease_classes', 'N/A')}")
            print(f"   - Deficiency classes: {model_info.get('deficiency_classes', 'N/A')}")
    except Exception as e:
        print(f"   ✗ Failed to get model info: {e}")
    
    # Test with available image or create synthetic test
    print("\n3. Testing image analysis...")
    
    # Try to find a test image
    test_paths = [
        "test_dataset/diseases/healthy/test_image.jpg",
        "test_dataset/diseases/leaf_rust/test_image.jpg",
        "uploads/test_image.jpg"
    ]
    
    test_image = None
    for path in test_paths:
        if os.path.exists(path):
            test_image = path
            break
    
    try:
        if not test_image:
            print("   ! No test image found. Creating synthetic test image...")
            # Create a simple test image
            img = Image.new('RGB', (224, 224), color='orange')  # Orange to simulate rust
            img_byte_arr = io.BytesIO()
            img.save(img_byte_arr, format='JPEG')
            img_byte_arr.seek(0)
            files = {'image': ('test_rust.jpg', img_byte_arr, 'image/jpeg')}
        else:
            print(f"   Using test image: {test_image}")
            # Read file content into memory to avoid "closed file" error
            with open(test_image, 'rb') as f:
                file_content = f.read()
            files = {'image': ('test_image.jpg', io.BytesIO(file_content), 'image/jpeg')}
        
        start_time = time.time()
        response = requests.post(
            f"{base_url}/api/v1/upload-image",
            files=files,
            timeout=30
        )

        processing_time = time.time() - start_time
        
        if response.status_code == 200:
            result = response.json()
            print(f"   ✓ Analysis completed in {processing_time:.2f}s")
            
            # Check disease prediction
            disease_pred = result.get('disease_prediction', {})
            print(f"\n   Disease Prediction Results:")
            print(f"   - Class: {disease_pred.get('class', 'N/A')}")
            print(f"   - Confidence: {disease_pred.get('confidence', 0):.2%}")
            print(f"   - Class Index: {disease_pred.get('class_index', 'N/A')}")
            print(f"   - Inference Time: {disease_pred.get('inference_time', 'N/A')}s")
            
            if disease_pred.get('explanation'):
                print(f"   - Explanation: {disease_pred.get('explanation')[:100]}...")
            
            # Check if it's leaf rust
            predicted_class = disease_pred.get('class', '').lower()
            if 'rust' in predicted_class:
                print(f"\n   ✓✓✓ LEAF RUST DETECTED! ✓✓✓")
                print(f"   Confidence: {disease_pred.get('confidence', 0):.2%}")
            elif 'healthy' in predicted_class:
                print(f"\n   ℹ Image classified as Healthy")
            else:
                print(f"\n   ℹ Detected: {disease_pred.get('class')}")
            
            # Check deficiency prediction
            deficiency_pred = result.get('deficiency_prediction', {})
            print(f"\n   Nutrient Deficiency Results:")
            print(f"   - Class: {deficiency_pred.get('class', 'N/A')}")
            print(f"   - Confidence: {deficiency_pred.get('confidence', 0):.2%}")
            
            # Check recommendations
            if result.get('disease_recommendations'):
                print(f"\n   ✓ Disease recommendations available")
            if result.get('deficiency_recommendations'):
                print(f"   ✓ Deficiency recommendations available")
            
            return True
            
        else:
            print(f"   ✗ Analysis failed: {response.status_code}")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"   Response: {response.text[:200]}")
            return False
            
    except Exception as e:
        print(f"   ✗ Request failed: {e}")
        return False

def test_multiple_images(base_url):
    """
    Test with multiple images if available
    """
    print(f"\n{'='*60}")
    print(f"Batch Testing - Multiple Images")
    print(f"{'='*60}\n")
    
    test_dirs = [
        "test_dataset/diseases/leaf_rust",
        "test_dataset/diseases/cerscospora",
        "test_dataset/diseases/phoma",
        "test_dataset/diseases/healthy"
    ]
    
    results = []
    
    for test_dir in test_dirs:
        if not os.path.exists(test_dir):
            continue
            
        print(f"\nTesting directory: {test_dir}")
        
        # Find all images in directory
        image_files = []
        for ext in ['*.jpg', '*.jpeg', '*.png']:
            image_files.extend(Path(test_dir).glob(ext))
        
        if not image_files:
            print(f"   No images found in {test_dir}")
            continue
        
        for img_path in image_files[:3]:  # Test first 3 images per category
            print(f"\n   Testing: {img_path.name}")
            
            try:
                with open(img_path, 'rb') as f:
                    files = {'image': (img_path.name, f, 'image/jpeg')}
                    response = requests.post(
                        f"{base_url}/api/v1/upload-image",
                        files=files,
                        timeout=30
                    )
                
                if response.status_code == 200:
                    result = response.json()
                    disease_class = result.get('disease_prediction', {}).get('class', 'Unknown')
                    confidence = result.get('disease_prediction', {}).get('confidence', 0)
                    
                    print(f"   - Predicted: {disease_class} ({confidence:.2%})")
                    results.append({
                        'file': str(img_path),
                        'predicted': disease_class,
                        'confidence': confidence,
                        'expected': test_dir.split('/')[-1]
                    })
                else:
                    print(f"   - Failed: {response.status_code}")
                    
            except Exception as e:
                print(f"   - Error: {e}")
    
    # Print summary
    if results:
        print(f"\n{'='*60}")
        print(f"Test Summary")
        print(f"{'='*60}")
        
        correct = sum(1 for r in results 
                     if r['expected'].lower() in r['predicted'].lower() 
                     or r['predicted'].lower() in r['expected'].lower())
        
        print(f"Total tests: {len(results)}")
        print(f"Correct predictions: {correct}")
        print(f"Accuracy: {correct/len(results)*100:.1f}%")
        
        # Show detailed results
        print(f"\nDetailed Results:")
        for r in results:
            match = "✓" if r['expected'].lower() in r['predicted'].lower() else "✗"
            print(f"  {match} {r['file']}")
            print(f"     Expected: {r['expected']}, Got: {r['predicted']} ({r['confidence']:.2%})")

def main():
    """
    Main function to run leaf rust tests
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Test Leaf Rust Detection Backend')
    parser.add_argument('--local', action='store_true', help='Test local backend')
    parser.add_argument('--production', action='store_true', help='Test production backend')
    parser.add_argument('--batch', action='store_true', help='Run batch tests on multiple images')
    parser.add_argument('--image', type=str, help='Path to specific test image')
    
    args = parser.parse_args()
    
    # Determine which backend to test
    if args.production:
        base_url = PRODUCTION_URL
    else:
        base_url = LOCAL_URL
    
    print(f"\n{'#'*60}")
    print(f"# Coffee Leaf Rust Detection Test")
    print(f"# Target: {base_url}")
    print(f"{'#'*60}")
    
    # Run tests
    if args.batch:
        test_multiple_images(base_url)
    else:
        success = test_leaf_rust_detection(base_url, args.image)
        
        if success:
            print(f"\n{'='*60}")
            print(f"✓ Leaf Rust Detection Test PASSED")
            print(f"{'='*60}")
        else:
            print(f"\n{'='*60}")
            print(f"✗ Leaf Rust Detection Test FAILED")
            print(f"{'='*60}")
            sys.exit(1)

if __name__ == "__main__":
    main()
