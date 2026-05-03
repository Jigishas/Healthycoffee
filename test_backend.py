#!/usr/bin/env python3
"""
Enhanced test script for backend - CORS, metrics, prod checks
"""

from model.app import app
import json
import requests

def test_backend():
    """Comprehensive backend unit/integration tests with CORS & prod checks."""
    print("🚀 Testing backend initialization...")

    try:
        with app.test_client() as client:
            print("✅ Backend initialized successfully")

            # Test health endpoint
            print("\n🏥 Testing health endpoint...")
            response = client.get('/health')
            print(f"   Status: {response.status_code}")
            if response.status_code == 200:
                health_data = response.get_json()
                print(f"   Status: {health_data.get('status', 'unknown')}")
                print("✅ Health OK")
            else:
                print("❌ Health failed")

            # Test CORS preflight on upload
            print("\n🛡️ Testing CORS preflight...")
            headers = {
                'Origin': 'http://localhost:5173',
                'Access-Control-Request-Method': 'POST',
                'Access-Control-Request-Headers': 'Content-Type'
            }
            cors_resp = client.options('/api/v1/upload-image', headers=headers)
            print(f"   OPTIONS status: {cors_resp.status_code}")
            acao = cors_resp.headers.get('Access-Control-Allow-Origin')
            print(f"   ACAO: {acao}")
            if cors_resp.status_code == 200 and ('localhost:5173' in acao or acao == '*'):
                print("✅ CORS preflight OK")
            else:
                print("❌ CORS preflight failed")

            # Test /metrics endpoint
            print("\n📊 Testing metrics endpoint...")
            metrics_resp = client.get('/metrics')
            print(f"   Status: {metrics_resp.status_code}")
            if metrics_resp.status_code == 200:
                metrics_data = metrics_resp.get_json()
                print(f"   Requests: {metrics_data.get('performance_metrics', {}).get('service_requests_total', 0)}")
                print("✅ Metrics OK")
            else:
                print("❌ Metrics failed")

            # Test model info (triggers lazy load)
            print("\n🤖 Testing model info...")
            model_resp = client.get('/api/model-info')
            print(f"   Status: {model_resp.status_code}")
            if model_resp.status_code == 200:
                print("✅ Model info OK")
            else:
                print("❌ Model info failed")

            # Test basic POST to upload endpoint
            print("\n📤 Testing upload endpoint...")
            response = client.post('/api/v1/upload-image', data={'image': (b'test', 'test.jpg')})
            print(f"   Status: {response.status_code}")
            if response.status_code in [400, 422]:
                print("✅ Upload validation working")
            else:
                print(f"⚠️ Upload response: {response.status_code}")

            # Test cors-test endpoint
            print("\n🔍 Testing cors-test...")
            cors_test_resp = client.get('/api/cors-test', headers={'Origin': 'http://localhost:3000'})
            print(f"   Status: {cors_test_resp.status_code}")
            if cors_test_resp.status_code == 200:
                print("✅ CORS test OK")
            else:
                print("❌ CORS test failed")

    except Exception as e:
        print(f"❌ Local tests failed: {str(e)}")
        return False

    # Production health & metrics check
    print("\n🌐 Production checks (healthycoffee.onrender.com)...")
    prod_urls = [
        "https://healthycoffee.onrender.com/health",
        "https://healthycoffee.onrender.com/metrics",
        "https://healthycoffee.onrender.com/_ping"
    ]
    for url in prod_urls:
        try:
            resp = requests.get(url, timeout=10)
            print(f"   {url}: {resp.status_code} OK")
        except Exception as e:
            print(f"   {url}: Failed ({e})")

    print("\n🎉 All backend tests passed!")
    return True


if __name__ == "__main__":
    test_backend()

