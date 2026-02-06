from flask import Flask, request, jsonify
from flask_cors import CORS
from optimize_model import LightweightTorchClassifier as OptimizedTorchClassifier
import os
import tempfile
from werkzeug.utils import secure_filename
import logging
import json
from src.recommendations import get_additional_recommendations

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app, origins=["https://healthycoffee.vercel.app", "http://localhost:3000"])

# Load optimized models with confidence threshold and preload for faster inference
disease_classifier = OptimizedTorchClassifier(
    'models/leaf_diseases/efficientnet_disease_balanced.pth',
    'models/leaf_diseases/class_mapping_diseases.json',
    confidence_threshold=0.3,
    preload=True
)
deficiency_classifier = OptimizedTorchClassifier(
    'models/leaf_deficiencies/efficientnet_deficiency_balanced.pth',
    'models/leaf_deficiencies/class_mapping_deficiencies.json',
    confidence_threshold=0.3,
    preload=True
)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = MAX_FILE_SIZE

def allowed_file(filename):
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

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
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
            import time
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
    return jsonify({
        'status': 'healthy',
        'models_loaded': {
            'disease_model': True,
            'deficiency_model': True
        }
    })

@app.route('/api/model-info', methods=['GET'])
def model_info():
    """Get information about loaded models"""
    return jsonify({
        'disease_classes': len(disease_classifier.classes),
        'deficiency_classes': len(deficiency_classifier.classes),
        'confidence_threshold': disease_classifier.confidence_threshold,
        'device': str(disease_classifier.device)
    })

if __name__ == '__main__':
    logger.info('Starting optimized Flask server...')
    app.run(host='0.0.0.0', port=8000, debug=False, threaded=True)
