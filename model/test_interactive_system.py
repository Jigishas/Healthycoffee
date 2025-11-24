#!/usr/bin/env python3
"""
Test script for the Interactive Learning System

This script tests the interactive learning capabilities by:
1. Running baseline predictions vs interactive predictions
2. Testing feedback incorporation
3. Validating memory updates and learning improvements
4. Comparing accuracy and confidence levels
"""

import os
import sys
import json
import time
import requests
import numpy as np
from pathlib import Path
from PIL import Image
import matplotlib.pyplot as plt

# Add src to path for imports
sys.path.append(str(Path(__file__).parent / 'src'))

from inference import InteractiveCoffeeDiagnosis, TorchClassifier
from optimize_model import OptimizedTorchClassifier

class InteractiveSystemTester:
    def __init__(self, flask_url='http://localhost:8000'):
        self.flask_url = flask_url
        self.test_images = self._find_test_images()
        self.baseline_results = {}
        self.interactive_results = {}

    def _find_test_images(self):
        """Find available test images"""
        test_images = []

        # Check coffee assets
        coffee_assets = Path('../coffee/src/assets')
        if coffee_assets.exists():
            for img_file in coffee_assets.glob('*.jpg'):
                test_images.append(img_file)
            for img_file in coffee_assets.glob('*.jpeg'):
                test_images.append(img_file)
            for img_file in coffee_assets.glob('*.png'):
                test_images.append(img_file)

        # Check model test dataset
        test_dataset = Path('test_dataset')
        if test_dataset.exists():
            for subdir in test_dataset.glob('*/*'):
                if subdir.is_dir():
                    for img_file in subdir.glob('*.jpg'):
                        test_images.append(img_file)
                    for img_file in subdir.glob('*.jpeg'):
                        test_images.append(img_file)
                    for img_file in subdir.glob('*.png'):
                        test_images.append(img_file)

        return test_images[:10]  # Limit to 10 images for testing

    def test_baseline_vs_interactive(self):
        """Compare baseline predictions with interactive predictions"""
        print("🧪 Testing Interactive Learning System")
        print("=" * 60)

        if not self.test_images:
            print("❌ No test images found!")
            return

        print(f"📸 Found {len(self.test_images)} test images")

        # Initialize baseline classifiers
        baseline_disease = OptimizedTorchClassifier(
            'models/leaf_diseases/efficientnet_disease_balanced.pth',
            'models/leaf_diseases/class_mapping_diseases.json'
        )
        baseline_deficiency = OptimizedTorchClassifier(
            'models/leaf_deficiencies/efficientnet_deficiency_balanced.pth',
            'models/leaf_deficiencies/class_mapping_deficiencies.json'
        )

        print("\n🔬 Running baseline predictions...")
        baseline_results = []
        interactive_results = []

        for i, img_path in enumerate(self.test_images):
            print(f"  Testing image {i+1}/{len(self.test_images)}: {img_path.name}")

            # Baseline predictions
            try:
                baseline_disease_pred = baseline_disease.predict(str(img_path))
                baseline_deficiency_pred = baseline_deficiency.predict(str(img_path))

                baseline_result = {
                    'image': img_path.name,
                    'disease': baseline_disease_pred,
                    'deficiency': baseline_deficiency_pred,
                    'avg_confidence': (baseline_disease_pred['confidence'] + baseline_deficiency_pred['confidence']) / 2
                }
                baseline_results.append(baseline_result)

            except Exception as e:
                print(f"    ❌ Baseline prediction failed: {e}")
                continue

            # Interactive predictions via API
            try:
                with open(img_path, 'rb') as f:
                    files = {'image': f}
                    response = requests.post(f"{self.flask_url}/api/interactive-diagnose", files=files, timeout=30)

                if response.status_code == 200:
                    interactive_result = response.json()
                    interactive_result['image'] = img_path.name
                    interactive_results.append(interactive_result)
                    print(f"    ✅ Interactive prediction successful")
                else:
                    print(f"    ❌ Interactive API failed: {response.status_code}")

            except Exception as e:
                print(f"    ❌ Interactive prediction failed: {e}")

        # Analyze results
        self._analyze_results(baseline_results, interactive_results)

        return baseline_results, interactive_results

    def _analyze_results(self, baseline_results, interactive_results):
        """Analyze and compare baseline vs interactive results"""
        print("\n📊 Analysis Results")
        print("=" * 60)

        if not baseline_results or not interactive_results:
            print("❌ Insufficient results for analysis")
            return

        # Calculate averages
        baseline_avg_conf = np.mean([r['avg_confidence'] for r in baseline_results])
        interactive_avg_conf = np.mean([r['disease_prediction']['confidence'] for r in interactive_results] +
                                      [r['deficiency_prediction']['confidence'] for r in interactive_results]) / 2

        print(f"📊 Baseline Average Confidence: {baseline_avg_conf:.4f}")
        print(f"🤖 Interactive Average Confidence: {interactive_avg_conf:.4f}")
        # Memory and learning stats
        if interactive_results:
            latest_stats = interactive_results[-1]['learning_stats']
            print("\n🧠 Learning Statistics:")
            print(f"  Disease Memory Size: {latest_stats['disease_memory_size']}")
            print(f"  Deficiency Memory Size: {latest_stats['deficiency_memory_size']}")
            print(f"  Disease Calibration Classes: {latest_stats['disease_calibration_classes']}")
            print(f"  Deficiency Calibration Classes: {latest_stats['deficiency_calibration_classes']}")

        # Confidence improvements
        confidence_improvements = []
        for baseline, interactive in zip(baseline_results, interactive_results):
            baseline_conf = baseline['avg_confidence']
            interactive_conf = (interactive['disease_prediction']['confidence'] +
                              interactive['deficiency_prediction']['confidence']) / 2
            improvement = interactive_conf - baseline_conf
            confidence_improvements.append(improvement)

        if confidence_improvements:
            avg_improvement = np.mean(confidence_improvements)
            print("\n📈 Confidence Analysis:")
            print(f"  Average Improvement: {avg_improvement:.4f}")
            print(f"  Max Improvement: {max(confidence_improvements):.4f}")
            print(f"  Min Improvement: {min(confidence_improvements):.4f}")

    def test_feedback_loop(self):
        """Test the feedback incorporation mechanism"""
        print("\n🔄 Testing Feedback Loop")
        print("=" * 60)

        if not self.test_images:
            print("❌ No test images for feedback testing")
            return

        # Get initial prediction
        test_image = self.test_images[0]
        print(f"Testing feedback with: {test_image.name}")

        try:
            with open(test_image, 'rb') as f:
                files = {'image': f}
                response = requests.post(f"{self.flask_url}/api/interactive-diagnose", files=files, timeout=30)

            if response.status_code != 200:
                print("❌ Initial prediction failed")
                return

            initial_result = response.json()
            print("✅ Initial prediction successful")

            # Get learning stats before feedback
            stats_response = requests.get(f"{self.flask_url}/api/learning-stats")
            if stats_response.status_code == 200:
                initial_stats = stats_response.json()['learning_statistics']
                print(f"📊 Initial memory sizes - Disease: {initial_stats['disease_memory_size']}, Deficiency: {initial_stats['deficiency_memory_size']}")

            # Provide feedback (simulate user correction)
            feedback_data = {
                'image_path': str(test_image),
                'disease_feedback': 'healthy',  # Assume correction to healthy
                'deficiency_feedback': 'healthy'
            }

            feedback_response = requests.post(f"{self.flask_url}/api/feedback",
                                            json=feedback_data, timeout=30)

            if feedback_response.status_code == 200:
                feedback_result = feedback_response.json()
                print("✅ Feedback incorporated successfully")
                print(f"📈 Memory updated - Disease: {feedback_result['disease_memory_size']}, Deficiency: {feedback_result['deficiency_memory_size']}")

                # Test prediction after feedback
                with open(test_image, 'rb') as f:
                    files = {'image': f}
                    response = requests.post(f"{self.flask_url}/api/interactive-diagnose", files=files, timeout=30)

                if response.status_code == 200:
                    updated_result = response.json()
                    print("🔄 Prediction after feedback successful")

                    # Compare confidences
                    initial_disease_conf = initial_result['disease_prediction']['confidence']
                    updated_disease_conf = updated_result['disease_prediction']['confidence']
                    print(f"      Initial Disease Confidence: {initial_disease_conf:.4f}")
                    print(f"      Updated Disease Confidence: {updated_disease_conf:.4f}")
                else:
                    print("❌ Post-feedback prediction failed")
            else:
                print(f"❌ Feedback failed: {feedback_response.status_code}")

        except Exception as e:
            print(f"❌ Feedback test error: {e}")

    def run_comprehensive_test(self):
        """Run all tests"""
        print("🚀 Starting Comprehensive Interactive System Test")
        print("=" * 60)

        # Check if Flask server is running
        try:
            response = requests.get(f"{self.flask_url}/health", timeout=5)
            if response.status_code != 200:
                print("❌ Flask server not responding. Please start the server first:")
                print("   cd model && python app.py")
                return
        except:
            print("❌ Cannot connect to Flask server. Please start the server first:")
            print("   cd model && python app.py")
            return

        print("✅ Flask server is running")

        # Run tests
        self.test_baseline_vs_interactive()
        self.test_feedback_loop()

        print("\n🎉 Testing completed!")

def main():
    tester = InteractiveSystemTester()

    if len(sys.argv) > 1 and sys.argv[1] == '--comprehensive':
        tester.run_comprehensive_test()
    else:
        # Quick test
        baseline, interactive = tester.test_baseline_vs_interactive()
        if baseline and interactive:
            print("\n✅ Quick test completed successfully!")
        else:
            print("\n❌ Quick test failed")

if __name__ == "__main__":
    main()
