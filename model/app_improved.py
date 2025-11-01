#!/usr/bin/env python3
"""
Improved Coffee Leaf Disease & Deficiency Detection Backend

This backend integrates the newly trained improved models with enhanced performance
monitoring, better error handling, and optimized for the expanded dataset.
"""

from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import logging
import time
from pathlib import Path
import torch
from PIL import Image
from werkzeug.utils import secure_filename

from src.inference import TorchClassifier
from src.recommendations import get_additional_recommendations

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('app_improved.log'),
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
IMPROVED_MODELS_DIR = Path('../model_improvement/fine_tuning')

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

class ImprovedTorchClassifier(TorchClassifier):
    """Enhanced classifier with improved model loading and monitoring"""

    def __init__(self, model_path, mapping_path, improved_model_path, model_type):
        # Initialize with original model path for architecture
        super().__init__(model_path, mapping_path)

        # Load improved weights
        try:
            improved_state = torch.load(improved_model_path, map_location=self.device)
            self.model.load_state_dict(improved_state)
            logger.info(f"Successfully loaded improved {model_type} model weights from {improved_model_path}")
        except Exception as e:
            logger.error(f"Failed to load improved {model_type} model: {e}")
            raise

        self.model_type = model_type
        self.prediction_count = 0
        self.confidence_sum = 0.0
        self.total_processing_time = 0.0

    def predict(self, image_path):
        """Enhanced prediction with monitoring"""
        start_time = time.time()
        result = super().predict(image_path)
        processing_time = time.time() - start_time

        # Update monitoring stats
        self.prediction_count += 1
        self.confidence_sum += result['confidence']
        self.total_processing_time += processing_time

        # Log prediction details
        logger.info(f"{self.model_type} prediction: {result['class']} "
                   f"(confidence: {result['confidence']:.4f}, "
                   f"time: {processing_time:.4f}s)")

        # Add processing time to result
        result['processing_time'] = processing_time
        return result

    def get_stats(self):
        """Get prediction statistics"""
        avg_confidence = self.confidence_sum / self.prediction_count if self.prediction_count > 0 else 0
        avg_processing_time = self.total_processing_time / self.prediction_count if self.prediction_count > 0 else 0
        return {
            'total_predictions': self.prediction_count,
            'average_confidence': avg_confidence,
            'average_processing_time': avg_processing_time,
            'model_type': self.model_type
        }

# Initialize improved classifiers
logger.info("Initializing improved models...")

# Load improved disease model
disease_classifier = ImprovedTorchClassifier(
    'models/leaf_diseases/efficientnet_disease_balanced.pth',
    'models/leaf_diseases/class_mapping_diseases.json',
    str(IMPROVED_MODELS_DIR / 'improved_disease_model.pth'),
    'disease'
)

# Load improved deficiency model
deficiency_classifier = ImprovedTorchClassifier(
    'models/leaf_deficiencies/efficientnet_deficiency_balanced.pth',
    'models/leaf_deficiencies/class_mapping_deficiencies.json',
    str(IMPROVED_MODELS_DIR / 'improved_deficiency_model.pth'),
    'deficiency'
)

logger.info("Improved models loaded successfully - Ready for predictions")

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    """Enhanced image upload endpoint with improved models"""
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

            disease_result = disease_classifier.predict(filepath)
            deficiency_result = deficiency_classifier.predict(filepath)

            total_time = time.time() - start_time

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
                'model_version': 'improved_v2.0',
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
        disease_stats = disease_classifier.get_stats()
        deficiency_stats = deficiency_classifier.get_stats()

        return jsonify({
            'status': 'healthy',
            'models_loaded': {
                'disease_model': True,
                'deficiency_model': True,
                'disease_model_type': 'improved',
                'deficiency_model_type': 'improved',
                'model_version': 'improved_v2.0'
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
        disease_stats = disease_classifier.get_stats()
        deficiency_stats = deficiency_classifier.get_stats()

        return jsonify({
            'model_version': 'improved_v2.0',
            'disease_classes': len(disease_classifier.classes),
            'deficiency_classes': len(deficiency_classifier.classes),
            'device': str(disease_classifier.device),
            'improved_models': True,
            'model_stats': {
                'disease': disease_stats,
                'deficiency': deficiency_stats
            },
            'training_info': {
                'dataset': 'expanded_dataset',
                'architecture': 'EfficientNet_B0',
                'fine_tuned': True
            }
        })
    except Exception as e:
        logger.error(f'Model info error: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/performance', methods=['GET'])
def performance():
    """Get performance metrics and statistics"""
    try:
        disease_stats = disease_classifier.get_stats()
        deficiency_stats = deficiency_classifier.get_stats()

        return jsonify({
            'performance_metrics': {
                'disease_model': disease_stats,
                'deficiency_model': deficiency_stats,
                'total_predictions': disease_stats['total_predictions'] + deficiency_stats['total_predictions']
            },
            'model_version': 'improved_v2.0',
            'timestamp': time.time()
        })
    except Exception as e:
        logger.error(f'Performance metrics error: {e}')
        return jsonify({'error': str(e)}), 500

@app.route('/api/reset-stats', methods=['POST'])
def reset_stats():
    """Reset prediction statistics"""
    try:
        disease_classifier.prediction_count = 0
        disease_classifier.confidence_sum = 0.0
        disease_classifier.total_processing_time = 0.0

        deficiency_classifier.prediction_count = 0
        deficiency_classifier.confidence_sum = 0.0
        deficiency_classifier.total_processing_time = 0.0

        logger.info('Prediction statistics reset')
        return jsonify({'status': 'statistics_reset', 'timestamp': time.time()})
    except Exception as e:
        logger.error(f'Reset stats error: {e}')
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    logger.info('Starting improved Flask server...')
    app.run(host='0.0.0.0', port=8000, debug=False, threaded=True)
