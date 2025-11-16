#!/usr/bin/env python3
"""
Combined Production Flask Application with Optimized Models

This application deploys optimized models with enhanced performance monitoring
and error handling for the coffee leaf disease and deficiency detection system.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import sys
import tempfile
from werkzeug.utils import secure_filename
import logging
import json
import time
from pathlib import Path
import torch
from PIL import Image

from src.inference import TorchClassifier
from src.recommendations import get_additional_recommendations
from optimize_model import OptimizedTorchClassifier

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def validate_image_file(file):
    """Validate image file before processing"""
    if not file or file.filename == '':
        return False, 'No file provided'

    if not allowed_file(file.filename):
        return False, 'Invalid file type. Only PNG, JPG, JPEG, and GIF are allowed'

    # Check file size
    file.seek(0, os.SEEK_END)
    file_size = file.tell()
    file.seek(0)
    if file_size > MAX_FILE_SIZE:
        return False, f'File too large. Maximum size is {MAX_FILE_SIZE/1024/1024}MB'

    return True, None

# Initialize classifiers with optimized models
disease_classifier = OptimizedTorchClassifier(
    'models/leaf_diseases/efficientnet_disease_balanced.pth',
    'models/leaf_diseases/class_mapping_diseases.json',
    confidence_threshold=0.3
)
disease_model_type = 'optimized'

deficiency_classifier = OptimizedTorchClassifier(
    'models/leaf_deficiencies/efficientnet_deficiency_balanced.pth',
    'models/leaf_deficiencies/class_mapping_deficiencies.json',
    confidence_threshold=0.3
)
deficiency_model_type = 'optimized'

logger.info(f"Models loaded - Disease: {disease_model_type}, Deficiency: {deficiency_model_type}")

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    """Enhanced image upload endpoint with optimized models"""
    try:
        if 'image' not in request.files:
            logger.warning('No image file in request')
            return jsonify({'error': 'No image file provided'}), 400

        file = request.files['image']

        # Validate file
        is_valid, error_msg = validate_image_file(file)
        if not is_valid:
            logger.warning(f'File validation failed: {error_msg}')
            return jsonify({'error': error_msg}), 400

        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)

        try:
            file.save(filepath)
            logger.info(f'File saved: {filepath}')

            # Get predictions with timing
            start_time = time.time()

            # Run predictions in parallel for faster response
            import threading
            results = {}
            errors = {}

            def predict_disease():
                try:
                    results['disease'] = disease_classifier.predict(filepath)
                except Exception as e:
                    errors['disease'] = str(e)

            def predict_deficiency():
                try:
                    results['deficiency'] = deficiency_classifier.predict(filepath)
                except Exception as e:
                    errors['deficiency'] = str(e)

            # Start threads
            disease_thread = threading.Thread(target=predict_disease)
            deficiency_thread = threading.Thread(target=predict_deficiency)

            disease_thread.start()
            deficiency_thread.start()

            # Wait for both to complete
            disease_thread.join()
            deficiency_thread.join()

            total_time = time.time() - start_time

            # Check for errors
            if 'disease' in errors:
                raise Exception(f"Disease prediction failed: {errors['disease']}")
            if 'deficiency' in errors:
                raise Exception(f"Deficiency prediction failed: {errors['deficiency']}")

            disease_result = results['disease']
            deficiency_result = results['deficiency']

            # Get additional recommendations
            recommendations = get_additional_recommendations(
                disease_class=disease_result['class_index'],
                deficiency_class=deficiency_result['class_index']
            )

            # Clean up uploaded file
            os.remove(filepath)

            response_data = {
                'disease_prediction': disease_result,
                'deficiency_prediction': deficiency_result,
                'recommendations': recommendations,
                'processing_time': round(total_time, 4),
                'model_version': f'{disease_model_type}_{deficiency_model_type}_v1.0',
                'status': 'success'
            }

            logger.info(f'Prediction completed in {total_time:.4f}s')
            return jsonify(response_data)

        except Exception as e:
            logger.error(f'Prediction error: {str(e)}')
            # Clean up on error
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': f'Prediction failed: {str(e)}'}), 500

    except Exception as e:
        logger.error(f'Unexpected error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/health', methods=['GET'])
def health():
    """Enhanced health check with model statistics"""
    try:
        # Get stats based on model type
        if hasattr(disease_classifier, 'get_stats'):
            disease_stats = disease_classifier.get_stats()
        else:
            disease_stats = {'total_predictions': 0, 'average_confidence': 0, 'model_type': 'optimized'}

        if hasattr(deficiency_classifier, 'get_stats'):
            deficiency_stats = deficiency_classifier.get_stats()
        else:
            deficiency_stats = {'total_predictions': 0, 'average_confidence': 0, 'model_type': 'optimized'}

        return jsonify({
            'status': 'healthy',
            'models_loaded': {
                'disease_model': True,
                'deficiency_model': True,
                'disease_model_type': disease_model_type,
                'deficiency_model_type': deficiency_model_type,
                'model_version': f'{disease_model_type}_{deficiency_model_type}_v1.0'
            },
            'model_stats': {
                'disease': disease_stats,
                'deficiency': deficiency_stats
            },
            'timestamp': time.time()
        })
    except Exception as e:
        logger.error(f'Health check error: {e}')
        return jsonify({'status': 'unhealthy', 'error': str(e)}), 500

@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Get detailed information about loaded models"""
    try:
        # Get stats based on model type
        if hasattr(disease_classifier, 'get_stats'):
            disease_stats = disease_classifier.get_stats()
        else:
            disease_stats = {'total_predictions': 0, 'average_confidence': 0, 'model_type': 'optimized'}

        if hasattr(deficiency_classifier, 'get_stats'):
            deficiency_stats = deficiency_classifier.get_stats()
        else:
            deficiency_stats = {'total_predictions': 0, 'average_confidence': 0, 'model_type': 'optimized'}

        return jsonify({
            'model_version': f'{disease_model_type}_{deficiency_model_type}_v1.0',
            'disease_classes': len(disease_classifier.classes),
            'deficiency_classes': len(deficiency_classifier.classes),
            'device': str(disease_classifier.device),
            'optimized_models': disease_model_type == 'optimized' and deficiency_model_type == 'optimized',
            'model_stats': {
                'disease': disease_stats,
                'deficiency': deficiency_stats
            }
        })
    except Exception as e:
        logger.error(f'Model info error: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/performance', methods=['GET'])
def performance():
    """Get performance metrics and statistics"""
    try:
        # Get stats based on model type
        if hasattr(disease_classifier, 'get_stats'):
            disease_stats = disease_classifier.get_stats()
        else:
            disease_stats = {'total_predictions': 0, 'average_confidence': 0, 'model_type': 'optimized'}

        if hasattr(deficiency_classifier, 'get_stats'):
            deficiency_stats = deficiency_classifier.get_stats()
        else:
            deficiency_stats = {'total_predictions': 0, 'average_confidence': 0, 'model_type': 'optimized'}

        return jsonify({
            'performance_metrics': {
                'disease_model': disease_stats,
                'deficiency_model': deficiency_stats,
                'total_predictions': disease_stats['total_predictions'] + deficiency_stats['total_predictions']
            },
            'model_version': f'{disease_model_type}_{deficiency_model_type}_v1.0',
            'timestamp': time.time()
        })
    except Exception as e:
        logger.error(f'Performance metrics error: {e}')
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info('Starting combined Flask server...')
    app.run(host='0.0.0.0', port=8000, debug=False, threaded=True)
