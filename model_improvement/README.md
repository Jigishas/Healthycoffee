# Coffee Leaf Disease & Deficiency Detection - Model Improvement Guide

This folder contains a comprehensive approach to fix the accuracy issues identified in the current models.

## Problem Analysis

**Current Issues:**
- Disease model misclassifies healthy leaves as Cerscospora (67.9% confidence)
- Deficiency model misclassifies healthy leaves as Calcium Deficiency (100% confidence)
- Insufficient training data diversity
- Poor generalization to healthy samples

## Solution Structure

### 1. Data Collection (`data_collection/`)
- Collect diverse healthy coffee leaf images
- Gather more disease and deficiency samples
- Create balanced dataset with proper annotations

### 2. Fine-tuning (`fine_tuning/`)
- Retrain models with expanded dataset
- Implement data augmentation
- Hyperparameter optimization
- Cross-validation training

### 3. Evaluation (`evaluation/`)
- Comprehensive model testing
- Performance metrics analysis
- Confusion matrix analysis
- Real-world validation

### 4. Deployment (`deployment/`)
- Optimized model serving
- Confidence thresholding
- Error handling improvements
- Production-ready API

## Quick Start

1. **Data Collection**: Run `data_collection/collect_healthy_samples.py`
2. **Fine-tuning**: Execute `fine_tuning/train_improved_models.py`
3. **Evaluation**: Use `evaluation/comprehensive_test.py`
4. **Deploy**: Launch `deployment/improved_app.py`

## Expected Improvements

- **Accuracy**: 85-95% on healthy leaf classification
- **Recall**: Better detection of actual diseases/deficiencies
- **Confidence**: More reliable predictions with proper thresholding
- **Robustness**: Better performance on diverse real-world images
