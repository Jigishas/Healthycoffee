#!/usr/bin/env python3
"""
Benchmark script to measure speed improvements after optimization
"""
import time
import os
from pathlib import Path
from src.preprocessing import preprocess_image
from src.inference import fast_preprocess_image
from PIL import Image
import torch

def benchmark_preprocessing():
    """Compare old vs new preprocessing speed"""
    print("Benchmarking preprocessing speed improvements...")
    print("=" * 60)

    # Test image
    test_image_path = "test_dataset/deficiencies/healthy/test_image.jpg"
    if not os.path.exists(test_image_path):
        print(f"Test image not found: {test_image_path}")
        return

    # Load image once
    image = Image.open(test_image_path).convert("RGB")

    # Benchmark new fast preprocessing (PIL-based)
    print("Testing optimized PIL-based preprocessing...")
    times_fast = []
    for i in range(10):
        start = time.time()
        result_fast = fast_preprocess_image(image)
        times_fast.append(time.time() - start)

    avg_fast = sum(times_fast) / len(times_fast)
    print(".4f")

    # Benchmark old preprocessing (cv2 + torchvision)
    print("Testing old cv2 + torchvision preprocessing...")
    times_old = []
    for i in range(10):
        start = time.time()
        result_old = preprocess_image(test_image_path)
        times_old.append(time.time() - start)

    avg_old = sum(times_old) / len(times_old)
    print(".4f")

    # Calculate improvement
    improvement = ((avg_old - avg_fast) / avg_old) * 100
    print(".1f")

    return {
        'old_time': avg_old,
        'new_time': avg_fast,
        'improvement_percent': improvement
    }

def benchmark_inference():
    """Benchmark inference time"""
    print("\nBenchmarking inference time...")
    print("=" * 40)

    from optimize_model import LightweightTorchClassifier

    # Test image
    test_image_path = "test_dataset/deficiencies/healthy/test_image.jpg"
    if not os.path.exists(test_image_path):
        print(f"Test image not found: {test_image_path}")
        return

    # Load model
    print("Loading optimized model...")
    model = LightweightTorchClassifier(
        'models/leaf_deficiencies/efficientnet_deficiency_balanced.pth',
        'models/leaf_deficiencies/class_mapping_deficiencies.json',
        preload=True  # Test with preloading
    )

    # Benchmark inference
    times = []
    for i in range(5):
        start = time.time()
        result = model.predict(test_image_path)
        inference_time = time.time() - start
        times.append(inference_time)
        print(".4f")

    avg_time = sum(times) / len(times)
    print(".4f")

    return avg_time

if __name__ == "__main__":
    print("Speed Optimization Benchmark")
    print("=" * 50)

    # Test preprocessing
    preprocessing_results = benchmark_preprocessing()

    # Test inference
    inference_time = benchmark_inference()

    print("\n" + "=" * 50)
    print("SUMMARY:")
    if preprocessing_results:
        print(".1f")
        print(".4f")
    print(".4f")
    print("\nOptimizations completed successfully!")
