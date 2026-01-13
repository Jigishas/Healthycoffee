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

from src.inference import TorchClassifier, InteractiveCoffeeDiagnosis
from src.recommendations import get_additional_recommendations
from src.explanations import get_explanation, get_recommendation
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
# Allow CORS from any origin for now (helps Render / local testing).
# In production, restrict this to the frontend origin(s).
from flask_cors import CORS as _CORS
_CORS(app, resources={r"/*": {"origins": [
    "https://healthycoffee.vercel.app",
    "https://healthycoffee.vercel.app/",
    "https://healthycoffee.onrender.com",
    "https://healthycoffee.onrender.com/"
]}})

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

# Initialize interactive learning system
try:
    interactive_system = InteractiveCoffeeDiagnosis(
        'models/leaf_diseases/efficientnet_disease_balanced.pth',
        'models/leaf_diseases/class_mapping_diseases.json',
        'models/leaf_deficiencies/efficientnet_deficiency_balanced.pth',
        'models/leaf_deficiencies/class_mapping_deficiencies.json'
    )
    interactive_system_loaded = True
    logger.info("Interactive learning system initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize interactive learning system: {str(e)}")
    interactive_system = None
    interactive_system_loaded = False

# Keep legacy classifiers for backward compatibility
try:
    disease_classifier = OptimizedTorchClassifier(
        'models/leaf_diseases/efficientnet_disease_balanced.pth',
        'models/leaf_diseases/class_mapping_diseases.json',
        confidence_threshold=0.3
    )
    disease_model_type = 'interactive_optimized'
    disease_classifier_loaded = True
    logger.info("Disease classifier initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize disease classifier: {str(e)}")
    disease_classifier = None
    disease_model_type = 'failed'
    disease_classifier_loaded = False

try:
    deficiency_classifier = OptimizedTorchClassifier(
        'models/leaf_deficiencies/efficientnet_deficiency_balanced.pth',
        'models/leaf_deficiencies/class_mapping_deficiencies.json',
        confidence_threshold=0.3
    )
    deficiency_model_type = 'interactive_optimized'
    deficiency_classifier_loaded = True
    logger.info("Deficiency classifier initialized successfully")
except Exception as e:
    logger.error(f"Failed to initialize deficiency classifier: {str(e)}")
    deficiency_classifier = None
    deficiency_model_type = 'failed'
    deficiency_classifier_loaded = False

if not disease_classifier_loaded or not deficiency_classifier_loaded:
    logger.error("Critical: At least one model failed to load. Application may not function properly.")
