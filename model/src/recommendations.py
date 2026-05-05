"""
Comprehensive structured recommendations for coffee diseases and deficiencies.
Designed to match frontend UI/PDF expectations.
"""

def get_structured_recommendations(disease_class, deficiency_class, disease_confidence=0.5, deficiency_confidence=0.5):
    """
    Return comprehensive structured recommendations matching frontend expectations.
    
    Args:
        disease_class (str): Predicted disease class name
        deficiency_class (str): Predicted deficiency class name  
        disease_confidence (float): Prediction confidence
        deficiency_confidence (float): Deficiency confidence
    
    Returns:
        dict: Structured recommendations for frontend consumption
    """
    
    # DISEASE RECOMMENDATIONS - Detailed structure matching CameraCapture.jsx
    disease_recs = {
        "Healthy": {
            "disease_name": "Healthy",
            "current_severity": "None",
            "overview": "No disease symptoms detected. Plant appears healthy with normal leaf structure and coloration.",
            "symptoms": [],
            "integrated_management": {
                "cultural_practices": [
                    "Continue regular monitoring (weekly inspections)",
                    "Maintain balanced nutrition program", 
                    "Ensure proper irrigation scheduling",
                    "Practice good field sanitation"
                ],
                "chemical_control": [],
                "biological_control": []
            },
            "severity_specific_recommendations": {
                "immediate_actions": [],
                "long_term_strategies": [
                    "Plant disease-resistant varieties",
                    "Implement integrated pest management",
                    "Regular soil testing"
                ]
            },
            "coffee_specific_recommendations": {
                "shade_management": "Maintain 30-50% shade cover",
                "pruning_strategy": "Annual pruning to improve air circulation",
                "monitoring_frequency": "Weekly during wet season"
            }
        },
        "Cerscospora": {
            "disease_name": "Cercospora Leaf Spot (Cercospora coffeicola)",
            "current_severity": "Low" if disease_confidence < 0.7 else "Moderate",
            "overview": "Fungal disease causing small brown/gray lesions with light centers. Common in humid conditions, can lead to 20-40% defoliation if untreated.",
            "symptoms": [
                "Small circular brown spots with light centers",
                "Spots enlarge and merge into patches", 
                "Yellow halos around lesions",
                "Premature leaf drop in severe cases"
            ],
            "integrated_management": {
                "cultural_practices": [
                    "Improve air circulation through pruning",
                    "Avoid overhead irrigation",
                    "Remove and destroy fallen leaves",
                    "Maintain optimal plant spacing (1.5-2m)"
                ],
                "chemical_control": [
                    "Copper hydroxide (preventive)",
                    "Azoxystrobin (0.2g/L, 7-10 day intervals)",
                    "Mancozeb (2g/L, alternate with triazoles)"
                ],
                "biological_control": [
                    "Trichoderma spp. soil drench",
                    "Neem oil foliar spray"
                ]
            },
            "severity_specific_recommendations": {
                "immediate_actions": [
                    "Prune heavily infected branches",
                    "Apply copper spray within 48 hours",
                    "Increase monitoring frequency"
                ],
                "long_term_strategies": [
                    "Plant resistant varieties (Ruiru 11)",
                    "Soil solarization during dry season",
                    "Mulch to reduce soil splash"
                ],
                "spray_frequency": "Every 10-14 days during rainy season",
                "intervention_level": "High - treat all detected cases"
            }
        },
        "Leaf rust": {
            "disease_name": "Coffee Leaf Rust (Hemileia vastatrix)",
            "current_severity": "High" if disease_confidence > 0.7 else "Moderate",
            "overview": "Devastating fungal disease with orange powdery spores. Major threat to Arabica, can cause 50-70% yield loss.",
            "symptoms": [
                "Orange-yellow powdery spots on leaf undersides",
                "Yellowing and necrosis of leaf tissue",
                "Rapid defoliation",
                "Reduced berry size and quality"
            ],
            "integrated_management": {
                "cultural_practices": [
                    "Plant resistant varieties (Batian, Ruiru 11)",
                    "Maintain 40-60% shade cover",
                    "Prune lower branches for air flow",
                    "Remove volunteer plants"
                ],
                "chemical_control": [
                    "Triazoles (propiconazole 0.5ml/L)",
                    "Copper oxychloride (preventive)",
                    "Strobilurins (azoxystrobin)"
                ],
                "biological_control": [
                    "Lecanicillium lecanii mycoinsecticide",
                    "Neem oil + entomopathogenic fungi"
                ]
            },
            "severity_specific_recommendations": {
                "immediate_actions": [
                    "Quarantine affected area immediately",
                    "Apply systemic fungicide within 24h",
                    "Remove >20% infected leaves"
                ],
                "long_term_strategies": [
                    "Replace susceptible varieties",
                    "Establish windbreaks",
                    "Soil fertility management"
                ]
            }
        },
        "Phoma": {
            "disease_name": "Phoma Leaf Blight",
            "current_severity": "Moderate",
            "overview": "Fungal disease causing dark lesions with concentric rings. Favors cool, wet conditions.",
            "symptoms": [
                "Dark brown-black lesions with rings",
                "Yellow halos around spots",
                "Leaf blight and shot-hole",
                "Twig dieback in severe cases"
            ],
            "integrated_management": {
                "cultural_practices": [
                    "Sanitation - remove infected debris",
                    "Improve drainage",
                    "Avoid wounding plants"
                ],
                "chemical_control": [
                    "Thiophanate-methyl",
                    "Iprodione",
                    "Protectant fungicides"
                ],
                "biological_control": ["Trichoderma harzianum"]
            }
        },
        "miner": {
            "disease_name": "Coffee Leaf Miner",
            "current_severity": "Low-Moderate",
            "overview": "Insect larvae create serpentine mines in leaves, reducing photosynthetic area.",
            "symptoms": [
                "Serpentine tunnels in leaf tissue",
                "Premature leaf drop",
                "Reduced tree vigor"
            ],
            "integrated_management": {
                "cultural_practices": [
                    "Yellow sticky traps",
                    "Remove heavily mined leaves"
                ],
                "chemical_control": [
                    "Abamectin (0.3ml/L)",
                    "Spinosad (biological insecticide)"
                ],
                "biological_control": [
                    "Predatory wasps (Chrysocharis spp.)",
                    "Neem oil applications"
                ]
            }
        }
    }
    
    # DEFICIENCY RECOMMENDATIONS - Structure matching frontend
    deficiency_recs = {
        "Healthy": {
            "basic": ["Continue current fertilization program"],
            "symptoms": [],
            "management": ["Regular soil testing (annually)", "Balanced NPK applications"]
        },
        "boron-B": {
            "basic": ["Foliar boron spray (Solubor 1g/L)"],
            "symptoms": [
                "Thick brittle leaves",
                "Cracked stems",
                "Poor flowering"
            ],
            "management": [
                "Soil application of borax (careful dosing)",
                "Avoid over-liming",
                "Monitor irrigation water quality"
            ]
        },
        "calcium-Ca": {
            "basic": ["Gypsum application (2tons/ha)"],
            "symptoms": [
                "Distorted young leaves",
                "Tip burn",
                "Weak cell walls"
            ],
            "management": [
                "Agricultural lime for acidic soils",
                "Calcium nitrate foliar spray",
                "Balance with potassium levels"
            ]
        },
        "iron-Fe": {
            "basic": ["Fe-EDDHA chelate (1-2g/L foliar)"],
            "symptoms": [
                "Interveinal chlorosis young leaves",
                "Green veins persist"
            ],
            "management": [
                "Acidify soil if pH >6.5",
                "Avoid excessive phosphorus",
                "Chelated iron soil drench"
            ]
        },
        "magnesium-Mg": {
            "basic": ["Epsom salts (MgSO4) 50g/tree"],
            "symptoms": [
                "Interveinal chlorosis older leaves",
                "Reddish margins"
            ],
            "management": [
                "Dolomitic lime application",
                "Foliar MgSO4 (2%)",
                "Balance with calcium and potassium"
            ]
        },
        "manganese-Mn": {
            "basic": ["MnSO4 foliar (2g/L)"],
            "symptoms": [
                "Interveinal chlorosis + necrotic spots",
                "Younger leaves affected"
            ],
            "management": [
                "Avoid high pH liming",
                    "Soil MnSO4 application",
                    "Chelated manganese products"
                ]
            },
        "nitrogen-N": {
            "basic": ["Urea 50g/tree split application"],
            "symptoms": [
                "Uniform yellowing older leaves",
                "Stunted growth",
                "Small pale berries"
            ],
            "management": [
                "Split N applications (3-4/year)",
                "Organic manure incorporation",
                "Legume intercropping"
            ]
        },
        "phosphorus-P": {
            "basic": ["TSP 100g/tree"],
            "symptoms": [
                "Dark green/purplish leaves",
                "Poor root growth"
            ],
            "management": [
                "Single Super Phosphate",
                "Rock phosphate for acidic soils",
                "Mycorrhizal inoculants"
            ]
        },
        "potasium-K": {
            "basic": ["Muriate of potash 100g/tree"],
            "symptoms": [
                "Leaf edge scorching",
                "Weak stems",
                "Small berries"
            ],
            "management": [
                "Potassium sulfate preferred",
                "Ash from coffee husks",
                "Balance with magnesium"
            ]
        }
    }
    
    # Uncertain fallback
    if disease_class not in disease_recs:
        disease_recs[disease_class] = get_uncertain_disease_recs()
    if deficiency_class not in deficiency_recs:
        deficiency_recs[deficiency_class] = get_uncertain_deficiency_recs()
    
    return {
        'disease_recommendations': disease_recs.get(disease_class, {}),
        'deficiency_recommendations': deficiency_recs.get(deficiency_class, {}),
        'products': [
            'Copper hydroxide fungicide',
            'Triazole systemic fungicide', 
            'Epsom salts (MgSO4)',
            'Fe-EDDHA chelate',
            'NPK 20-10-10 fertilizer'
        ],
        'varieties': [
            'Ruiru 11 (multi-resistant)',
            'Batian (rust resistant)',
            'Catuai (moderate resistance)'
        ]
    }

