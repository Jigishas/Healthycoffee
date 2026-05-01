"""
Region context and regional adjustments for coffee leaf analysis.
"""

# Region-specific disease prevalence adjustments
REGION_DISEASE_ADJUSTMENTS = {
    "Mount Kenya": {
        "coffee_leaf_rust": 1.2,  # Higher prevalence in this region
        "cercospora": 1.0,
        "phoma": 0.9,
        "miner": 0.8
    },
    "Kilimanjaro": {
        "coffee_leaf_rust": 1.3,
        "cercospora": 1.1,
        "phoma": 1.0,
        "miner": 0.7
    },
    "Bugisu": {
        "coffee_leaf_rust": 1.1,
        "cercospora": 1.2,
        "phoma": 1.1,
        "miner": 1.0
    },
    "Default": {
        "coffee_leaf_rust": 1.0,
        "cercospora": 1.0,
        "phoma": 1.0,
        "miner": 1.0
    }
}

# Translation mappings for regional names
REGION_TRANSLATIONS = {
    "Mount Kenya": {
        "en": "Mount Kenya",
        "sw": "MLima Kenya"
    },
    "Kilimanjaro": {
        "en": "Kilimanjaro",
        "sw": "Kilimanjaro"
    },
    "Bugisu": {
        "en": "Bugisu",
        "sw": "Bugisu"
    }
}


def region_adjustment(class_name, region='Mount Kenya', region_health_context=None):
    """
    Apply regional adjustments to predicted class names.
    
    Args:
        class_name: The predicted class name from the model
        region: The farm region
        region_health_context: Optional dict with region health info
    
    Returns:
        Potentially adjusted class name based on regional prevalence
    """
    if region_health_context is None:
        region_health_context = REGION_DISEASE_ADJUSTMENTS.get(
            region, REGION_DISEASE_ADJUSTMENTS.get("Default", {})
        )
    
    # Normalize class name to lowercase for matching
    class_lower = class_name.lower() if class_name else ""
    
    # Check for region-specific adjustments
    region_info = REGION_DISEASE_ADJUSTMENTS.get(region, REGION_DISEASE_ADJUSTMENTS.get("Default", {}))
    
    # Return class name with potential regional context note
    return class_name


def get_region_name(region, language='en'):
    """Get translated region name."""
    translations = REGION_TRANSLATIONS.get(region, {})
    return translations.get(language, region)


def get_region_health_tips(region):
    """
    Get region-specific health tips.
    
    Args:
        region: The farm region
    
    Returns:
        List of region-specific health tips
    """
    tips = {
        "Mount Kenya": [
            "Monitor for coffee leaf rust especially during wet season",
            "Use fungicides preventively at 21-day intervals during rains",
            "Plant Catimor or Sarchimor varieties for rust resistance"
        ],
        "Kilimanjaro": [
            "Be vigilant for leaf rust due to high altitude humidity",
            "Apply silicon fertilizers to strengthen leaf cell walls",
            "Maintain 30-40% shade to reduce moisture stress"
        ],
        "Bugisu": [
            "Watch for cercospora leaf spot in addition to rust",
            "Use copper-based fungicides as preventive treatment",
            "Prune regularly to improve air circulation"
        ]
    }
    return tips.get(region, [
        "Follow general coffee plant health management guidelines",
        "Monitor plants regularly for disease symptoms",
        "Maintain good agronomic practices"
    ])


def get_agroecological_zone(region):
    """Get the agroecological zone classification for a region."""
    zones = {
        "Mount Kenya": "Highland Tropical",
        "Kilimanjaro": "Highland Tropical",
        "Bugisu": "Midland Tropical"
    }
    return zones.get(region, "Tropical")
