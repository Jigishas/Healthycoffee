import os
import json
import numpy as np
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

class ModelEvaluator:
    def __init__(self, test_dataset_path, model_type='original'):
        """
        Initialize evaluator with test dataset path and model type

        Args:
            test_dataset_path: Path to test dataset directory
            model_type: 'original' or 'optimized'
        """
        self.test_dataset_path = Path(test_dataset_path)
        self.model_type = model_type
        self.results = {}

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
        else:  # optimized
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

    def load_test_data(self):
        """Load test images and their ground truth labels"""
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
                            'model_type': 'disease'
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
                            'model_type': 'deficiency'
                        })

        return disease_data, deficiency_data

    def evaluate_model(self, test_data, model, model_name):
        """Evaluate a single model on test data"""
        predictions = []
        true_labels = []
        confidences = []
        inference_times = []

        print(f"Evaluating {model_name} model on {len(test_data)} samples...")

        for sample in test_data:
            try:
                start_time = time.time()
                result = model.predict(sample['path'])
                inference_time = time.time() - start_time

                predictions.append(result['class'])
                true_labels.append(sample['true_label'])
                confidences.append(result['confidence'])
                inference_times.append(inference_time)

            except Exception as e:
                print(f"Error processing {sample['path']}: {e}")
                continue

        # Calculate metrics
        accuracy = accuracy_score(true_labels, predictions)
        precision, recall, f1, support = precision_recall_fscore_support(
            true_labels, predictions, average='weighted', zero_division=0
        )

        # Confusion matrix
        cm = confusion_matrix(true_labels, predictions)

        results = {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'confusion_matrix': cm,
            'predictions': predictions,
            'true_labels': true_labels,
            'confidences': confidences,
            'inference_times': inference_times,
            'avg_inference_time': np.mean(inference_times),
            'avg_confidence': np.mean(confidences)
        }

        return results

    def run_evaluation(self):
        """Run complete evaluation on both models"""
        print(f"Starting {self.model_type} model evaluation...")
        print("=" * 60)

        # Load test data
        disease_data, deficiency_data = self.load_test_data()

        print(f"Found {len(disease_data)} disease test samples")
        print(f"Found {len(deficiency_data)} deficiency test samples")

        if not disease_data and not deficiency_data:
            print("No test data found! Please add labeled images to test_dataset/")
            return None

        # Evaluate disease model
        if disease_data:
            disease_results = self.evaluate_model(
                disease_data, self.disease_classifier, 'Disease'
            )
            self.results['disease'] = disease_results

        # Evaluate deficiency model
        if deficiency_data:
            deficiency_results = self.evaluate_model(
                deficiency_data, self.deficiency_classifier, 'Deficiency'
            )
            self.results['deficiency'] = deficiency_results

        return self.results

    def print_results(self):
        """Print evaluation results in a formatted way"""
        if not self.results:
            print("No results to display. Run evaluation first.")
            return

        print("\n" + "=" * 80)
        print(f"{self.model_type.upper()} MODEL EVALUATION RESULTS")
        print("=" * 80)

        for model_type, results in self.results.items():
            print(f"\n{model_type.upper()} MODEL:")
            print("-" * 40)
            print(f"Accuracy:           {results['accuracy']:.4f}")
            print(f"Precision:          {results['precision']:.4f}")
            print(f"Recall:            {results['recall']:.4f}")
            print(f"F1-Score:          {results['f1_score']:.4f}")
            print(f"Avg Inference Time: {results['avg_inference_time']:.4f}s")
            print(f"Avg Confidence:    {results['avg_confidence']:.4f}")

            # Per-class performance
            print("\nPer-class Performance:")
            unique_labels = set(results['true_labels'])
            for label in sorted(unique_labels):
                indices = [i for i, x in enumerate(results['true_labels']) if x == label]
                if indices:
                    label_predictions = [results['predictions'][i] for i in indices]
                    label_accuracy = sum(1 for pred in label_predictions if pred == label) / len(label_predictions)
                    print(f"  {label}: {label_accuracy:.4f}")

    def save_results(self, output_dir='evaluation_results'):
        """Save evaluation results to files"""
        os.makedirs(output_dir, exist_ok=True)

        # Save metrics to JSON
        metrics_file = os.path.join(output_dir, f'{self.model_type}_metrics.json')
        with open(metrics_file, 'w') as f:
            # Convert numpy arrays to lists for JSON serialization
            json_results = {}
            for model_type, results in self.results.items():
                json_results[model_type] = {
                    'accuracy': results['accuracy'],
                    'precision': results['precision'],
                    'recall': results['recall'],
                    'f1_score': results['f1_score'],
                    'avg_inference_time': results['avg_inference_time'],
                    'avg_confidence': results['avg_confidence'],
                    'confusion_matrix': results['confusion_matrix'].tolist()
                }
            json.dump(json_results, f, indent=2)

        # Save detailed predictions to CSV
        for model_type, results in self.results.items():
            df = pd.DataFrame({
                'true_label': results['true_labels'],
                'prediction': results['predictions'],
                'confidence': results['confidences'],
                'inference_time': results['inference_times']
            })
            csv_file = os.path.join(output_dir, f'{self.model_type}_{model_type}_predictions.csv')
            df.to_csv(csv_file, index=False)

        print(f"Results saved to {output_dir}/")

    def plot_confusion_matrix(self, output_dir='evaluation_results'):
        """Generate confusion matrix plots"""
        os.makedirs(output_dir, exist_ok=True)

        for model_type, results in self.results.items():
            plt.figure(figsize=(10, 8))
            cm = results['confusion_matrix']
            labels = sorted(set(results['true_labels']))

            sns.heatmap(cm, annot=True, fmt='d', cmap='Blues',
                       xticklabels=labels, yticklabels=labels)
            plt.title(f'{self.model_type.title()} {model_type.title()} Model - Confusion Matrix')
            plt.xlabel('Predicted')
            plt.ylabel('True')
            plt.tight_layout()

            plot_file = os.path.join(output_dir, f'{self.model_type}_{model_type}_confusion_matrix.png')
            plt.savefig(plot_file, dpi=300, bbox_inches='tight')
            plt.close()

        print(f"Confusion matrix plots saved to {output_dir}/")

