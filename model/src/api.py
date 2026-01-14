from flask import Flask, request, jsonify
from flask_cors import CORS
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import analyze_leaf

app = Flask(__name__)
# Allow CORS so the frontend can call this API from browsers
CORS(app, resources={r"/*": {"origins": [
    "https://healthycoffee.vercel.app",
    "https://healthycoffee.vercel.app/"
]}})

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    file = request.files['image']
    os.makedirs('uploads', exist_ok=True)
    file_path = f"uploads/{file.filename}"
    file.save(file_path)
    result = analyze_leaf(file_path)
    return jsonify({"results": result})

if __name__ == "__main__":
    # In production (Render), bind to 0.0.0.0 and use the PORT env var
    port = int(os.environ.get("PORT", 8000))
    app.run(host='0.0.0.0', port=port)