#!/usr/bin/env python3
"""
Benchmark script to measure model performance improvements
"""

import time
import requests
import threading
import statistics
from concurrent.futures import ThreadPoolExecutor
import os
import json
from PIL import Image
import io

# Configuration
BASE_URL = "http://localhost:8000"
TEST_IMAGE_PATH = "test_dataset/deficiencies/healthy/test_image.jpg"  # Use a test image
NUM_REQUESTS = 50
CONCURRENT_REQUESTS = 5

def create_test_image():
    """Create a test image if it doesn't exist"""
    if not os.path.exists(TEST_IMAGE_PATH):
        # Create a simple test image
        img = Image.new('RGB', (224, 224), color='green')
        os.makedirs(os.path.dirname(TEST_IMAGE_PATH), exist_ok=True)
        img.save(TEST_IMAGE_PATH)
    return TEST_IMAGE_PATH

def single_request(session, image_path):
    """Make a single prediction request"""
    with open(image_path, 'rb') as f:
        files = {'image': ('test.jpg', f, 'image/jpeg')}

        start_time = time.time()
        try:
            response = session.post(f"{BASE_URL}/api/upload-image", files=files, timeout=30)
            end_time = time.time()

            if response.status_code == 200:
                data = response.json()
                processing_time = data.get('processing_time', 0)
                return {
                    'success': True,
                    'total_time': end_time - start_time,
                    'processing_time': processing_time,
                    'status_code': response.status_code
                }
            else:
                return {
                    'success': False,
                    'total_time': end_time - start_time,
                    'status_code': response.status_code,
                    'error': response.text
                }
        except Exception as e:
            end_time = time.time()
            return {
                'success': False,
                'total_time': end_time - start_time,
                'error': str(e)
            }

def benchmark_sequential():
    """Benchmark sequential requests"""
    print("Running sequential benchmark...")
    image_path = create_test_image()

    with requests.Session() as session:
        results = []
        for i in range(NUM_REQUESTS):
            print(f"Request {i+1}/{NUM_REQUESTS}")
            result = single_request(session, image_path)
            results.append(result)
            time.sleep(0.1)  # Small delay between requests

    return results

def benchmark_concurrent():
    """Benchmark concurrent requests"""
    print("Running concurrent benchmark...")
    image_path = create_test_image()

    results = []
    with ThreadPoolExecutor(max_workers=CONCURRENT_REQUESTS) as executor:
        with requests.Session() as session:
            futures = []
            for i in range(NUM_REQUESTS):
                future = executor.submit(single_request, session, image_path)
                futures.append(future)

            for future in futures:
                result = future.result()
                results.append(result)

    return results

def analyze_results(results, name):
    """Analyze benchmark results"""
    successful = [r for r in results if r['success']]
    failed = [r for r in results if not r['success']]

    if not successful:
        print(f"{name}: No successful requests")
        return

    total_times = [r['total_time'] for r in successful]
    processing_times = [r['processing_time'] for r in successful if 'processing_time' in r]

    print(f"\n{name} Results:")
    print(f"Total requests: {len(results)}")
    print(f"Successful: {len(successful)} ({len(successful)/len(results)*100:.1f}%)")
    print(f"Failed: {len(failed)}")

    if total_times:
        print(f"Total time - Mean: {statistics.mean(total_times):.4f}s")
        print(f"Total time - Median: {statistics.median(total_times):.4f}s")
        print(f"Total time - Min: {min(total_times):.4f}s")
        print(f"Total time - Max: {max(total_times):.4f}s")
        print(f"Total time - Std Dev: {statistics.stdev(total_times):.4f}s")

    if processing_times:
        print(f"Processing time - Mean: {statistics.mean(processing_times):.4f}s")
        print(f"Processing time - Median: {statistics.median(processing_times):.4f}s")

    # Calculate throughput
    if total_times:
        total_duration = sum(total_times)
        throughput = len(successful) / total_duration
        print(f"Throughput: {throughput:.2f} requests/second")

    return {
        'name': name,
        'total_requests': len(results),
        'successful': len(successful),
        'success_rate': len(successful)/len(results)*100,
        'mean_total_time': statistics.mean(total_times) if total_times else 0,
        'mean_processing_time': statistics.mean(processing_times) if processing_times else 0,
        'throughput': throughput if 'throughput' in locals() else 0
    }

def check_server_health():
    """Check if server is running"""
    try:
        response = requests.get(f"{BASE_URL}/health", timeout=5)
        if response.status_code == 200:
            print("Server is healthy")
            return True
        else:
            print(f"Server health check failed: {response.status_code}")
            return False
    except Exception as e:
        print(f"Cannot connect to server: {e}")
        print("Please start the server first with: python app_optimized.py")
        return False

def main():
    print("Model Performance Benchmark")
    print("=" * 50)

    if not check_server_health():
        return

    # Run benchmarks
    sequential_results = benchmark_sequential()
    concurrent_results = benchmark_concurrent()

    # Analyze results
    seq_stats = analyze_results(sequential_results, "Sequential")
    conc_stats = analyze_results(concurrent_results, "Concurrent")

    # Save results
    results = {
        'timestamp': time.time(),
        'sequential': seq_stats,
        'concurrent': conc_stats
    }

    with open('benchmark_results.json', 'w') as f:
        json.dump(results, f, indent=2)

    print("\nBenchmark completed. Results saved to benchmark_results.json")

if __name__ == "__main__":
    main()
