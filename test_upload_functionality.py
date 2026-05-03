#!/usr/bin/env python3
"""
Test script for upload functionality
"""

import requests
import json
import os
from pathlib import Path

def test_upload_functionality():
    """Test the complete upload and analysis flow"""

    # Test image path
    test_image_path = "model/test_dataset/deficiencies/healthy/test_image.jpg"

    if not os.path.exists(test_image_path):
        print(f"❌ Test image not found: {test_image_path}")
        return False

    print("🖼️  Found test image:", test_image_path)

    # Backend URL (local for testing)
LOCAL_PORT = int(os.environ.get('BACKEND_PORT', '8002'))
backend_url = f"http://127.0.0.1:{LOCAL_PORT}"

    print(f"🔗 Testing backend at: {backend_url}")

    try:
        # Test health endpoint first
        print("\n🏥 Testing health endpoint...")
        health_response = requests.get(f"{backend_url}/health", timeout=10)
        print(f"   Status: {health_response.status_code}")

        if health_response.status_code != 200:
            print("❌ Health check failed")
            return False

        health_data = health_response.json()
        print(f"   Response: {json.dumps(health_data, indent=2)}")
        print("✅ Health endpoint working")

        # Test upload endpoint
        print("\n📤 Testing upload endpoint...")
        upload_url = f"{backend_url}/api/v1/upload-image"

        with open(test_image_path, 'rb') as image_file:
            files = {'image': ('test_image.jpg', image_file, 'image/jpeg')}
            upload_response = requests.post(upload_url, files=files, timeout=30)

        print(f"   Status: {upload_response.status_code}")

        if upload_response.status_code == 200:
            result = upload_response.json()
            print("✅ Upload successful!")
            print("📊 Analysis Results:")
            print(json.dumps(result, indent=2))

            # Validate response structure
            if 'disease_prediction' in result and 'deficiency_prediction' in result:
                print("✅ Response structure correct")
                return True
            else:
                print("❌ Response structure incorrect")
                return False
        else:
            print(f"❌ Upload failed with status {upload_response.status_code}")
            try:
                error_data = upload_response.json()
                print(f"   Error: {json.dumps(error_data, indent=2)}")
            except:
                print(f"   Response: {upload_response.text}")
            return False

    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to backend. Is it running?")
        print("   Start the backend with: cd model && python app.py")
        return False
    except Exception as e:
        print(f"❌ Test failed with error: {str(e)}")
        return False

if __name__ == "__main__":
    print("🚀 Testing Upload Functionality")
    print("=" * 50)

    success = test_upload_functionality()

    print("\n" + "=" * 50)
    if success:
        print("🎉 All tests passed! Upload functionality is working.")
    else:
        print("❌ Tests failed. Check the issues above.")
