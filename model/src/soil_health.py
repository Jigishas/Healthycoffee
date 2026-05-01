"""
Soil health analysis engine for coffee plantations.
"""

from typing import Dict, List, Optional


class SoilHealthEngine:
    """
    Analyzes soil data and provides recommendations for coffee plant health.
    """
    
    def __init__(self):
        self.soil_health_cache = {}
        self.soil_types = {
            "volcanic": {
                "description": "Rich in minerals, good for coffee",
                "ph_range": (5.5, 6.5),
                "drainage": "good"
            },
            "clay": {
                "description": "Heavy soil, may need drainage improvement",
                "ph_range": (5.5, 7.0),
                "drainage": "poor"
            },
            "sandy": {
                "description": "Light soil, may need organic matter",
                "ph_range": (5.0, 6.5),
                "drainage": "excellent"
            },
            "loam": {
                "description": "Balanced soil, ideal for coffee",
                "ph_range": (5.5, 6.5),
                "drainage": "good"
            }
        }
    
    def analyze(self, soil_data: Dict) -> List[str]:
        """
        Analyze soil data and return recommendations.
        
        Args:
            soil_data: Dict with keys like 'pH', 'N', 'P', 'K', etc.
                      Values can be 'low', 'ideal', 'high', or numeric
        
        Returns:
            List of recommendation strings
        """
        recommendations = []
        
        if not soil_data:
            return ["Maintain current soil management practices", "Test soil annually"]
        
        # Check pH
        ph = soil_data.get('pH', 'ideal')
        if isinstance(ph, str):
            if ph.lower() == 'low':
                recommendations.append("Consider applying agricultural lime to raise soil pH")
            elif ph.lower() == 'high':
                recommendations.append("Consider applying elemental sulfur to lower soil pH")
        else:
            if ph < 5.5:
                recommendations.append("Apply agricultural lime (2-4 t/ha) to raise pH")
            elif ph > 6.5:
                recommendations.append("Apply elemental sulfur to lower pH")
        
        # Check Nitrogen
        n = soil_data.get('N', 'ideal')
        if isinstance(n, str):
            if n.lower() == 'low':
                recommendations.append("Apply nitrogen fertilizers (urea or CAN at 100-200 kg/ha)")
        else:
            if n < 50:
                recommendations.append("Apply nitrogen fertilizers (urea at 150-200 kg/ha)")
        
        # Check Phosphorus
        p = soil_data.get('P', 'ideal')
        if isinstance(p, str):
            if p.lower() == 'low':
                recommendations.append("Apply phosphorus (DAP at 100-150 kg/ha)")
        else:
            if p < 30:
                recommendations.append("Apply phosphorus fertilizers (DAP or TSP at 100-150 kg/ha)")
        
        # Check Potassium
        k = soil_data.get('K', 'ideal')
        if isinstance(k, str):
            if k.lower() == 'low':
                recommendations.append("Apply potassium (MOP at 100-150 kg/ha)")
        else:
            if k < 40:
                recommendations.append("Apply potassium fertilizers (MOP at 100-150 kg/ha)")
        
        # Add general recommendations if none yet
        if not recommendations:
            recommendations.extend([
                "Maintain current fertilization program",
                "Monitor soil nutrient levels annually",
                "Apply compost to maintain organic matter above 3%"
            ])
        
        return recommendations
    
    def get_soil_health_score(self, soil_data: Dict) -> float:
        """
        Calculate a soil health score from 0-100.
        
        Args:
            soil_data: Dict with nutrient levels
        
        Returns:
            Score from 0-100
        """
        score = 50.0  # Base score
        
        # pH contribution
        ph = soil_data.get('pH', 6.0)
        if isinstance(ph, str):
            ph_val = 6.0
        else:
            ph_val = ph
        
        if 5.5 <= ph_val <= 6.5:
            score += 20
        elif 5.0 <= ph_val <= 7.0:
            score += 10
        
        # Nutrient balance contribution
        nutrients = ['N', 'P', 'K']
        for n in nutrients:
            val = soil_data.get(n, 'ideal')
            if isinstance(val, str) and val.lower() == 'ideal':
                score += 10 / len(nutrients)
        
        return min(100.0, max(0.0, score))
    
    def get_organic_matter_recommendations(self, current_om: float) -> List[str]:
        """
        Get recommendations based on organic matter levels.
        
        Args:
            current_om: Current organic matter percentage
        
        Returns:
            List of recommendations
        """
        recs = []
        
        if current_om < 2:
            recs.append("Apply 10-15 t/ha of compost or manure annually")
            recs.append("Consider cover cropping to improve organic matter")
        elif current_om < 3:
            recs.append("Maintain current compost application (5-10 t/ha)")
            recs.append("Use cover crops to gradually increase organic matter")
        else:
            recs.append("Organic matter levels are good (maintain above 3%)")
            recs.append("Apply mulch to preserve organic matter")
        
        return recs
