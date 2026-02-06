#!/usr/bin/env python3
"""
Combined Production Flask Application (in-memory image processing)

Changes:
- No disk writes for uploaded images — images are processed in-memory.
- Cached lightweight classifiers are loaded once and reused to reduce
  repeated model load time (thread-safe lazy init).
"""

from flask import Flask, request, jsonify
from flask_cors import CORS, cross_origin
from flask_caching import Cache
from werkzeug.middleware.proxy_fix import ProxyFix
import os
import logging
import time
from io import BytesIO
import threading
from PIL import Image
import hashlib
import secrets

from src.recommendations import get_additional_recommendations
from src.explanations import get_explanation, get_recommendation
from src.inference import TorchClassifier

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[logging.FileHandler('app.log'), logging.StreamHandler()]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)

# Security: Generate secret key
app.secret_key = secrets.token_hex(32)

# Proxy fix for production deployments
app.wsgi_app = ProxyFix(app.wsgi_app, x_for=1, x_proto=1, x_host=1, x_port=1)

# Rate limiting - commented out for testing
# limiter = Limiter(
#     app=app,
#     key_func=get_remote_address,
#     default_limits=["100 per minute", "1000 per hour"]
# )

# Simple cache (Redis URL configurable)
cache = Cache(app, config={
    'CACHE_TYPE': 'redis',
    'CACHE_REDIS_URL': os.environ.get('REDIS_URL'),
    'CACHE_DEFAULT_TIMEOUT': 300
})

# CORS - Restrict origins for production
allowed_origins = os.environ.get('ALLOWED_ORIGINS', 'http://localhost:3000,http://127.0.0.1:3000,https://healthycoffee.vercel.app').split(',')
CORS(app, resources={
    r"/api/*": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"],
        "expose_headers": ["X-API-Version"],
        "max_age": 86400
    },
    r"/health": {
        "origins": allowed_origins,
        "methods": ["GET", "POST", "OPTIONS"],
        "allow_headers": ["Content-Type", "cache-control", "Cache-Control", "Authorization"],
        "max_age": 86400
    }
})

# File validation
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 10 * 1024 * 1024

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image_file(file):
    if not file or file.filename == '':
        return False, 'No file provided'
    if not allowed_file(file.filename):
        return False, 'Invalid file type. Only PNG, JPG, JPEG, and GIF are allowed'
    # Use stream to measure size without saving
    try:
        file.stream.seek(0, os.SEEK_END)
        size = file.stream.tell()
        file.stream.seek(0)
    except Exception:
        return False, 'Unable to read file size'
    if size > MAX_FILE_SIZE:
        return False, f'File too large. Maximum size is {MAX_FILE_SIZE/1024/1024}MB'
    return True, None

# Model configs
disease_classifier_config = {
    'model_path': 'models/leaf_diseases/efficientnet_disease_balanced.pth',
    'classes_path': 'models/leaf_diseases/class_mapping_diseases.json'
}
deficiency_classifier_config = {
    'model_path': 'models/leaf_deficiencies/efficientnet_deficiency_balanced.pth',
    'classes_path': 'models/leaf_deficiencies/class_mapping_deficiencies.json'
}

# Cached classifier instances
_model_lock = threading.Lock()
disease_classifier = None
deficiency_classifier = None

def get_classifiers():
    """Thread-safe lazy initialization of classifiers."""
    global disease_classifier, deficiency_classifier
    if disease_classifier is not None and deficiency_classifier is not None:
        return disease_classifier, deficiency_classifier
    with _model_lock:
        if disease_classifier is None:
            disease_classifier = TorchClassifier(
                disease_classifier_config['model_path'],
                disease_classifier_config['classes_path']
            )
        if deficiency_classifier is None:
            deficiency_classifier = TorchClassifier(
                deficiency_classifier_config['model_path'],
                deficiency_classifier_config['classes_path']
            )
    return disease_classifier, deficiency_classifier


