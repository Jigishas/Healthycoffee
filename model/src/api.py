from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import analyze_leaf

app = Flask(__name__)
# Allow CORS so the frontend can call this API from browsers
# Use a permissive origin during troubleshooting; restrict in production.
from flask_cors import CORS as _CORS
_CORS(app, resources={r"/*": {"origins": "*"}}, supports_credentials=True)


@app.after_request
def add_cors_headers(response):
    # Ensure Access-Control headers are always present even on errors
    response.headers.setdefault('Access-Control-Allow-Origin', '*')
    response.headers.setdefault('Access-Control-Allow-Methods', 'GET,POST,OPTIONS')
    response.headers.setdefault('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    return response

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    try:
        if 'image' not in request.files:
            return jsonify({'error': 'No image provided'}), 400

        file = request.files['image']
        os.makedirs('uploads', exist_ok=True)
        file_path = os.path.join('uploads', secure_filename(file.filename))
        file.save(file_path)

        try:
            result = analyze_leaf(file_path)
        except Exception as e:
            # Return a JSON error if analysis fails
            return jsonify({'error': f'Analysis failed: {str(e)}'}), 500

        return jsonify({'results': result})
    except Exception as e:
        return jsonify({'error': f'Internal server error: {str(e)}'}), 500

if __name__ == "__main__":
    # In production (Render), bind to 0.0.0.0 and use the PORT env var
    port = int(os.environ.get('PORT', 8000))
    app.run(host='0.0.0.0', port=port)