else:
    logger.info("All models initialized successfully")

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    """Enhanced image upload endpoint with optimized models"""
    try:
        # Check if models are loaded
        if not disease_classifier_loaded or not deficiency_classifier_loaded:
            logger.error('Models not loaded properly')
            return jsonify({'error': 'Service temporarily unavailable - models not loaded'}), 503

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

            # Get explanations and recommendations
            disease_explanation = get_explanation(disease_result['class'], 'en')
            disease_recommendation = get_recommendation(disease_result['class'], 'en')
            deficiency_explanation = get_explanation(deficiency_result['class'], 'en')
            deficiency_recommendation = get_recommendation(deficiency_result['class'], 'en')

            # Clean up uploaded file
            os.remove(filepath)

            response_data = {
                'disease_prediction': {
                    **disease_result,
                    'explanation': disease_explanation,
                    'recommendation': disease_recommendation
                },
                'deficiency_prediction': {
                    **deficiency_result,
                    'explanation': deficiency_explanation,
                    'recommendation': deficiency_recommendation
                },
                'recommendations': recommendations,
                'translated_recommendations': {
                    'disease_explanation': disease_explanation,
                    'disease_recommendation': disease_recommendation,
                    'deficiency_explanation': deficiency_explanation,
                    'deficiency_recommendation': deficiency_recommendation
                },
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


@app.route('/', methods=['GET'])
def index():
    return jsonify({'status': 'ok', 'message': 'HealthyCoffee backend running', 'routes': ['/health', '/api/upload-image']}), 200

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

@app.route('/api/interactive-diagnose', methods=['POST'])
def interactive_diagnose():
    """Interactive diagnosis endpoint with learning capabilities"""
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

            # Get interactive diagnosis
            start_time = time.time()
            try:
                diagnosis_result = interactive_system.diagnose(filepath)
            except Exception as e:
                logger.error(f'Interactive diagnosis failed: {str(e)}')
                # Fallback to legacy classifiers
                disease_result = disease_classifier.predict(filepath)
                deficiency_result = deficiency_classifier.predict(filepath)

                diagnosis_result = {
                    'disease_prediction': {
                        **disease_result,
                        'similar_previous_cases': 0,
                        'certainty_level': 'Unknown'
                    },
                    'deficiency_prediction': {
                        **deficiency_result,
                        'similar_previous_cases': 0,
                        'certainty_level': 'Unknown'
                    },
                    'learning_stats': {
                        'disease_memory_size': 0,
                        'deficiency_memory_size': 0,
                        'disease_calibration_classes': 0,
                        'deficiency_calibration_classes': 0
                    },
                    'status': 'fallback_used'
                }
            total_time = time.time() - start_time

            # Add processing time to response
            diagnosis_result['processing_time'] = round(total_time, 4)
            diagnosis_result['model_version'] = 'interactive_learning_v1.0'

            # Clean up uploaded file
            os.remove(filepath)

            logger.info(f'Interactive diagnosis completed in {total_time:.4f}s')
            return jsonify(diagnosis_result)

        except Exception as e:
            logger.error(f'Interactive diagnosis error: {str(e)}')
            # Clean up on error
            if os.path.exists(filepath):
                os.remove(filepath)
            return jsonify({'error': f'Interactive diagnosis failed: {str(e)}'}), 500

    except Exception as e:
        logger.error(f'Unexpected error: {str(e)}')
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/feedback', methods=['POST'])
def provide_feedback():
    """Endpoint for users to provide feedback on predictions"""
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'No feedback data provided'}), 400

        image_path = data.get('image_path')
        disease_feedback = data.get('disease_feedback')
        deficiency_feedback = data.get('deficiency_feedback')

        if not image_path:
            return jsonify({'error': 'Image path is required for feedback'}), 400

        # Provide feedback to the interactive system
        feedback_result = interactive_system.provide_feedback(
            image_path,
            disease_feedback=disease_feedback,
            deficiency_feedback=deficiency_feedback
        )

        logger.info(f'Feedback incorporated: {feedback_result}')
        return jsonify(feedback_result)

    except Exception as e:
        logger.error(f'Feedback error: {str(e)}')
        return jsonify({'error': f'Feedback processing failed: {str(e)}'}), 500

@app.route('/api/learning-stats', methods=['GET'])
def learning_stats():
    """Get statistics about the interactive learning system"""
    try:
        # Get current learning statistics
        stats = {
            'disease_memory_size': len(interactive_system.disease_memory.memory),
            'deficiency_memory_size': len(interactive_system.deficiency_memory.memory),
            'disease_calibration_classes': len(interactive_system.disease_calibrator.calibration_map),
            'deficiency_calibration_classes': len(interactive_system.deficiency_calibrator.calibration_map),
            'disease_feature_classes': len(interactive_system.disease_classifier.feature_memory),
            'deficiency_feature_classes': len(interactive_system.deficiency_classifier.feature_memory),
            'timestamp': time.time()
        }

        return jsonify({
            'learning_statistics': stats,
            'status': 'success'
        })

    except Exception as e:
        logger.error(f'Learning stats error: {str(e)}')
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    logger.info(f'Starting combined Flask server on port {port}...')
    print(f"Starting server on port {port}")
    app.run(host='0.0.0.0', port=port, debug=False, threaded=True)
