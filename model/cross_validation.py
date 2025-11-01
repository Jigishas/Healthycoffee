import os
import json
import numpy as np
from pathlib import Path
from sklearn.model_selection import StratifiedKFold, cross_val_score
from sklearn.metrics import accuracy_score, precision_recall_fscore_support, confusion_matrix
import torch
from torchvision import transforms
from PIL import Image
import pandas as pd
from collections import defaultdict
import time
from optimize_model import OptimizedTorchClassifier
from src.inference import TorchClassifier

class CrossValidator:
    def __init__(self, test_dataset_path, model_type='optimized', k_folds=5):
        """
        Initialize cross-validator with dataset path and model type

        Args:
            test_dataset_path: Path to test dataset directory
            model_type: 'original' or 'optimized'
            k_folds: Number of cross-validation folds
        """
        self.test_dataset_path = Path(test_dataset_path)
        self.model_type = model_type
        self.k_folds = k_folds
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
            # Use original model for disease to get real statistics without threshold filtering
            self.disease_classifier = TorchClassifier(
                'models/leaf_diseases/efficientnet_disease_balanced.pth',
                'models/leaf_diseases/class_mapping_diseases.json'
            )
            self.deficiency_classifier = OptimizedTorchClassifier(
                'models/leaf_deficiencies/efficientnet_deficiency_balanced.pth',
                'models/leaf_deficiencies/class_mapping_deficiencies.json',
                confidence_threshold=0.3
            )

    def load_dataset(self):
        """Load all test images and their labels"""
        disease_data = []
        deficiency_data = []

        # Load disease data
        disease_path = self.test_dataset_path / 'diseases'
        if disease_path.exists():
            for class_dir in disease_path.iterdir():
                if class_dir.is_dir():
                    class_name = class_dir.name
                    for img_file in class_dir.glob('*.jpg'):
                        disease_data.append({
                            'path': str(img_file),
                            'label': class_name,
                            'model_type': 'disease'
                        })

        # Load deficiency data
        deficiency_path = self.test_dataset_path / 'deficiencies'
        if deficiency_path.exists():
            for class_dir in deficiency_path.iterdir():
                if class_dir.is_dir():
                    class_name = class_dir.name
                    for img_file in class_dir.glob('*.jpg'):
                        deficiency_data.append({
                            'path': str(img_file),
                            'label': class_name,
                            'model_type': 'deficiency'
                        })

        return disease_data, deficiency_data

    def evaluate_fold(self, train_indices, test_indices, data, model, model_name):
        """Evaluate a single fold"""
        train_data = [data[i] for i in train_indices]
        test_data = [data[i] for i in test_indices]

        predictions = []
        true_labels = []
        confidences = []
        inference_times = []

        # Evaluate on test fold
        for sample in test_data:
            try:
                start_time = time.time()
                result = model.predict(sample['path'])
                inference_time = time.time() - start_time

                predictions.append(result['class'])
                true_labels.append(sample['label'])
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

        return {
            'accuracy': accuracy,
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'predictions': predictions,
            'true_labels': true_labels,
            'confidences': confidences,
            'inference_times': inference_times,
            'avg_inference_time': np.mean(inference_times),
            'avg_confidence': np.mean(confidences)
        }

    def perform_cross_validation(self, data, model, model_name):
        """Perform k-fold cross-validation on dataset"""
        if len(data) < 2:
            print(f"Warning: Only {len(data)} samples available, using single-sample evaluation")
            # For single sample, just evaluate it directly
            return self.evaluate_single_sample(data, model, model_name)

        if len(data) < self.k_folds:
            print(f"Warning: Only {len(data)} samples available, using {len(data)}-fold CV")
            self.k_folds = len(data)

        # Prepare data for stratified k-fold
        labels = [sample['label'] for sample in data]
        unique_labels = list(set(labels))

        # Create label encoding for stratification
        label_to_idx = {label: i for i, label in enumerate(unique_labels)}
        y = np.array([label_to_idx[label] for label in labels])

        skf = StratifiedKFold(n_splits=self.k_folds, shuffle=True, random_state=42)

        fold_results = []
        all_predictions = []
        all_true_labels = []
        all_confidences = []
        all_inference_times = []

        print(f"Performing {self.k_folds}-fold cross-validation for {model_name}...")

        fold_idx = 1
        for train_indices, test_indices in skf.split(data, y):
            print(f"  Fold {fold_idx}/{self.k_folds}...")

            fold_result = self.evaluate_fold(train_indices, test_indices, data, model, model_name)
            fold_results.append(fold_result)

            all_predictions.extend(fold_result['predictions'])
            all_true_labels.extend(fold_result['true_labels'])
            all_confidences.extend(fold_result['confidences'])
            all_inference_times.extend(fold_result['inference_times'])

            fold_idx += 1

        # Calculate overall metrics across all folds
        overall_accuracy = accuracy_score(all_true_labels, all_predictions)
        overall_precision, overall_recall, overall_f1, _ = precision_recall_fscore_support(
            all_true_labels, all_predictions, average='weighted', zero_division=0
        )

        # Per-class performance
        per_class_metrics = {}
        unique_labels_overall = set(all_true_labels)
        for label in unique_labels_overall:
            indices = [i for i, x in enumerate(all_true_labels) if x == label]
            if indices:
                label_predictions = [all_predictions[i] for i in indices]
                label_accuracy = sum(1 for pred in label_predictions if pred == label) / len(label_predictions)
                per_class_metrics[label] = label_accuracy

        return {
            'fold_results': fold_results,
            'overall_accuracy': overall_accuracy,
            'overall_precision': overall_precision,
            'overall_recall': overall_recall,
            'overall_f1_score': overall_f1,
            'avg_inference_time': np.mean(all_inference_times),
            'avg_confidence': np.mean(all_confidences),
            'per_class_accuracy': per_class_metrics,
            'all_predictions': all_predictions,
            'all_true_labels': all_true_labels,
            'all_confidences': all_confidences,
            'all_inference_times': all_inference_times
        }

    def evaluate_single_sample(self, data, model, model_name):
        """Evaluate single sample (fallback for very small datasets)"""
        print(f"Evaluating single sample for {model_name}...")

        sample = data[0]
        try:
            start_time = time.time()
            result = model.predict(sample['path'])
            inference_time = time.time() - start_time

            prediction = result['class']
            true_label = sample['label']
            confidence = result['confidence']

            # For single sample, accuracy is binary
            accuracy = 1.0 if prediction == true_label else 0.0

            # Single sample metrics (degenerate case)
            precision = accuracy
            recall = accuracy
            f1_score = accuracy

            return {
                'fold_results': [{
                    'accuracy': accuracy,
                    'precision': precision,
                    'recall': recall,
                    'f1_score': f1_score,
                    'predictions': [prediction],
                    'true_labels': [true_label],
                    'confidences': [confidence],
                    'inference_times': [inference_time],
                    'avg_inference_time': inference_time,
                    'avg_confidence': confidence
                }],
                'overall_accuracy': accuracy,
                'overall_precision': precision,
                'overall_recall': recall,
                'overall_f1_score': f1_score,
                'avg_inference_time': inference_time,
                'avg_confidence': confidence,
                'per_class_accuracy': {true_label: accuracy},
                'all_predictions': [prediction],
                'all_true_labels': [true_label],
                'all_confidences': [confidence],
                'all_inference_times': [inference_time]
            }

        except Exception as e:
            print(f"Error evaluating single sample {sample['path']}: {e}")
            return {
                'fold_results': [],
                'overall_accuracy': 0.0,
                'overall_precision': 0.0,
                'overall_recall': 0.0,
                'overall_f1_score': 0.0,
                'avg_inference_time': 0.0,
                'avg_confidence': 0.0,
                'per_class_accuracy': {},
                'all_predictions': [],
                'all_true_labels': [],
                'all_confidences': [],
                'all_inference_times': []
            }

    def run_cross_validation(self):
        """Run complete cross-validation for both models"""
        print(f"Starting {self.model_type} model cross-validation...")
        print("=" * 60)

        # Load datasets
        disease_data, deficiency_data = self.load_dataset()

        print(f"Found {len(disease_data)} disease samples")
        print(f"Found {len(deficiency_data)} deficiency samples")

        if not disease_data and not deficiency_data:
            print("No test data found! Please add labeled images to test_dataset/")
            return None

        # Cross-validate disease model
        if disease_data:
            disease_results = self.perform_cross_validation(
                disease_data, self.disease_classifier, 'Disease'
            )
            self.results['disease'] = disease_results

        # Cross-validate deficiency model
        if deficiency_data:
            deficiency_results = self.perform_cross_validation(
                deficiency_data, self.deficiency_classifier, 'Deficiency'
            )
            self.results['deficiency'] = deficiency_results

        return self.results

    def print_results(self):
        """Print cross-validation results"""
        if not self.results:
            print("No results to display. Run cross-validation first.")
            return

        print("\n" + "=" * 80)
        print(f"{self.model_type.upper()} MODEL CROSS-VALIDATION RESULTS")
        print("=" * 80)

        for model_type, results in self.results.items():
            print(f"\n{model_type.upper()} MODEL:")
            print("-" * 40)
            print(f"Overall Accuracy:     {results['overall_accuracy']:.4f}")
            print(f"Overall Precision:    {results['overall_precision']:.4f}")
            print(f"Overall Recall:       {results['overall_recall']:.4f}")
            print(f"Overall F1-Score:     {results['overall_f1_score']:.4f}")
            print(f"Avg Inference Time:   {results['avg_inference_time']:.4f}s")
            print(f"Avg Confidence:       {results['avg_confidence']:.4f}")

            print("\nPer-class Accuracy:")
            for label, accuracy in results['per_class_accuracy'].items():
                print(f"  {label}: {accuracy:.4f}")

            # Fold-wise results
            print("\nFold-wise Results:")
            for i, fold in enumerate(results['fold_results'], 1):
                if len(fold['predictions']) == 1:
                    # For single sample, show prediction details instead of aggregated metrics
                    pred = fold['predictions'][0]
                    conf = fold['confidences'][0]
                    true = fold['true_labels'][0]
                    print(f"  Fold {i}: Pred={pred}, True={true}, Conf={conf:.4f}")
                else:
                    print(f"  Fold {i}: Acc={fold['accuracy']:.4f}, F1={fold['f1_score']:.4f}")

    def save_results(self, output_dir='cross_validation_results'):
        """Save cross-validation results"""
        os.makedirs(output_dir, exist_ok=True)

        # Save overall metrics
        metrics_file = os.path.join(output_dir, f'{self.model_type}_cv_metrics.json')
        with open(metrics_file, 'w') as f:
            json_results = {}
            for model_type, results in self.results.items():
                json_results[model_type] = {
                    'overall_accuracy': results['overall_accuracy'],
                    'overall_precision': results['overall_precision'],
                    'overall_recall': results['overall_recall'],
                    'overall_f1_score': results['overall_f1_score'],
                    'avg_inference_time': results['avg_inference_time'],
                    'avg_confidence': results['avg_confidence'],
                    'per_class_accuracy': results['per_class_accuracy'],
                    'fold_results': [
                        {
                            'accuracy': fold['accuracy'],
                            'precision': fold['precision'],
                            'recall': fold['recall'],
                            'f1_score': fold['f1_score'],
                            'avg_inference_time': fold['avg_inference_time'],
                            'avg_confidence': fold['avg_confidence']
                        }
                        for fold in results['fold_results']
                    ]
                }
            json.dump(json_results, f, indent=2)

        # Save detailed predictions
        for model_type, results in self.results.items():
            df = pd.DataFrame({
                'true_label': results['all_true_labels'],
                'prediction': results['all_predictions'],
                'confidence': results['all_confidences'],
                'inference_time': results['all_inference_times']
            })
            csv_file = os.path.join(output_dir, f'{self.model_type}_{model_type}_cv_predictions.csv')
            df.to_csv(csv_file, index=False)

        print(f"Cross-validation results saved to {output_dir}/")