@app.route('/api/v1/upload-image', methods=['POST', 'OPTIONS'])
def upload_image():
    if request.method == 'OPTIONS':
        response = app.make_response('')
        response.headers['X-API-Version'] = 'v1.0'
        return response, 204

    try:
        # Data privacy: Log request without storing image data
        client_ip = request.remote_addr
        user_agent = request.headers.get('User-Agent', 'Unknown')
        logger.info(f"Image upload request from {client_ip} - User-Agent: {user_agent[:100]}...")

        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided', 'api_version': 'v1.0'}), 400

        file = request.files['image']
        is_valid, err = validate_image_file(file)
        if not is_valid:
            return jsonify({'error': err, 'api_version': 'v1.0'}), 400

        # Read image bytes and open in-memory (data is not persisted)
        img_bytes = file.read()
        image_hash = hashlib.sha256(img_bytes).hexdigest()[:16]  # For logging only

        try:
            image = Image.open(BytesIO(img_bytes)).convert('RGB')
        except Exception as e:
            logger.error(f'Invalid image {image_hash}: {e}')
            return jsonify({'error': 'Invalid image file', 'api_version': 'v1.0'}), 400

        start = time.time()
        try:
            disease_clf, deficiency_clf = get_classifiers()
            disease_result = disease_clf.predict(image)
            deficiency_result = deficiency_clf.predict(image)
        except Exception as e:
            logger.exception(f'Model prediction failed for {image_hash}')
            disease_result = {'class': 'Unknown', 'confidence': 0.0, 'class_index': -1, 'inference_time': 0.0}
            deficiency_result = {'class': 'Unknown', 'confidence': 0.0, 'class_index': -1, 'inference_time': 0.0}
        total_time = time.time() - start

        # Clear image data from memory immediately
        del img_bytes
        del image

        try:
            recommendations = get_additional_recommendations(
                disease_class=disease_result.get('class_index', -1),
                deficiency_class=deficiency_result.get('class_index', -1)
            )
        except Exception:
            recommendations = [
                "Continue regular monitoring of your coffee plants",
                "Ensure proper watering and soil drainage",
                "Monitor for common pests and diseases"
            ]

        disease_explanation = get_explanation(disease_result.get('class', 'Unknown'), 'disease')
        disease_recommendation = get_recommendation(disease_result.get('class', 'Unknown'), 'disease')
        deficiency_explanation = get_explanation(deficiency_result.get('class', 'Unknown'), 'deficiency')
        deficiency_recommendation = get_recommendation(deficiency_result.get('class', 'Unknown'), 'deficiency')

        response = {
            'disease_prediction': {**disease_result, 'explanation': disease_explanation, 'recommendation': disease_recommendation},
            'deficiency_prediction': {**deficiency_result, 'explanation': deficiency_explanation, 'recommendation': deficiency_recommendation},
            'recommendations': recommendations,
            'processing_time': round(total_time, 4),
            'model_version': 'optimized_v1.0',
            'api_version': 'v1.0',
            'status': 'success'
        }

        logger.info(f"Analysis completed in {total_time:.4f}s for {image_hash} - Disease: {disease_result.get('class')}, Deficiency: {deficiency_result.get('class')}")
        return jsonify(response)

    except Exception as e:
        logger.exception('Unexpected error in upload_image')
        return jsonify({'error': 'Internal server error', 'api_version': 'v1.0'}), 500