def compare_models(test_dataset_path):
    """Compare original vs optimized models"""
    print("Comparing Original vs Optimized Models")
    print("=" * 60)

    # Evaluate both models
    original_evaluator = ModelEvaluator(test_dataset_path, 'original')
    optimized_evaluator = ModelEvaluator(test_dataset_path, 'optimized')

    original_results = original_evaluator.run_evaluation()
    optimized_results = optimized_evaluator.run_evaluation()

    if not original_results or not optimized_results:
        print("Could not evaluate both models. Check test data and model files.")
        return

    # Print comparison
    print("\n" + "=" * 80)
    print("MODEL COMPARISON SUMMARY")
    print("=" * 80)

    for model_type in ['disease', 'deficiency']:
        if model_type in original_results and model_type in optimized_results:
            orig = original_results[model_type]
            opt = optimized_results[model_type]

            print(f"\n{model_type.upper()} MODEL COMPARISON:")
            print("-" * 40)
            print("Metric              Original      Optimized     Improvement")
            print("-" * 60)
            print(f"Accuracy           {orig['accuracy']:.4f}        {opt['accuracy']:.4f}        {opt['accuracy']-orig['accuracy']:+.4f}")
            print(f"Precision          {orig['precision']:.4f}        {opt['precision']:.4f}        {opt['precision']-orig['precision']:+.4f}")
            print(f"Recall            {orig['recall']:.4f}        {opt['recall']:.4f}        {opt['recall']-orig['recall']:+.4f}")
            print(f"F1-Score          {orig['f1_score']:.4f}        {opt['f1_score']:.4f}        {opt['f1_score']-orig['f1_score']:+.4f}")
            print(f"Avg Inference Time {orig['avg_inference_time']:.4f}        {opt['avg_inference_time']:.4f}        {opt['avg_inference_time']-orig['avg_inference_time']:+.4f}")
            print(f"Avg Confidence    {orig['avg_confidence']:.4f}        {opt['avg_confidence']:.4f}        {opt['avg_confidence']-orig['avg_confidence']:+.4f}")

def main():
    """Main evaluation function"""
    test_dataset_path = 'test_dataset'

    if not os.path.exists(test_dataset_path):
        print(f"Test dataset not found at {test_dataset_path}")
        print("Please create test_dataset/ with labeled images")
        return

    # Evaluate optimized model (recommended)
    print("Evaluating Optimized Model (with confidence thresholding)...")
    evaluator = ModelEvaluator(test_dataset_path, 'optimized')
    results = evaluator.run_evaluation()

    if results:
        evaluator.print_results()
        evaluator.save_results()
        evaluator.plot_confusion_matrix()

        # Compare with original if requested
        compare = input("\nCompare with original model? (y/n): ").lower().strip()
        if compare == 'y':
            compare_models(test_dataset_path)

if __name__ == "__main__":
    main()
