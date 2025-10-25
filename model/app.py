from flask import Flask, request, jsonify
from flask_cors import CORS
import torch
from torchvision import models, transforms
from PIL import Image
import json
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from src.recommendations import get_additional_recommendations

VAL_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor()
])

def load_model_and_mapping(weights_path, mapping_path):
    with open(mapping_path, "r", encoding="utf-8") as f:
        mapping = json.load(f)
    num_classes = len(mapping)

    model = models.efficientnet_b0(weights="IMAGENET1K_V1")
    model.classifier[1] = torch.nn.Linear(model.classifier[1].in_features, num_classes)
    state_dict = torch.load(weights_path, map_location="cpu")
    model.load_state_dict(state_dict)
    model.eval()
    return model, mapping

# Load models once at startup
disease_model, disease_map = load_model_and_mapping(
    "models/leaf_diseases/efficientnet_disease_balanced.pth",
    "models/leaf_diseases/class_mapping_diseases.json"
)
deficiency_model, deficiency_map = load_model_and_mapping(
    "models/leaf_deficiencies/efficientnet_deficiency_balanced.pth",
    "models/leaf_deficiencies/class_mapping_deficiencies.json"
)

def run_inference(model, mapping, image, model_name=""):
    image = image.convert("RGB")
    input_tensor = VAL_TRANSFORM(image).unsqueeze(0)

    with torch.no_grad():
        outputs = model(input_tensor)
        probs = torch.nn.functional.softmax(outputs[0], dim=0)
        confidence, predicted_idx = torch.max(probs, dim=0)

    idx = str(predicted_idx.item())
    info = mapping.get(idx, {"name": idx})
    return {
        "prediction": {
            "class": info.get("name", idx),
            "class_index": idx,  # Add the index for recommendations
            "confidence": confidence.item(),
            "explanation": info.get("description", ""),
            "recommendation": info.get("recommendation", "")
        }
    }

def analyze_leaf(image_file):
    """Takes an uploaded file (from frontend) and returns both predictions."""
    image = Image.open(image_file)
    disease_result = run_inference(disease_model, disease_map, image, "Disease")
    deficiency_result = run_inference(deficiency_model, deficiency_map, image, "Deficiency")
    return {"disease": disease_result, "deficiency": deficiency_result}

app = Flask(__name__)
CORS(app)

def send_confirmation_email(email):
    """Send confirmation email to subscriber"""
    try:
        # Email configuration (replace with your actual SMTP settings)
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        sender_email = "your-email@gmail.com"  # Replace with your email
        sender_password = "your-app-password"  # Replace with your app password

        # Create message
        msg = MIMEMultipart()
        msg['From'] = sender_email
        msg['To'] = email
        msg['Subject'] = "Welcome to Coffee Plantation Newsletter!"

        body = f"""
        Dear Subscriber,

        Thank you for subscribing to our Coffee Plantation newsletter!

        You'll receive regular updates about:
        - Coffee disease management tips
        - Nutrient deficiency solutions
        - Best practices for healthy coffee plants
        - Latest research and recommendations

        Stay tuned for valuable insights to help your coffee plantation thrive!

        Best regards,
        Coffee Plantation Team
        """

        msg.attach(MIMEText(body, 'plain'))

        # Send email
        server = smtplib.SMTP(smtp_server, smtp_port)
        server.starttls()
        server.login(sender_email, sender_password)
        text = msg.as_string()
        server.sendmail(sender_email, email, text)
        server.quit()

        return True
    except Exception as e:
        print(f"Email sending failed: {str(e)}")
        return False

@app.route("/api/upload-image", methods=["POST"])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files['image']
    os.makedirs('uploads', exist_ok=True)
    file_path = f"uploads/{file.filename}"
    file.save(file_path)

    try:
        # Get predictions
        image = Image.open(file_path)
        disease_result = run_inference(disease_model, disease_map, image, "Disease")
        deficiency_result = run_inference(deficiency_model, deficiency_map, image, "Deficiency")
        
        disease_class_index = disease_result['prediction']['class_index']
        deficiency_class_index = deficiency_result['prediction']['class_index']

        # Debug print to check what's being passed
        print(f"Disease class index: {disease_class_index}")
        print(f"Deficiency class index: {deficiency_class_index}")

        recommendations = get_additional_recommendations(
            disease_class=disease_class_index,
            deficiency_class=deficiency_class_index
        )
        
        # Debug print recommendations
        print("Recommendations received:", recommendations)
        
        response = {
            "disease_prediction": disease_result['prediction'],
            "deficiency_prediction": deficiency_result['prediction'],
            "recommendations": recommendations
        }
        
        # Debug print final response
        print("Final response:", json.dumps(response, indent=2))
        
        return jsonify(response), 200
        
    except Exception as e:
        print(f"Error processing image: {str(e)}")
        return jsonify({"error": f"Failed to process image: {str(e)}"}), 500
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

@app.route("/api/subscribe", methods=["POST"])
def subscribe():
    data = request.get_json()
    email = data.get('email')

    if not email:
        return jsonify({"error": "Email is required"}), 400

    # Send confirmation email
    email_sent = send_confirmation_email(email)

    if email_sent:
        return jsonify({"message": "Confirmation email sent. Thank you for subscribing!"}), 200
    else:
        return jsonify({"error": "Failed to send confirmation email"}), 500

if __name__ == "__main__":
    app.run(host='127.0.0.1', port=8000)
