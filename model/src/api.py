from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import analyze_leaf

app = Flask(__name__)
# Allow CORS so the frontend can call this API from browsers
# Use a permissive origin during troubleshooting; restrict in production.
from flask_cors import CORS as _CORS
_CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True, methods=['GET', 'POST', 'OPTIONS'])


@app.after_request
def add_cors_headers(response):
    # Ensure Access-Control headers are always present even on errors
    response.headers.setdefault('Access-Control-Allow-Origin', '*')
    response.headers.setdefault('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    response.headers.setdefault('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    return response

@app.route('/health', methods=['GET', 'POST', 'OPTIONS'])
def health_check():
    """Health check endpoint for frontend status verification"""
    if request.method == 'OPTIONS':
        return '', 204
    return jsonify({'status': 'healthy', 'service': 'leaf-analysis-api'})

@app.route('/api/upload-image', methods=['POST', 'OPTIONS'])
def upload_image():
    if request.method == 'OPTIONS':
        return '', 204
    
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        file = request.files['image']
        if file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        os.makedirs('uploads', exist_ok=True)
        file_path = os.path.join('uploads', secure_filename(file.filename))
        file.save(file_path)

        try:
            result = analyze_leaf(file_path)
        except Exception as e:
            # Return a JSON error if analysis fails
            return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

        return jsonify(result)
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

if __name__ == "__main__":
    # In production (Render), bind to 0.0.0.0 and use the PORT env var
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)