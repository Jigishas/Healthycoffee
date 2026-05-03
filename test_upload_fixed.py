#!/usr/bin/env python3
"""
Fixed upload test script with dynamic port
"""
import requests
import os
import json
from pathlib import Path

LOCAL_PORT = int(os.environ.get('BACKEND_PORT', '8002'))

def test_upload_endpoint():
    test_image_path = "model/test_dataset/deficiencies/healthy/test_image.jpg"
    if not os.path.exists(test_image_path):
        print(f"❌ Test image not found: {test_image_path}")
        return False

    urls = [
        f"http://localhost:{LOCAL_PORT}/api/v1/upload-image",
        "https://healthycoffee.onrender.com/api/v1/upload-image"
    ]

    print("🧪 Testing upload...")
    print(f"📁 Image: {test_image_path}")

    for url in urls:
        print(f"\n🌐 URL: {url}")
        try:
            with open(test_image_path, 'rb') as f:
                files = {'image': ('test_image.jpg', f, 'image/jpeg')}
                headers = {'Accept': 'application/json'}

                print("📤 Uploading...")
                response = requests.post(url, files=files, headers=headers, timeout=30)
                print(f"Status: {response.status_code}")

                if response.status_code == 200:
                    result = response.json()
                    print("✅ Success!")
                    print(json.dumps(result, indent=2))
                    disease = result.get('disease_prediction', {})
                    if disease.get('confidence', 0) > 0:
                        print("✅ Models OK")
                        return True
                    else:
                        print("⚠️ Zero confidence")
                elif response.status_code == 500:
                    print("❌ 500 - Deploy fixes to Render")
                else:
                    print(f"Response: {response.text[:200]}")
        except Exception as e:
            print(f"Error: {e}")

    return False

if __name__ == '__main__':
    print("🚀 Upload Tests")
    success = test_upload_endpoint()
    print("✅ Local ready" if success else "❌ Check above")

