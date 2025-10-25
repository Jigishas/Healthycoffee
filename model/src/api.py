from flask import Flask, request, jsonify
import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from app import analyze_leaf

app = Flask(__name__)

@app.route('/api/upload-image', methods=['POST'])
def upload_image():
    file = request.files['image']
    os.makedirs('uploads', exist_ok=True)
    file_path = f"uploads/{file.filename}"
    file.save(file_path)
    result = analyze_leaf(file_path)
    return jsonify({"results": result})

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8000)