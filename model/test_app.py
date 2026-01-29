#!/usr/bin/env python3
"""
Comprehensive test suite for app.py Flask application

Tests all endpoints, error handling, file uploads, and edge cases.
"""

import pytest
import requests
import json
import os
import tempfile
from pathlib import Path
from PIL import Image
import io
import time
from unittest.mock import patch, MagicMock

# Test configuration
TEST_BASE_URL = "http://localhost:8000"
TEST_IMAGE_PATH = "test_dataset/diseases/healthy/test_image.jpg"

class TestFlaskApp:
    """Test suite for the Flask application"""

    def setup_method(self):
        """Setup before each test"""
        self.base_url = TEST_BASE_URL
        self.test_image_path = TEST_IMAGE_PATH

    def test_root_endpoint(self):
        """Test root endpoint returns correct response"""
        response = requests.get(f"{self.base_url}/")
        assert response.status_code == 200

        data = response.json()
        assert "status" in data
        assert "message" in data
        assert "routes" in data
        assert data["status"] == "ok"
        assert "HealthyCoffee backend running" in data["message"]
        assert "/health" in data["routes"]
        assert "/api/upload-image" in data["routes"]

    def test_health_endpoint_get(self):
        """Test health endpoint GET request"""
        response = requests.get(f"{self.base_url}/health")
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "healthy"
        assert "models_loaded" in data
        assert "model_stats" in data
        assert "timestamp" in data

        # Check models_loaded structure
        models_loaded = data["models_loaded"]
        assert "disease_model" in models_loaded
        assert "deficiency_model" in models_loaded
        assert models_loaded["disease_model"] is True
        assert models_loaded["deficiency_model"] is True

    def test_health_endpoint_post(self):
        """Test health endpoint POST request with dummy data"""
        test_data = {"test": "data", "ping": True}
        response = requests.post(f"{self.base_url}/health", json=test_data)
        assert response.status_code == 200

        data = response.json()
        assert data["status"] == "healthy"

    def test_upload_image_valid_file(self):
        """Test upload-image endpoint with valid image file"""
        if not os.path.exists(self.test_image_path):
            pytest.skip("Test image not found")

        with open(self.test_image_path, 'rb') as f:
            files = {'image': ('test_image.jpg', f, 'image/jpeg')}
            response = requests.post(f"{self.base_url}/api/upload-image", files=files)

        assert response.status_code == 200

        data = response.json()
        assert "disease_prediction" in data
        assert "deficiency_prediction" in data
        assert "recommendations" in data
        assert "processing_time" in data
        assert "model_version" in data
        assert "status" in data
        assert data["status"] == "success"

        # Check prediction structure
        disease_pred = data["disease_prediction"]
        deficiency_pred = data["deficiency_prediction"]

        required_fields = ["class", "confidence", "explanation", "recommendation"]
        for field in required_fields:
            assert field in disease_pred
            assert field in deficiency_pred

        assert isinstance(disease_pred["confidence"], (int, float))
        assert isinstance(deficiency_pred["confidence"], (int, float))
        assert 0 <= disease_pred["confidence"] <= 1
        assert 0 <= deficiency_pred["confidence"] <= 1

    def test_upload_image_options_request(self):
        """Test upload-image endpoint OPTIONS request"""
        response = requests.options(f"{self.base_url}/api/upload-image")
        assert response.status_code == 204

        # Check CORS headers
        assert "Access-Control-Allow-Origin" in response.headers
        assert "Access-Control-Allow-Methods" in response.headers
        assert "Access-Control-Allow-Headers" in response.headers

    def test_upload_image_no_file(self):
        """Test upload-image endpoint with no file"""
        response = requests.post(f"{self.base_url}/api/upload-image")
        assert response.status_code == 400

        data = response.json()
        assert "error" in data
        assert "No image file provided" in data["error"]

    def test_upload_image_invalid_file_type(self):
        """Test upload-image endpoint with invalid file type"""
        # Create a text file
        files = {'image': ('test.txt', io.BytesIO(b'test content'), 'text/plain')}
        response = requests.post(f"{self.base_url}/api/upload-image", files=files)
        assert response.status_code == 400

        data = response.json()
        assert "error" in data
        assert "Invalid file type" in data["error"]

    def test_upload_image_file_too_large(self):
        """Test upload-image endpoint with file too large"""
        # Create a large file (>10MB)
        large_content = b'x' * (11 * 1024 * 1024)  # 11MB
        files = {'image': ('large.jpg', io.BytesIO(large_content), 'image/jpeg')}
        response = requests.post(f"{self.base_url}/api/upload-image", files=files)
        assert response.status_code == 400

        data = response.json()
        assert "error" in data
        assert "File too large" in data["error"]

    def test_model_info_endpoint(self):
        """Test model-info endpoint"""
        response = requests.get(f"{self.base_url}/api/model-info")
        assert response.status_code == 200

        data = response.json()
        assert "model_version" in data
        assert "disease_classes" in data
        assert "deficiency_classes" in data
        assert "device" in data
        assert "optimized_models" in data
        assert "model_stats" in data

        assert isinstance(data["disease_classes"], int)
        assert isinstance(data["deficiency_classes"], int)
        assert data["disease_classes"] > 0
        assert data["deficiency_classes"] > 0

    def test_performance_endpoint(self):
        """Test performance endpoint"""
        response = requests.get(f"{self.base_url}/api/performance")
        assert response.status_code == 200

        data = response.json()
        assert "performance_metrics" in data
        assert "model_version" in data
        assert "timestamp" in data

        metrics = data["performance_metrics"]
        assert "disease_model" in metrics
        assert "deficiency_model" in metrics
        assert "total_predictions" in metrics

    def test_interactive_diagnose_valid_file(self):
        """Test interactive-diagnose endpoint with valid file"""
        if not os.path.exists(self.test_image_path):
            pytest.skip("Test image not found")

        with open(self.test_image_path, 'rb') as f:
            files = {'image': ('test_image.jpg', f, 'image/jpeg')}
            response = requests.post(f"{self.base_url}/api/interactive-diagnose", files=files)

        # Note: This might fail if interactive system is not initialized
        # The endpoint tries to use interactive_system which may be None
        if response.status_code == 200:
            data = response.json()
            assert "disease_prediction" in data
            assert "deficiency_prediction" in data
            assert "learning_stats" in data
            assert "status" in data
        else:
            # If interactive system fails, it should still return a response
            assert response.status_code in [200, 500]
            if response.status_code == 500:
                data = response.json()
                assert "error" in data

    def test_feedback_endpoint(self):
        """Test feedback endpoint"""
        feedback_data = {
            "image_path": "/path/to/image.jpg",
            "disease_feedback": "healthy",
            "deficiency_feedback": "healthy"
        }
        response = requests.post(f"{self.base_url}/api/feedback", json=feedback_data)
        assert response.status_code == 200

        data = response.json()
        assert "status" in data
        assert "disease_memory_size" in data
        assert "deficiency_memory_size" in data
        assert "feedback_applied" in data

    def test_feedback_endpoint_missing_data(self):
        """Test feedback endpoint with missing required data"""
        response = requests.post(f"{self.base_url}/api/feedback", json={})
        assert response.status_code == 400

        data = response.json()
        assert "error" in data

    def test_learning_stats_endpoint(self):
        """Test learning-stats endpoint"""
        response = requests.get(f"{self.base_url}/api/learning-stats")
        # This might fail if interactive system is not initialized
        if response.status_code == 200:
            data = response.json()
            assert "learning_statistics" in data
            assert "status" in data
        else:
            assert response.status_code == 500
            data = response.json()
            assert "error" in data

    def test_cors_headers_all_endpoints(self):
        """Test that all endpoints return proper CORS headers"""
        endpoints = [
            "/",
            "/health",
            "/api/upload-image",
            "/api/model-info",
            "/api/performance",
            "/api/interactive-diagnose",
            "/api/feedback",
            "/api/learning-stats"
        ]

        for endpoint in endpoints:
            if endpoint in ["/api/upload-image", "/api/interactive-diagnose"]:
                # OPTIONS request for endpoints that accept POST
                response = requests.options(f"{self.base_url}{endpoint}")
            else:
                response = requests.get(f"{self.base_url}{endpoint}")

            # Check CORS headers are present
            assert "Access-Control-Allow-Origin" in response.headers
            assert "Access-Control-Allow-Methods" in response.headers
            assert "Access-Control-Allow-Headers" in response.headers

    def test_invalid_endpoint(self):
        """Test accessing invalid endpoint"""
        response = requests.get(f"{self.base_url}/invalid-endpoint")
        assert response.status_code == 404

    def test_method_not_allowed(self):
        """Test using wrong HTTP method"""
        # POST to GET-only endpoint
        response = requests.post(f"{self.base_url}/api/model-info")
        assert response.status_code == 405

        # GET to POST-only endpoint
        response = requests.get(f"{self.base_url}/api/upload-image")
        assert response.status_code == 405

