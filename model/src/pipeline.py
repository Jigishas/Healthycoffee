from src.preprocessing import preprocess_image
from src.leaf_model import LeafDiagnosisModel
from src.soil_model import SoilHealthEngine
from src.config import get_classes, get_region_context
from src.region import region_adjustment
from src.explanations import get_explanation

# Load configs/models
classes = get_classes()['leaf_classes']
region_context = get_region_context()['regions']

leaf_model = LeafDiagnosisModel()
soil_engine = SoilHealthEngine()

def diagnose_leaf(img_path, region='Mount Kenya', lang='en'):
    img_tensor = preprocess_image(img_path)
    pred_idx, conf = leaf_model.predict(img_tensor)
    class_name = leaf_model.get_class_name(pred_idx, classes)
    class_name = region_adjustment(class_name, region, region_context)
    explanation = get_explanation(class_name, lang)
    return {
        "diagnosis": class_name,
        "confidence": conf,
        "explanation": explanation
    }

def analyze_soil(soil_data, region='Mount Kenya'):
    # soil_data = {'pH': 'low', 'N': 'ideal', ...}
    recommendations = soil_engine.analyze(soil_data)
    # Optionally add region-specific tips
    return {"recommendations": recommendations}