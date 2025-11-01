import os
import json
from pathlib import Path
from PIL import Image
import torch
from torchvision import transforms
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score, precision_recall_fscore_support
import matplotlib.pyplot as plt
import seaborn as sns
from src.inference import TorchClassifier
from optimize_model import OptimizedTorchClassifier
import pandas as pd
from collections import defaultdict
import time

class RealDatasetEvaluator:
    def __init__(self, test_dataset_path, model_type='improved'):
        """
        Initialize evaluator with real test dataset path and model type

        Args:
            test_dataset_path: Path to real test dataset directory
            model_type: 'original', 'optimized', or 'improved'
        """
        self.test_dataset_path = Path(test_dataset_path)
        self.model_type = model_type
        self.results = {}

        # Class mappings for diseases
        self.disease_class_mapping = {
            'miner': 'Cerscospora',
            'nodisease': 'Healthy',
            'phoma': 'Phoma',
            'rust': 'Leaf rust'
        }

        # Initialize models based on type
        if model_type == 'original':
            self.disease_classifier = TorchClassifier(
                'models/leaf_diseases/efficientnet_disease_balanced.pth',
                'models/leaf_diseases/class_mapping_diseases.json'
            )
            self.deficiency_classifier = TorchClassifier(
                'models/leaf_deficiencies/efficientnet_deficiency_balanced.pth',
                'models/leaf_deficiencies/class_mapping_deficiencies.json'
            )
        elif model_type == 'optimized':
            self.disease_classifier = OptimizedTorchClassifier(
                'models/leaf_diseases/efficientnet_disease_balanced.pth',
                'models/leaf_diseases/class_mapping_diseases.json',
                confidence_threshold=0.3
            )
            self.deficiency_classifier = OptimizedTorchClassifier(
                'models/leaf_deficiencies/efficientnet_deficiency_balanced.pth',
                'models/leaf_deficiencies/class_mapping_deficiencies.json',
                confidence_threshold=0.3
            )
        else:  # improved
            self.disease_classifier = TorchClassifier(
                'models/leaf_diseases/improved_disease_model.pth',
                'models/leaf_diseases/class_mapping_diseases.json'
            )
            self.deficiency_classifier = TorchClassifier(
                'models/leaf_deficiencies/improved_deficiency_model.pth',
                'models/leaf_deficiencies/class_mapping_deficiencies.json'
            )

    def load_real_test_data(self):
        """Load real test images and their ground truth labels"""
        disease_data = []
        deficiency_data = []  # For now, we'll assume all are healthy for deficiencies

        # Load disease test data
        if self.test_dataset_path.exists():
            for class_dir in self.test_dataset_path.iterdir():
                if class_dir.is_dir() and class_dir.name in self.disease_class_mapping:
                    class_name = self.disease_class_mapping[class_dir.name]
                    for img_file in class_dir.glob('*.jpg'):
                        disease_data.append({
                            'path': str(img_file),
                            'true_label': class_name
                        })

        print(f"Found {len(disease_data)} disease test samples")
        return disease_data, deficiency_data

    def evaluate_disease_model(self, test_data):
        """Evaluate disease model on real test data"""
        print(f"Evaluating {self.model_type} Disease model on {len(test_data)} samples...")

        predictions = []
        true_labels = []
        confidences = []
        inference_times = []

        for item in test_data:
            start_time = time.time()

            try:
                result = self.disease_classifier.predict(item['path'])
                pred_class = result['class']
                confidence = result['confidence']

                predictions.append(pred_class)
                true_labels.append(item['true_label'])
                confidences.append(confidence)
                inference_times.append(time.time() - start_time)

            except Exception as e:
                print(f"Error processing {item['path']}: {e}")
                continue

        # Calculate metrics
        accuracy = accuracy_score(true_labels, predictions)
        precision, recall, f1, support = precision_recall_fscore_support(
            true_labels, predictions, average='weighted', zero_division=0
        )

        # Per-class metrics
        per_class_metrics = {}
        unique_labels = set(true_labels)
        for label in unique_labels:
            label_indices = [i for i, t in enumerate(true_labels) if t == label]
            label_predictions = [predictions[i] for i in label_indices]
            label_accuracy = sum(1 for pred in label_predictions if pred == label) / len(label_predictions)
            per_class_metrics[label] = label_accuracy

        results = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'avg_inference_time': sum(inference_times) / len(inference_times) if inference_times else 0,
            'avg_confidence': sum(confidences) / len(confidences) if confidences else 0,
            'per_class_accuracy': per_class_metrics,
            'predictions': predictions,
            'true_labels': true_labels,
            'confidences': confidences
        }

        return results

    def evaluate_deficiency_model(self, test_data):
        """Evaluate deficiency model on real test data (assuming healthy)"""
        print(f"Evaluating {self.model_type} Deficiency model on {len(test_data)} samples...")

        predictions = []
        true_labels = ['Healthy'] * len(test_data)  # Assume all test images are healthy
        confidences = []
        inference_times = []

        for item in test_data:
            start_time = time.time()

            try:
                result = self.deficiency_classifier.predict(item['path'])
                pred_class = result['class']
                confidence = result['confidence']

                predictions.append(pred_class)
                confidences.append(confidence)
                inference_times.append(time.time() - start_time)

            except Exception as e:
                print(f"Error processing {item['path']}: {e}")
                continue

        # Calculate metrics
        accuracy = accuracy_score(true_labels, predictions)
        precision, recall, f1, support = precision_recall_fscore_support(
            true_labels, predictions, average='weighted', zero_division=0
        )

        results = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'avg_inference_time': sum(inference_times) / len(inference_times) if inference_times else 0,
            'avg_confidence': sum(confidences) / len(confidences) if confidences else 0,
            'predictions': predictions,
            'true_labels': true_labels,
            'confidences': confidences
        }

        return results

    def run_evaluation(self):
        """Run complete evaluation"""
        disease_data, deficiency_data = self.load_real_test_data()

        if disease_data:
            self.results['disease'] = self.evaluate_disease_model(disease_data)

        if deficiency_data:
            self.results['deficiency'] = self.evaluate_deficiency_model(deficiency_data)
        else:
            # Evaluate deficiency on disease data assuming healthy
            self.results['deficiency'] = self.evaluate_deficiency_model(disease_data)

        return self.results

    def print_results(self):
        """Print evaluation results"""
        print("\n" + "=" * 80)
        print(f"{self.model_type.upper()} MODEL EVALUATION RESULTS ON REAL DATASET")
        print("=" * 80)

        for model_type, results in self.results.items():
            print(f"\n{model_type.upper()} MODEL:")
            print("-" * 40)
            print(".4f")
            print(".4f")
            print(".4f")
            print(".4f")
            print(".4f")
            print(".4f")

            if 'per_class_accuracy' in results:
                print("\nPer-class Performance:")
                for label, acc in results['per_class_accuracy'].items():
                    print(".4f")

    def save_results(self):
        """Save results to JSON file"""
        os.makedirs('evaluation_results', exist_ok=True)

        # Save detailed results
        results_file = f'evaluation_results/{self.model_type}_real_dataset_metrics.json'
        with open(results_file, 'w') as f:
            json.dump(self.results, f, indent=2)

        print(f"\nResults saved to {results_file}")

def main():
    """Main evaluation function"""
    real_test_dataset_path = '../model_improvement/test'

    if not os.path.exists(real_test_dataset_path):
        print(f"Real test dataset not found at {real_test_dataset_path}")
        return

    print("Evaluating models on real coffee leaf dataset...")

    # Evaluate improved model (recommended)
    print("\n=== EVALUATING IMPROVED MODEL ===")
    evaluator = RealDatasetEvaluator(real_test_dataset_path, 'improved')
    results = evaluator.run_evaluation()

    if results:
        evaluator.print_results()
        evaluator.save_results()

        # Compare with original if requested
        compare = input("\nCompare with original model? (y/n): ").lower().strip()
        if compare == 'y':
            print("\n=== EVALUATING ORIGINAL MODEL ===")
            orig_evaluator = RealDatasetEvaluator(real_test_dataset_path, 'original')
            orig_results = orig_evaluator.run_evaluation()
            orig_evaluator.print_results()
            orig_evaluator.save_results()

if __name__ == "__main__":
    main()