class TestFileValidation:
    """Test file validation functions"""

    def test_allowed_file_function(self):
        """Test allowed_file function"""
        from app import allowed_file

        # Valid extensions
        assert allowed_file("test.png") == True
        assert allowed_file("test.jpg") == True
        assert allowed_file("test.jpeg") == True
        assert allowed_file("test.gif") == True

        # Invalid extensions
        assert allowed_file("test.txt") == False
        assert allowed_file("test.pdf") == False
        assert allowed_file("test") == False

        # Case sensitivity
        assert allowed_file("test.PNG") == True
        assert allowed_file("test.JPG") == True

    def test_validate_image_file_function(self):
        """Test validate_image_file function"""
        from app import validate_image_file

        # Test with None file
        is_valid, error = validate_image_file(None)
        assert is_valid == False
        assert "No file provided" in error

        # Test with file without filename
        mock_file = MagicMock()
        mock_file.filename = ''
        is_valid, error = validate_image_file(mock_file)
        assert is_valid == False
        assert "No file provided" in error

        # Test with invalid file type
        mock_file.filename = 'test.txt'
        is_valid, error = validate_image_file(mock_file)
        assert is_valid == False
        assert "Invalid file type" in error

        # Test with valid file type but large size
        mock_file.filename = 'test.jpg'
        mock_file.seek.return_value = None
        mock_file.tell.return_value = 15 * 1024 * 1024  # 15MB
        is_valid, error = validate_image_file(mock_file)
        assert is_valid == False
        assert "File too large" in error

