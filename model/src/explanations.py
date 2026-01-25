"""
Explanations and recommendations for coffee leaf diseases and deficiencies
"""

def get_explanation(disease_class, language='en'):
    """
    Get explanation for a disease class
    """
    explanations = {
        "Cercospora Leaf Spot (Cercospora coffeicola)": "Cercospora leaf spot is a widespread fungal disease that affects coffee plants globally, particularly in regions with high humidity and frequent rainfall. The disease manifests as small, circular brown to grey spots on leaves that gradually enlarge and coalesce, forming irregular patches of dead tissue. In severe infections, this can lead to premature defoliation, significantly reducing the plant's photosynthetic capacity and causing yield losses of up to 30-50% in untreated coffee plantations. The fungus thrives in warm, humid conditions and can spread rapidly during prolonged wet periods.",
        "Healthy": "Leaf shows no visible disease symptoms. Uniform green color and normal texture.",
        "Phoma Leaf Blight (Phoma spp.)": "A fungal disease causing dark brown to black lesions on coffee leaves, often with yellow halos, leading to leaf necrosis and defoliation.",
        "Coffee Leaf Rust (Hemileia vastatrix)": "A devastating fungal disease causing orange-yellow powdery spots on leaves, leading to defoliation and significant yield loss.",
        "Coffee Berry Disease (Colletotrichum kahawae)": "A destructive fungal disease affecting coffee berries, causing dark sunken lesions and significant crop loss.",
        "Root Rot Complex (Multiple Pathogens)": "A complex of fungal pathogens causing root system destruction, leading to plant decline and death.",
        "Bacterial Blight (Pseudomonas syringae)": "A bacterial disease causing leaf spots, twig dieback, and cankers, often exacerbated by wet conditions.",
        "Anthracnose (Colletotrichum gloeosporioides)": "A fungal disease causing leaf spots, berry rot, and dieback, particularly in humid conditions.",
        "Nematode Infestation (Multiple Species)": "Microscopic worms attacking coffee roots, causing gall formation, reduced vigor, and yield decline.",
        "Uncertain": "Model confidence too low for reliable prediction. Please try with a clearer image or consult an expert."
    }

    return explanations.get(disease_class, "No explanation available for this condition.")

def get_recommendation(disease_class, language='en'):
    """
    Get recommendation for a disease class
    """
    recommendations = {
        "Cercospora Leaf Spot (Cercospora coffeicola)": "Apply copper-based fungicides preventively. Improve air circulation through proper pruning. Remove and destroy infected leaves. Maintain proper plant spacing.",
        "Healthy": "Continue good agronomic practices including balanced fertilization, proper pruning, and regular monitoring for early disease detection.",
        "Phoma Leaf Blight (Phoma spp.)": "Apply benzimidazole fungicides like thiophanate-methyl. Prune infected branches and remove fallen leaves. Avoid mechanical injury during cultivation.",
        "Coffee Leaf Rust (Hemileia vastatrix)": "Apply systemic fungicides like triazoles. Plant resistant varieties. Improve shade management. Regular monitoring during wet season.",
        "Coffee Berry Disease (Colletotrichum kahawae)": "Apply copper-based fungicides before flowering. Plant resistant varieties like Batian or Ruiru 11. Remove and destroy infected berries.",
        "Root Rot Complex (Multiple Pathogens)": "Improve soil drainage. Use certified disease-free planting material. Apply fungicides as soil drenches. Avoid waterlogging.",
        "Bacterial Blight (Pseudomonas syringae)": "Apply copper-based bactericides. Use pathogen-free planting material. Avoid overhead irrigation. Prune during dry weather.",
        "Anthracnose (Colletotrichum gloeosporioides)": "Apply protective fungicides like chlorothalonil. Prune to improve air circulation. Remove infected plant debris.",
        "Nematode Infestation (Multiple Species)": "Use resistant rootstocks. Apply nematicides. Practice crop rotation. Improve soil health with organic matter.",
        "Uncertain": "Please try with a clearer image or consult an agricultural expert for accurate diagnosis and treatment recommendations."
    }

    return recommendations.get(disease_class, "Consult agricultural extension services for specific recommendations.")
