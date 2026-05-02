def get_additional_recommendations(disease_class, deficiency_class):
    """
    Provides additional recommendations based on predicted disease and deficiency.
    """
    # Simple fallback recommendations since class data was truncated
    return {
        'disease_recommendations': {
            'class': str(disease_class),
            'recommendation': 'Monitor plants regularly and apply appropriate fungicides based on local recommendations.',
            'severity': 'medium'
        },
        'deficiency_recommendations': {
            'class': str(deficiency_class),
            'recommendation': 'Conduct soil test and apply balanced NPK fertilizer.',
            'severity': 'low'
        },
        'products': ['Copper-based fungicide', 'Mancozeb', 'Balanced NPK fertilizer'],
        'varieties': ['Catuai (moderate resistance)', 'Catimor (high resistance)']
    }

def get_uncertain_recommendations():
    """
    Recommendations when prediction confidence is low.
    """
    return {
        'disease_name': 'Uncertain Diagnosis',
        'recommendation': 'Retake photo with better lighting. Consult local agricultural expert.',
        'confidence': 'low',
        'next_steps': ['Improve image quality', 'Field inspection', 'Soil testing']
    }
