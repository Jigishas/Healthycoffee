#!/usr/bin/env python3
"""
Test script for upload functionality
Tests the /api/v1/upload-image endpoint with a test image
"""

import requests
import os
import json
from pathlib import Path

def test_upload_endpoint():
    """Test the upload endpoint with a test image"""

    # Test image path
    test_image_path = "model/test_dataset/deficiencies/healthy/test_image.jpg"

    if not os.path.exists(test_image_path):
        print(f"❌ Test image not found: {test_image_path}")
        return False

    # Backend URLs to test
    urls = [
        "http://localhost:8000/api/v1/upload-image",  # Local development
        "https://healthycoffee.onrender.com/api/v1/upload-image"  # Production
    ]

    print("🧪 Testing upload functionality...")
    print(f"📁 Using test image: {test_image_path}")

    for url in urls:
        print(f"\n🌐 Testing URL: {url}")

        try:
            # Prepare the file for upload
            with open(test_image_path, 'rb') as f:
                files = {'image': ('test_image.jpg', f, 'image/jpeg')}
                headers = {'Accept': 'application/json'}

                print("📤 Sending upload request...")
                response = requests.post(url, files=files, headers=headers, timeout=30)

                print(f"📊 Response Status: {response.status_code}")

                if response.status_code == 200:
                    try:
                        result = response.json()
                        print("✅ Upload successful!")
                        print("📋 Response data:")
                        print(json.dumps(result, indent=2))

                        # Check if we got proper predictions
                        if 'disease_prediction' in result and 'deficiency_prediction' in result:
                            disease = result['disease_prediction']
                            deficiency = result['deficiency_prediction']

                            print("
🎯 Predictions:"                            print(f"   Disease: {disease.get('class', 'N/A')} (confidence: {disease.get('confidence', 0):.3f})")
                            print(f"   Deficiency: {deficiency.get('class', 'N/A')} (confidence: {deficiency.get('confidence', 0):.3f})")

                            if disease.get('confidence', 0) > 0 or deficiency.get('confidence', 0) > 0:
                                print("✅ Models are working correctly!")
                                return True
                            else:
                                print("⚠️  Models returned zero confidence - may need retraining")
                        else:
                            print("⚠️  Unexpected response format")

                    except json.JSONDecodeError:
                        print("❌ Invalid JSON response")
                        print(f"Raw response: {response.text[:500]}")

                elif response.status_code == 404:
                    print("❌ Endpoint not found - route mismatch")
                elif response.status_code == 500:
                    print("❌ Server error - check backend logs")
                    print(f"Error details: {response.text[:500]}")
                else:
                    print(f"❌ Unexpected status code: {response.status_code}")
                    print(f"Response: {response.text[:500]}")

        except requests.exceptions.ConnectionError:
            print("❌ Connection failed - server may be down")
        except requests.exceptions.Timeout:
            print("❌ Request timed out")
        except Exception as e:
            print(f"❌ Unexpected error: {str(e)}")

    return False

def test_health_endpoint():
    """Test the health endpoint"""
    urls = [
        "http://localhost:8000/health",
        "https://healthycoffee.onrender.com/health"
    ]

    print("\n🏥 Testing health endpoints...")

    for url in urls:
        try:
            print(f"🌐 Testing: {url}")
            response = requests.get(url, timeout=10)

            if response.status_code == 200:
                print("✅ Health check passed")
                try:
                    health_data = response.json()
                    print(f"   Status: {health_data.get('status', 'unknown')}")
                except:
                    print("   Health endpoint responding")
            else:
                print(f"❌ Health check failed: {response.status_code}")

        except Exception as e:
            print(f"❌ Health check error: {str(e)}")

if __name__ == "__main__":
    print("🚀 Starting upload functionality tests...\n")

    # Test health endpoints first
    test_health_endpoint()

    # Test upload functionality
    success = test_upload_endpoint()

    if success:
        print("\n🎉 All tests passed! Upload functionality is working correctly.")
    else:
        print("\n❌ Tests failed. Check the issues above and fix them.")
        print("\n🔧 Common fixes:")
        print("   1. Ensure backend server is running")
        print("   2. Check model files are properly loaded")
        print("   3. Verify API routes are correct")
        print("   4. Check CORS settings")
