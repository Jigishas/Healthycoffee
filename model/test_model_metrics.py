#!/usr/bin/env python3
"""
Comprehensive Model Evaluation Script
Tests accuracy, precision, recall, F1-score for both disease and deficiency models
"""

import os
import sys
import json
import time
import numpy as np
import pandas as pd
from pathlib import Path
from collections import defaultdict
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    confusion_matrix, classification_report
)
import torch
from PIL import Image

# Add src to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from src.inference import TorchClassifier
from optimize_model import LightweightTorchClassifier



class ModelMetricsTester:
    def __init__(self, test_dataset_path='test_dataset'):
        self.test_dataset_path = Path(test_dataset_path)
        self.results = {}
        
        # Initialize models
        print("Loading models...")
        self.disease_classifier = TorchClassifier(
            'models/leaf_diseases/efficientnet_disease_balanced.pth',
            'models/leaf_diseases/class_mapping_diseases.json'
        )
        self.deficiency_classifier = LightweightTorchClassifier(

            'models/leaf_deficiencies/efficientnet_deficiency_balanced.pth',
            'models/leaf_deficiencies/class_mapping_deficiencies.json',
            confidence_threshold=0.3
        )
        print("✓ Models loaded successfully\n")

    def load_test_dataset(self):
        """Load all test images and their true labels"""
        disease_data = []
        deficiency_data = []

        # Load disease test data
        disease_path = self.test_dataset_path / 'diseases'
        if disease_path.exists():
            for class_dir in disease_path.iterdir():
                if class_dir.is_dir():
                    class_name = class_dir.name
                    for img_file in class_dir.glob('*.jpg'):
                        disease_data.append({
                            'path': str(img_file),
                            'true_label': class_name,
                            'type': 'disease'
                        })

        # Load deficiency test data
        deficiency_path = self.test_dataset_path / 'deficiencies'
        if deficiency_path.exists():
            for class_dir in deficiency_path.iterdir():
                if class_dir.is_dir():
                    class_name = class_dir.name
                    for img_file in class_dir.glob('*.jpg'):
                        deficiency_data.append({
                            'path': str(img_file),
                            'true_label': class_name,
                            'type': 'deficiency'
                        })

        return disease_data, deficiency_data

    def evaluate_model(self, test_data, model, model_name):
        """Evaluate a model and calculate all metrics"""
        print(f"\n{'='*60}")
        print(f"Evaluating {model_name} Model")
        print(f"{'='*60}")
        
        if not test_data:
            print(f"⚠ No test data found for {model_name}")
            return None

        print(f"Test samples: {len(test_data)}")
        
        predictions = []
        true_labels = []
        confidences = []
        inference_times = []

        # Process each test sample
        for i, sample in enumerate(test_data, 1):
            try:
                start_time = time.time()
                result = model.predict(sample['path'])
                inference_time = time.time() - start_time

                pred_label = result['class']
                confidence = result['confidence']
                true_label = sample['true_label']

                predictions.append(pred_label)
                true_labels.append(true_label)
                confidences.append(confidence)
                inference_times.append(inference_time)

                status = "✓" if pred_label == true_label else "✗"
                print(f"  [{i}/{len(test_data)}] {status} {true_label} → {pred_label} ({confidence:.2%})")

            except Exception as e:
                print(f"  ✗ Error processing {sample['path']}: {e}")
                continue

        if not predictions:
            print("⚠ No successful predictions")
            return None

        # Calculate metrics
        accuracy = accuracy_score(true_labels, predictions)
        precision = precision_score(true_labels, predictions, average='weighted', zero_division=0)
        recall = recall_score(true_labels, predictions, average='weighted', zero_division=0)
        f1 = f1_score(true_labels, predictions, average='weighted', zero_division=0)

        # Per-class metrics
        unique_labels = sorted(set(true_labels) | set(predictions))
        per_class_precision = precision_score(true_labels, predictions, average=None, labels=unique_labels, zero_division=0)
        per_class_recall = recall_score(true_labels, predictions, average=None, labels=unique_labels, zero_division=0)
        per_class_f1 = f1_score(true_labels, predictions, average=None, labels=unique_labels, zero_division=0)

        # Confusion matrix
        cm = confusion_matrix(true_labels, predictions, labels=unique_labels)

        # Classification report
        report = classification_report(true_labels, predictions, zero_division=0)

        results = {
            'model_name': model_name,
            'total_samples': len(test_data),
            'successful_predictions': len(predictions),
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'avg_confidence': np.mean(confidences),
            'avg_inference_time': np.mean(inference_times),
            'per_class': {
                label: {
                    'precision': per_class_precision[i],
                    'recall': per_class_recall[i],
                    'f1_score': per_class_f1[i]
                }
                for i, label in enumerate(unique_labels)
            },
            'confusion_matrix': cm.tolist(),
            'labels': unique_labels,
            'classification_report': report,
            'predictions': predictions,
            'true_labels': true_labels,
            'confidences': confidences
        }

        # Print summary
        print(f"\n{'='*60}")
        print(f"{model_name} Model Results")
        print(f"{'='*60}")
        print(f"Accuracy:  {accuracy:.4f} ({accuracy:.2%})")
        print(f"Precision: {precision:.4f} ({precision:.2%})")
        print(f"Recall:    {recall:.4f} ({recall:.2%})")
        print(f"F1-Score:  {f1:.4f} ({f1:.2%})")
        print(f"Avg Confidence: {np.mean(confidences):.4f}")
        print(f"Avg Inference:  {np.mean(inference_times):.4f}s")
        
        print(f"\nPer-Class Metrics:")
        print(f"{'Class':<20} {'Precision':>10} {'Recall':>10} {'F1':>10}")
        print("-" * 60)
        for label, metrics in results['per_class'].items():
            print(f"{label:<20} {metrics['precision']:>10.4f} {metrics['recall']:>10.4f} {metrics['f1_score']:>10.4f}")

        print(f"\nClassification Report:\n{report}")

        return results

    def run_full_evaluation(self):
        """Run complete evaluation for both models"""
        print(f"\n{'#'*70}")
        print(f"# COMPREHENSIVE MODEL EVALUATION")
        print(f"{'#'*70}")

        # Load test data
        disease_data, deficiency_data = self.load_test_dataset()
        print(f"\nTest Dataset Summary:")
        print(f"  Disease samples: {len(disease_data)}")
        print(f"  Deficiency samples: {len(deficiency_data)}")

        # Evaluate disease model
        if disease_data:
            disease_results = self.evaluate_model(disease_data, self.disease_classifier, 'Disease')
            self.results['disease'] = disease_results

        # Evaluate deficiency model
        if deficiency_data:
            deficiency_results = self.evaluate_model(deficiency_data, self.deficiency_classifier, 'Deficiency')
            self.results['deficiency'] = deficiency_results

        # Overall summary
        self.print_overall_summary()

        # Save results
        self.save_results()

        return self.results

    def print_overall_summary(self):
        """Print overall summary of all metrics"""
        print(f"\n{'#'*70}")
        print(f"# OVERALL EVALUATION SUMMARY")
        print(f"{'#'*70}")

        for model_name, results in self.results.items():
            if results:
                print(f"\n{model_name.upper()} MODEL:")
                print(f"  Accuracy:  {results['accuracy']:.4f} ({results['accuracy']:.2%})")
                print(f"  Precision: {results['precision']:.4f} ({results['precision']:.2%})")
                print(f"  Recall:    {results['recall']:.4f} ({results['recall']:.2%})")
                print(f"  F1-Score:  {results['f1_score']:.4f} ({results['f1_score']:.2%})")

    def save_results(self, output_dir='evaluation_results'):
        """Save evaluation results to files"""
        os.makedirs(output_dir, exist_ok=True)

        # Save metrics as JSON
        metrics_file = os.path.join(output_dir, 'comprehensive_metrics.json')
        json_results = {}
        for model_name, results in self.results.items():
            if results:
                json_results[model_name] = {
                    'accuracy': results['accuracy'],
                    'precision': results['precision'],
                    'recall': results['recall'],
                    'f1_score': results['f1_score'],
                    'avg_confidence': results['avg_confidence'],
                    'avg_inference_time': results['avg_inference_time'],
                    'per_class': results['per_class'],
                    'confusion_matrix': results['confusion_matrix'],
                    'labels': results['labels']
                }
        
        with open(metrics_file, 'w') as f:
            json.dump(json_results, f, indent=2)

        # Save detailed predictions as CSV
        for model_name, results in self.results.items():
            if results:
                df = pd.DataFrame({
                    'true_label': results['true_labels'],
                    'prediction': results['predictions'],
                    'confidence': results['confidences']
                })
                csv_file = os.path.join(output_dir, f'{model_name}_detailed_predictions.csv')
                df.to_csv(csv_file, index=False)

        print(f"\n✓ Results saved to {output_dir}/")
        print(f"  - {metrics_file}")
        print(f"  - Detailed prediction CSVs")

    def test_specific_class(self, class_name, model_type='disease'):
        """Test model on a specific class (e.g., leaf_rust)"""
        print(f"\n{'='*60}")
        print(f"Testing Specific Class: {class_name}")
        print(f"{'='*60}")

        # Find test images for this class
        if model_type == 'disease':
            class_path = self.test_dataset_path / 'diseases' / class_name
            model = self.disease_classifier
        else:
            class_path = self.test_dataset_path / 'deficiencies' / class_name
            model = self.deficiency_classifier

        if not class_path.exists():
            print(f"⚠ Class path not found: {class_path}")
            return None

        test_images = list(class_path.glob('*.jpg'))
        if not test_images:
            print(f"⚠ No test images found for {class_name}")
            return None

        print(f"Found {len(test_images)} test images")

        correct = 0
        total = 0
        confidences = []

        for img_path in test_images:
            try:
                result = model.predict(str(img_path))
                pred = result['class']
                conf = result['confidence']
                
                is_correct = pred == class_name
                if is_correct:
                    correct += 1
                total += 1
                confidences.append(conf)

                status = "✓" if is_correct else "✗"
                print(f"  {status} {img_path.name} → {pred} ({conf:.2%})")

            except Exception as e:
                print(f"  ✗ Error: {e}")

        if total > 0:
            accuracy = correct / total
            avg_conf = np.mean(confidences) if confidences else 0
            
            print(f"\n{class_name} Class Results:")
            print(f"  Accuracy: {accuracy:.4f} ({correct}/{total})")
            print(f"  Avg Confidence: {avg_conf:.4f}")

            return {
                'class_name': class_name,
                'accuracy': accuracy,
                'correct': correct,
                'total': total,
                'avg_confidence': avg_conf
            }

        return None


def main():
    """Main evaluation function"""
    print("="*70)
    print("MODEL METRICS EVALUATION")
    print("Testing Accuracy, Precision, Recall, F1-Score")
    print("="*70)

    # Initialize tester
    tester = ModelMetricsTester()

    # Run full evaluation
    results = tester.run_full_evaluation()

    # Test specific classes if requested
    test_leaf_rust = input("\nTest leaf_rust class specifically? (y/n): ").lower().strip()
    if test_leaf_rust == 'y':
        tester.test_specific_class('leaf_rust', 'disease')

    test_phoma = input("Test phoma class specifically? (y/n): ").lower().strip()
    if test_phoma == 'y':
        tester.test_specific_class('phoma', 'disease')

    print(f"\n{'='*70}")
    print("EVALUATION COMPLETE")
    print(f"{'='*70}")


if __name__ == "__main__":
    main()