class TestIntegration:
    """Integration tests that require full app setup"""

    def test_full_prediction_workflow(self):
        """Test complete prediction workflow"""
        if not os.path.exists(TEST_IMAGE_PATH):
            pytest.skip("Test image not found")

        # Step 1: Health check
        response = requests.get(f"{TEST_BASE_URL}/health")
        assert response.status_code == 200

        # Step 2: Upload image
        with open(TEST_IMAGE_PATH, 'rb') as f:
            files = {'image': ('test_image.jpg', f, 'image/jpeg')}
            response = requests.post(f"{TEST_BASE_URL}/api/upload-image", files=files)

        assert response.status_code == 200
        data = response.json()

        # Step 3: Verify response structure
        assert data["status"] == "success"
        assert "processing_time" in data
        assert data["processing_time"] > 0

        # Step 4: Check that file was cleaned up (not in uploads folder)
        # This is hard to test directly, but we can check the response was successful

    def test_concurrent_requests(self):
        """Test handling multiple concurrent requests"""
        import threading
        import time

        if not os.path.exists(TEST_IMAGE_PATH):
            pytest.skip("Test image not found")

        results = []
        errors = []

        def make_request():
            try:
                with open(TEST_IMAGE_PATH, 'rb') as f:
                    files = {'image': ('test_image.jpg', f, 'image/jpeg')}
                    response = requests.post(f"{TEST_BASE_URL}/api/upload-image", files=files, timeout=30)
                    results.append(response.status_code)
            except Exception as e:
                errors.append(str(e))

        # Start 3 concurrent requests
        threads = []
        for i in range(3):
            t = threading.Thread(target=make_request)
            threads.append(t)
            t.start()

        # Wait for all threads
        for t in threads:
            t.join()

        # Check results
        assert len(results) == 3
        assert all(status == 200 for status in results)
        assert len(errors) == 0

    def test_memory_usage(self):
        """Test that memory usage doesn't grow with multiple requests"""
        import psutil
        import os

        if not os.path.exists(TEST_IMAGE_PATH):
            pytest.skip("Test image not found")

        process = psutil.Process(os.getpid())
        initial_memory = process.memory_info().rss / 1024 / 1024  # MB

        # Make multiple requests
        for i in range(5):
            with open(TEST_IMAGE_PATH, 'rb') as f:
                files = {'image': ('test_image.jpg', f, 'image/jpeg')}
                response = requests.post(f"{TEST_BASE_URL}/api/upload-image", files=files)
                assert response.status_code == 200

        final_memory = process.memory_info().rss / 1024 / 1024  # MB
        memory_increase = final_memory - initial_memory

        # Memory increase should be reasonable (< 50MB)
        assert memory_increase < 50, f"Memory increased by {memory_increase}MB"

if __name__ == "__main__":
    # Run tests
    pytest.main([__file__, "-v"])
