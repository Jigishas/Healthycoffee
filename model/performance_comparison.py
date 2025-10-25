import time
import requests
import subprocess
import os
from PIL import Image
import numpy as np

def test_original_app():
    """Test the original Flask app"""
    print("Testing original Flask app...")
    proc = subprocess.Popen(['python', 'app.py'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(3)  # Wait for startup

    # Create test image
    dummy_image = Image.fromarray(np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8))
    dummy_image.save('test_image.jpg')

    try:
        with open('test_image.jpg', 'rb') as f:
            files = {'image': ('test_image.jpg', f, 'image/jpeg')}
            start_time = time.time()
            response = requests.post('http://127.0.0.1:8000/api/upload-image', files=files)
            end_time = time.time()

        if response.status_code == 200:
            data = response.json()
            return {
                'success': True,
                'time': end_time - start_time,
                'disease': data.get('disease_prediction', {}).get('class'),
                'deficiency': data.get('deficiency_prediction', {}).get('class')
            }
        else:
            return {'success': False, 'error': response.text}

    except Exception as e:
        return {'success': False, 'error': str(e)}
    finally:
        proc.terminate()
        proc.wait()
        if os.path.exists('test_image.jpg'):
            os.remove('test_image.jpg')

def test_optimized_app():
    """Test the optimized Flask app"""
    print("Testing optimized Flask app...")
    proc = subprocess.Popen(['python', 'app_optimized.py'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    time.sleep(3)  # Wait for startup

    # Create test image
    dummy_image = Image.fromarray(np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8))
    dummy_image.save('test_image.jpg')

    try:
        with open('test_image.jpg', 'rb') as f:
            files = {'image': ('test_image.jpg', f, 'image/jpeg')}
            start_time = time.time()
            response = requests.post('http://127.0.0.1:8000/api/upload-image', files=files)
            end_time = time.time()

        if response.status_code == 200:
            data = response.json()
            return {
                'success': True,
                'time': end_time - start_time,
                'disease': data.get('disease_prediction', {}).get('class'),
                'deficiency': data.get('deficiency_prediction', {}).get('class'),
                'processing_time': data.get('processing_time'),
                'recommendations': bool(data.get('recommendations'))
            }
        else:
            return {'success': False, 'error': response.text}

    except Exception as e:
        return {'success': False, 'error': str(e)}
    finally:
        proc.terminate()
        proc.wait()
        if os.path.exists('test_image.jpg'):
            os.remove('test_image.jpg')

def run_performance_comparison():
    """Run performance comparison between original and optimized apps"""
    print("=" * 60)
    print("PERFORMANCE COMPARISON: Original vs Optimized Backend")
    print("=" * 60)

    # Test original app
    print("\n1. Testing Original App:")
    original_results = []
    for i in range(3):  # Run 3 times for averaging
        print(f"   Run {i+1}...")
        result = test_original_app()
        if result['success']:
            original_results.append(result)
            print(f"   Success: {result['time']:.4f}s")
        else:
            print(f"   Failed: {result.get('error', 'Unknown error')}")

    # Test optimized app
    print("\n2. Testing Optimized App:")
    optimized_results = []
    for i in range(3):  # Run 3 times for averaging
        print(f"   Run {i+1}...")
        result = test_optimized_app()
        if result['success']:
            optimized_results.append(result)
            print(".4f"        else:
            print(f"   Failed: {result.get('error', 'Unknown error')}")

    # Calculate averages
    if original_results and optimized_results:
        avg_original_time = sum(r['time'] for r in original_results) / len(original_results)
        avg_optimized_time = sum(r['time'] for r in optimized_results) / len(optimized_results)
        speedup = avg_original_time / avg_optimized_time if avg_optimized_time > 0 else 0

        print("\n" + "=" * 60)
        print("RESULTS SUMMARY:")
        print("=" * 60)
        print(".4f"        print(".4f"        print(".2f"        print(f"Improvement: {((avg_original_time - avg_optimized_time) / avg_original_time * 100):.1f}% faster")

        # Additional features
        print("
Additional Features in Optimized Version:")
        print("  ✓ Confidence threshold filtering (0.3)")
        print("  ✓ File size validation (10MB limit)")
        print("  ✓ Enhanced error handling and logging")
        print("  ✓ Processing time tracking")
        print("  ✓ Additional recommendations integration")
        print("  ✓ Input validation and security improvements")

    else:
        print("\n❌ Unable to complete performance comparison due to test failures")

if __name__ == "__main__":
    run_performance_comparison()