def get_uncertain_disease_recs():
    """Fallback for unknown diseases"""
    return {
        "disease_name": "Uncertain Diagnosis",
        "current_severity": "Unknown", 
        "overview": "Model confidence too low for reliable identification. Field verification recommended.",
        "symptoms": ["Ambiguous symptoms detected"],
        "integrated_management": {
            "cultural_practices": ["Consult local extension officer"],
            "chemical_control": [],
            "biological_control": []
        }
    }

def get_uncertain_deficiency_recs():
    """Fallback for unknown deficiencies"""
    return {
        "basic": ["Conduct comprehensive soil analysis"],
        "symptoms": ["Unclear deficiency symptoms"],
        "management": ["Consult soil testing laboratory"]
    }

# Backward compatibility
def get_additional_recommendations(disease_class, deficiency_class):
    structured = get_structured_recommendations(disease_class, deficiency_class)
    # Simple fallback for legacy code
    return {
        'disease_recommendations_simple': structured['disease_recommendations']['overview'][:100] + '...',
        'deficiency_recommendations_simple': structured['deficiency_recommendations']['basic'][0] if structured['deficiency_recommendations']['basic'] else 'Soil test recommended',
        **structured
    }

def get_uncertain_recommendations():
    return get_structured_recommendations('Uncertain', 'Healthy')['disease_recommendations']