@app.route('/api/interactive-diagnose', methods=['POST'])
def interactive_diagnose():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image file provided'}), 400
        file = request.files['image']
        is_valid, err = validate_image_file(file)
        if not is_valid:
            return jsonify({'error': err}), 400
        img_bytes = file.read()
        try:
            image = Image.open(BytesIO(img_bytes)).convert('RGB')
        except Exception:
            return jsonify({'error': 'Invalid image file'}), 400

        start = time.time()
        # interactive_system is optional; fallback to classifiers
        try:
            # Try interactive system if available
            if 'interactive_system' in globals() and interactive_system is not None:
                diagnosis_result = interactive_system.diagnose(image)
            else:
                raise RuntimeError('Interactive system not available')
        except Exception:
            disease_clf, deficiency_clf = get_classifiers()
            disease_result = disease_clf.predict(image)
            deficiency_result = deficiency_clf.predict(image)
            diagnosis_result = {
                'disease_prediction': {**disease_result, 'similar_previous_cases': 0, 'certainty_level': 'Unknown'},
                'deficiency_prediction': {**deficiency_result, 'similar_previous_cases': 0, 'certainty_level': 'Unknown'},
                'learning_stats': {'disease_memory_size': 0, 'deficiency_memory_size': 0, 'disease_calibration_classes': 0, 'deficiency_calibration_classes': 0},
                'status': 'fallback_used'
            }
        total_time = time.time() - start
        diagnosis_result['processing_time'] = round(total_time, 4)
        diagnosis_result['model_version'] = 'interactive_learning_v1.0'
        return jsonify(diagnosis_result)
    except Exception:
        logger.exception('Interactive diagnosis error')
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/health', methods=['GET', 'POST', 'OPTIONS'])
@cross_origin(origins=allowed_origins, methods=['GET', 'POST', 'OPTIONS'], allow_headers=['Content-Type', 'cache-control', 'Cache-Control'])
def health():
    if request.method == 'OPTIONS':
        response = app.make_response('')
        return response, 204
    try:
        if request.method == 'POST':
            data = request.get_json(silent=True)
            logger.info(f'Health ping: {data}')

        # Check if models are loaded
        disease_loaded = disease_classifier is not None
        deficiency_loaded = deficiency_classifier is not None

        response_data = {
            'status': 'healthy' if disease_loaded and deficiency_loaded else 'degraded',
            'timestamp': time.time(),
            'models_loaded': {
                'disease_model': disease_loaded,
                'deficiency_model': deficiency_loaded
            },
            'model_stats': {
                'disease': disease_classifier.get_stats() if disease_loaded and hasattr(disease_classifier, 'get_stats') else {},
                'deficiency': deficiency_classifier.get_stats() if deficiency_loaded and hasattr(deficiency_classifier, 'get_stats') else {}
            }
        }
        return jsonify(response_data), 200
    except Exception:
        logger.exception('Health check error')
        return jsonify({'status': 'unhealthy'}), 500


@app.route('/api/model-info', methods=['GET'])
@cache.cached(timeout=300)
def model_info():
    try:
        if disease_classifier is None or deficiency_classifier is None:
            return jsonify({'message': 'Models not loaded yet'}), 200
        disease_stats = disease_classifier.get_stats() if hasattr(disease_classifier, 'get_stats') else {}
        deficiency_stats = deficiency_classifier.get_stats() if hasattr(deficiency_classifier, 'get_stats') else {}
        return jsonify({
            'model_version': 'optimized_v1.0',
            'disease_classes': len(disease_classifier.classes) if hasattr(disease_classifier, 'classes') else None,
            'deficiency_classes': len(deficiency_classifier.classes) if hasattr(deficiency_classifier, 'classes') else None,
            'model_stats': {'disease': disease_stats, 'deficiency': deficiency_stats}
        })
    except Exception:
        logger.exception('Model info error')
        return jsonify({'error': 'Internal server error'}), 500


@app.route('/api/performance', methods=['GET'])
def performance():
    try:
        if disease_classifier is None or deficiency_classifier is None:
            return jsonify({'message': 'Models not loaded yet'}), 200
        disease_stats = disease_classifier.get_stats() if hasattr(disease_classifier, 'get_stats') else {'total_predictions': 0}
        deficiency_stats = deficiency_classifier.get_stats() if hasattr(deficiency_classifier, 'get_stats') else {'total_predictions': 0}
        total_preds = disease_stats.get('total_predictions', 0) + deficiency_stats.get('total_predictions', 0)
        return jsonify({'performance_metrics': {'disease_model': disease_stats, 'deficiency_model': deficiency_stats, 'total_predictions': total_preds}, 'timestamp': time.time()})
    except Exception:
        logger.exception('Performance error')
        return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    logger.info(f'Starting server on port {port}')
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