def compare_cv_vs_holdout(test_dataset_path, k_folds=5):
    """Compare cross-validation vs holdout validation"""
    print("Comparing Cross-Validation vs Holdout Validation")
    print("=" * 60)

    # Run cross-validation
    cv_validator = CrossValidator(test_dataset_path, 'optimized', k_folds)
    cv_results = cv_validator.run_cross_validation()

    # Run holdout validation (using evaluate_model.py approach)
    from evaluate_model import ModelEvaluator
    holdout_evaluator = ModelEvaluator(test_dataset_path, 'optimized')
    holdout_results = holdout_evaluator.run_evaluation()

    if not cv_results or not holdout_results:
        print("Could not run both validation methods.")
        return

    # Print comparison
    print("\n" + "=" * 80)
    print("CROSS-VALIDATION VS HOLDOUT COMPARISON")
    print("=" * 80)

    for model_type in ['disease', 'deficiency']:
        if model_type in cv_results and model_type in holdout_results:
            cv = cv_results[model_type]
            ho = holdout_results[model_type]

            print(f"\n{model_type.upper()} MODEL COMPARISON:")
            print("-" * 40)
            print("Method          Accuracy    Precision   Recall      F1-Score")
            print("-" * 60)
            print(f"Cross-Val       {cv['overall_accuracy']:.4f}      {cv['overall_precision']:.4f}    {cv['overall_recall']:.4f}    {cv['overall_f1_score']:.4f}")
            print(f"Holdout         {ho['accuracy']:.4f}      {ho['precision']:.4f}    {ho['recall']:.4f}    {ho['f1_score']:.4f}")

            # Statistical significance (rough estimate)
            acc_diff = abs(cv['overall_accuracy'] - ho['accuracy'])
            if acc_diff < 0.05:
                stability = "Very Stable"
            elif acc_diff < 0.10:
                stability = "Stable"
            else:
                stability = "Variable"

            print(f"Stability: {stability} (difference: {acc_diff:.4f})")

def main():
    """Main cross-validation function"""
    test_dataset_path = 'test_dataset'

    if not os.path.exists(test_dataset_path):
        print(f"Test dataset not found at {test_dataset_path}")
        print("Please create test_dataset/ with labeled images")
        return

    # Run cross-validation
    print("Running Cross-Validation (Optimized Model)...")
    cv_validator = CrossValidator(test_dataset_path, 'optimized', k_folds=5)
    results = cv_validator.run_cross_validation()

    if results:
        cv_validator.print_results()
        cv_validator.save_results()

        # Compare with holdout
        compare = input("\nCompare with holdout validation? (y/n): ").lower().strip()
        if compare == 'y':
            compare_cv_vs_holdout(test_dataset_path)

if __name__ == "__main__":
    main()
