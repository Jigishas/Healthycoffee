class CoffeeDiseaseRecommender:
    def __init__(self):
        self.disease_recommendations = {
            "0": {
                "name": "Cercospora Leaf Spot (Cercospora coffeicola)",
                "overview": "Cercospora leaf spot is a widespread fungal disease that affects coffee plants globally, particularly in regions with high humidity and frequent rainfall. The disease manifests as small, circular brown to grey spots on leaves that gradually enlarge and coalesce, forming irregular patches of dead tissue. In severe infections, this can lead to premature defoliation, significantly reducing the plant's photosynthetic capacity and causing yield losses of up to 30-50% in untreated coffee plantations. The fungus thrives in warm, humid conditions and can spread rapidly during prolonged wet periods.",
                "symptoms": [
                    "Small brown or grey spots with light centers",
                    "Spots enlarge and merge, forming irregular patches",
                    "Yellow halos around lesions",
                    "Premature leaf drop in severe cases",
                    "Reduced plant vigor and yield",
                    "Angular leaf spots with dark borders",
                    "Lesions appear first on lower leaves",
                    "Spots develop concentric rings as they grow",
                    "Infected leaves become brittle and crack easily",
                    "Defoliation starts from bottom of plant",
                    "Young leaves may show chlorotic areas",
                    "Severe infections cause skeletonized leaves",
                    "Brown streaks along leaf veins",
                    "Leaves curl and distort in advanced stages"
                ],
                "integrated_management": {
                    "cultural_practices": [
                        "Maintain proper plant spacing (2-3m between plants)",
                        "Prune to improve air circulation and reduce humidity",
                        "Remove and destroy infected leaves",
                        "Avoid overhead irrigation to reduce leaf wetness",
                        "Improve soil drainage to prevent waterlogging"
                    ],
                    "chemical_control": [
                        "Primary: Copper-based fungicides like copper oxychloride (2-3kg/ha)",
                        "Secondary: Dithiocarbamate fungicides like mancozeb (2-3kg/ha)",
                        "Apply as protective sprays every 10-14 days during wet periods",
                        "Rotate between copper and dithiocarbamate fungicides",
                        "Use wettable sulfur for additional control in dry conditions"
                    ],
                    "biological_control": [
                        "Apply Trichoderma harzianum as soil drench and foliar spray",
                        "Use Pseudomonas fluorescens for bacterial antagonism",
                        "Apply compost tea enriched with beneficial microbes",
                        "Introduce mycorrhizal fungi to enhance root health"
                    ],
                    "monitoring": [
                        "Regular leaf inspection every 1-2 weeks",
                        "Monitor weather conditions favoring disease",
                        "Establish disease incidence thresholds (5% infection)",
                        "Keep detailed records of disease progression"
                    ]
                },
                "emergency_measures": {
                    "high_infection": [
                        "Immediate application of copper-mancozeb mixture",
                        "Remove and burn severely infected leaves",
                        "Increase monitoring frequency to weekly",
                        "Apply silicon fertilizers to strengthen leaves"
                    ],
                    "preventive_protocol": [
                        "Begin fungicide applications before wet season",
                        "Apply protective coatings on young leaves",
                        "Maintain optimal plant nutrition",
                        "Implement strict sanitation practices"
                    ]
                },
                "resistant_varieties": [
                    {
                        "name": "Catuai",
                        "resistance_level": "Moderate",
                        "characteristics": "Compact growth, high yield",
                        "adaptation": "Various altitudes and climates"
                    },
                    {
                        "name": "Mundo Novo",
                        "resistance_level": "Moderate",
                        "characteristics": "Vigorous growth, good cup quality",
                        "adaptation": "Medium altitudes"
                    }
                ]
            },

            "1": {
                "name": "Healthy",
                "overview": "Leaf shows no visible disease symptoms. Uniform green color and normal texture.",
                "symptoms": [],
                "integrated_management": {
                    "cultural_practices": [
                        "Maintain good agronomic practices",
                        "Regular monitoring for early disease detection",
                        "Balanced fertilization",
                        "Proper pruning and weed control"
                    ],
                    "chemical_control": [],
                    "biological_control": [],
                    "monitoring": [
                        "Regular leaf inspection",
                        "Monitor plant growth and vigor",
                        "Keep records of plant health"
                    ]
                }
            },

            "3": {
                "name": "Phoma Leaf Blight (Phoma spp.)",
                "overview": "A fungal disease causing dark brown to black lesions on coffee leaves, often with yellow halos, leading to leaf necrosis and defoliation.",
                "symptoms": [
                    "Dark brown to black lesions on leaves",
                    "Lesions often have yellow halos",
                    "Irregular shaped spots that may merge",
                    "Leaf necrosis and premature drop",
                    "Reduced photosynthetic capacity"
                ],
                "integrated_management": {
                    "cultural_practices": [
                        "Prune infected branches and remove fallen leaves",
                        "Improve air circulation through proper spacing",
                        "Avoid mechanical injury during cultivation",
                        "Use clean pruning tools disinfected between plants",
                        "Maintain balanced plant nutrition"
                    ],
                    "chemical_control": [
                        "Primary: Benzimidazole fungicides like thiophanate-methyl (1-1.5kg/ha)",
                        "Secondary: DMI fungicides like difenoconazole (250-500ml/ha)",
                        "Apply as curative treatments every 14-18 days during infection periods",
                        "Alternate between benzimidazoles and DMIs to prevent resistance",
                        "Use contact fungicides like captan for additional protection"
                    ],
                    "biological_control": [
                        "Apply Trichoderma species as soil and foliar treatment",
                        "Use Bacillus licheniformis-based products",
                        "Apply plant extracts with antifungal properties",
                        "Introduce mycorrhizal fungi for plant health"
                    ],
                    "monitoring": [
                        "Weekly leaf inspections during wet season",
                        "Monitor humidity and temperature conditions",
                        "Track disease incidence and severity",
                        "Establish action thresholds for treatment"
                    ]
                },
                "emergency_measures": {
                    "high_infection": [
                        "Immediate systemic fungicide application",
                        "Remove and destroy infected plant material",
                        "Increase spray frequency to 10-14 days",
                        "Apply nutritional supplements for recovery"
                    ],
                    "preventive_protocol": [
                        "Apply preventive fungicide before wet season",
                        "Maintain plant vigor through proper nutrition",
                        "Implement good sanitation practices",
                        "Monitor weather forecasts for disease risk"
                    ]
                },
                "resistant_varieties": [
                    {
                        "name": "Geisha",
                        "resistance_level": "High",
                        "characteristics": "Unique flavor profile, compact growth",
                        "adaptation": "High altitudes, requires shade"
                    },
                    {
                        "name": "SL28",
                        "resistance_level": "Moderate",
                        "characteristics": "High yield, good disease resistance",
                        "adaptation": "Medium to high altitudes"
                    }
                ]
            },

            "2": {
                "name": "Coffee Leaf Rust (Hemileia vastatrix)",
                "overview": "A devastating fungal disease causing orange-yellow powdery spots on leaves, leading to defoliation and significant yield loss.",
                "symptoms": [
                    "Orange-yellow powdery pustules on leaf undersides",
                    "Yellow spots on upper leaf surfaces",
                    "Premature leaf drop",
                    "Reduced photosynthesis",
                    "Branch dieback in severe cases",
                    "Stunted berry development",
                    "Lesions appear first on lower leaves",
                    "Pustules rupture releasing orange spores",
                    "Leaves become brittle and curl",
                    "Severe infections cause complete defoliation",
                    "Brown spots on stems and berries",
                    "Reduced flowering and fruit set",
                    "Plants show chlorosis around lesions",
                    "Infected leaves show mosaic pattern",
                    "Yellow halos around pustules",
                    "Spore masses visible as orange powder",
                    "Leaves twist and distort in advanced stages",
                    "Young shoots may be infected",
                    "Defoliation starts from tree top"
                ],
                "integrated_management": {
                    "cultural_practices": [
                        "Plant resistant varieties like Catimor, Sarchimor, or Ruiru 11",
                        "Maintain proper shade management (30-40% shade)",
                        "Ensure adequate plant spacing (2-3m between plants)",
                        "Prune infected branches regularly",
                        "Remove and destroy fallen infected leaves",
                        "Improve air circulation through selective pruning"
                    ],
                    "chemical_control": [
                        "Triazole fungicides: Tebuconazole (0.5-1L/ha) applied preventively",
                        "Strobilurin fungicides: Azoxystrobin (500-750ml/ha)",
                        "Copper-based fungicides: Copper oxychloride (2-3kg/ha)",
                        "Systemic fungicides: Propiconazole (500ml/ha)",
                        "Apply fungicides at 21-30 day intervals during rainy season"
                    ],
                    "biological_control": [
                        "Apply Trichoderma harzianum as soil drench and foliar spray",
                        "Use Bacillus subtilis-based biopesticides",
                        "Introduce mycorrhizal fungi to improve plant immunity",
                        "Apply neem-based formulations as antifungal agents"
                    ],
                    "monitoring": [
                        "Regular leaf inspection every 2 weeks during wet season",
                        "Use disease forecasting models based on weather data",
                        "Monitor spore levels using spore traps",
                        "Establish action thresholds (5% leaf infection)"
                    ]
                },
                "emergency_measures": {
                    "high_infection": [
                        "Immediate application of systemic fungicide mixture",
                        "Remove and burn severely infected plants",
                        "Increase fungicide application frequency to 14 days",
                        "Apply silicon fertilizers to strengthen cell walls"
                    ],
                    "preventive_protocol": [
                        "Begin fungicide applications before rainy season",
                        "Apply protective coatings before expected infection periods",
                        "Maintain plant nutrition for better disease resistance",
                        "Implement quarantine measures for new plantings"
                    ]
                },
                "resistant_varieties": [
                    {
                        "name": "Catimor",
                        "resistance_level": "High",
                        "characteristics": "Compact growth, high yield, good quality",
                        "adaptation": "Adapted to various altitudes"
                    },
                    {
                        "name": "Sarchimor",
                        "resistance_level": "High",
                        "characteristics": "Vigorous growth, excellent cup quality",
                        "adaptation": "Best at medium to high altitudes"
                    },
                    {
                        "name": "Ruiru 11",
                        "resistance_level": "High",
                        "characteristics": "Dwarf variety, high productivity",
                        "adaptation": "Suitable for intensive cultivation"
                    }
                ]
            },

            "coffee_berry_disease": {
                "name": "Coffee Berry Disease (Colletotrichum kahawae)",
                "overview": "A destructive fungal disease affecting coffee berries, causing dark sunken lesions and significant crop loss.",
                "symptoms": [
                    "Dark sunken lesions on green berries",
                    "Blackened, mummified cherries",
                    "Premature berry drop",
                    "Scabby appearance on mature berries",
                    "Reduced bean quality and quantity"
                ],
                "integrated_management": {
                    "cultural_practices": [
                        "Plant resistant varieties like Batian, Ruiru 11, or K7",
                        "Practice regular pruning to improve air circulation",
                        "Remove and destroy infected berries promptly",
                        "Maintain balanced nutrition without excess nitrogen",
                        "Use mulch to reduce soil splash contamination"
                    ],
                    "chemical_control": [
                        "Protective fungicides: Copper hydroxide (2kg/ha) before flowering",
                        "Systemic fungicides: Thiophanate-methyl (1-1.5kg/ha)",
                        "Combination sprays: Copper + systemic fungicide mixtures",
                        "Apply during critical periods: flowering, pinhead stage, berry expansion"
                    ],
                    "biological_control": [
                        "Apply Trichoderma asperellum as berry coating",
                        "Use Bacillus amyloliquefaciens for biological protection",
                        "Introduce antagonistic yeasts during flowering",
                        "Apply chitosan-based formulations for induced resistance"
                    ],
                    "monitoring": [
                        "Weekly berry inspection during development stages",
                        "Monitor weather conditions favoring infection",
                        "Use disease prediction models based on temperature and humidity",
                        "Establish economic thresholds for spray decisions"
                    ]
                },
                "critical_application_timing": [
                    "Pre-flowering: Protective coating application",
                    "Flowering: First systemic fungicide application",
                    "Pinhead stage (3-4mm berries): Critical protection period",
                    "Berry expansion: Regular 14-day interval sprays",
                    "Pre-harvest: Final protective application"
                ],
                "resistant_varieties": [
                    {
                        "name": "Batian",
                        "resistance_level": "Very High",
                        "characteristics": "Excellent cup quality, high yield",
                        "adaptation": "Wide altitude range"
                    },
                    {
                        "name": "Ruiru 11",
                        "resistance_level": "High",
                        "characteristics": "Compact growth, multiple disease resistance",
                        "adaptation": "Intensive farming systems"
                    },
                    {
                        "name": "K7",
                        "resistance_level": "High",
                        "characteristics": "Vigorous growth, good quality",
                        "adaptation": "Medium to high altitudes"
                    }
                ]
            },

            "root_rot": {
                "name": "Root Rot Complex (Multiple Pathogens)",
                "overview": "A complex of fungal pathogens causing root system destruction, leading to plant decline and death.",
                "symptoms": [
                    "Wilting leaves despite adequate moisture",
                    "Root discoloration (brown to black)",
                    "Root system reduction",
                    "Yellowing and dropping of leaves",
                    "Plant stunting and eventual collapse",
                    "Presence of fungal structures on roots"
                ],
                "pathogen_specific_management": {
                    "fusarium_root_rot": {
                        "identification": "Reddish-brown internal root discoloration",
                        "management": [
                            "Soil solarization before planting",
                            "Apply Trichoderma harzianum as soil treatment",
                            "Use benzimidazole fungicides as soil drench",
                            "Improve soil drainage and aeration"
                        ]
                    },
                    "armillaria_root_rot": {
                        "identification": "White fungal mats under bark, mushroom clusters",
                        "management": [
                            "Remove and destroy infected stumps",
                            "Create isolation trenches around infected areas",
                            "Apply systemic fungicides like propiconazole",
                            "Use biological controls with Trichoderma species"
                        ]
                    },
                    "phytophthora_root_rot": {
                        "identification": "Water-soaked root lesions, rapid plant decline",
                        "management": [
                            "Improve soil drainage significantly",
                            "Apply phosphorous acid fungicides",
                            "Use metalaxyl-based soil treatments",
                            "Implement raised bed cultivation"
                        ]
                    }
                },
                "integrated_management": {
                    "preventive_measures": [
                        "Use certified disease-free planting material",
                        "Implement proper soil drainage systems",
                        "Practice crop rotation with non-host plants",
                        "Maintain optimal soil pH (5.5-6.5)",
                        "Avoid soil compaction through controlled traffic"
                    ],
                    "chemical_interventions": [
                        "Soil fumigation with dazomet for severe cases",
                        "Systemic fungicide drenches: Fosetyl-Al, Metalaxyl",
                        "Biological fungicides: Trichoderma, Bacillus subtilis",
                        "Soil amendments with beneficial microorganisms"
                    ],
                    "cultural_controls": [
                        "Raised bed planting in high-risk areas",
                        "Organic matter incorporation for soil health",
                        "Proper irrigation management to avoid waterlogging",
                        "Regular monitoring of plant health and growth"
                    ]
                },
                "resistant_rootstocks": [
                    {
                        "name": "Robusta Rootstocks",
                        "resistance": "High against most root rots",
                        "grafting_compatibility": "Good with most Arabica varieties",
                        "characteristics": "Vigorous root system, nematode resistance"
                    },
                    {
                        "name": "Liberica Hybrids",
                        "resistance": "Moderate to high",
                        "grafting_compatibility": "Variable",
                        "characteristics": "Deep rooting, drought tolerance"
                    }
                ]
            },

            "bacterial_blight": {
                "name": "Bacterial Blight (Pseudomonas syringae)",
                "overview": "A bacterial disease causing leaf spots, twig dieback, and cankers, often exacerbated by wet conditions.",
                "symptoms": [
                    "Water-soaked leaf lesions turning brown",
                    "Blackened leaf veins",
                    "Twig dieback and canker formation",
                    "Gummy exudate from infected tissues",
                    "Shoot tip wilting and death"
                ],
                "management_strategies": {
                    "cultural_control": [
                        "Use pathogen-free planting material",
                        "Avoid overhead irrigation to reduce spread",
                        "Prune infected branches during dry weather",
                        "Disinfect pruning tools between plants",
                        "Remove and destroy severely infected plants"
                    ],
                    "chemical_control": [
                        "Copper-based bactericides: Copper hydroxide (1.5-2kg/ha)",
                        "Antibiotics: Streptomycin sulfate (limited use)",
                        "Combination sprays: Copper + mancozeb",
                        "Apply during dry periods for best efficacy"
                    ],
                    "biological_control": [
                        "Apply Bacillus subtilis-based products",
                        "Use Pseudomonas fluorescens as biological control",
                        "Introduce bacteriophages specific to the pathogen",
                        "Apply plant resistance inducers like acibenzolar-S-methyl"
                    ],
                    "preventive_measures": [
                        "Windbreaks to reduce mechanical injury",
                        "Balanced fertilization without excess nitrogen",
                        "Proper canopy management for air circulation",
                        "Regular monitoring for early detection"
                    ]
                },
                "resistant_varieties": [
                    {
                        "name": "Colombia Variety",
                        "resistance_level": "Moderate",
                        "characteristics": "Good yield potential, adaptable",
                        "notes": "Requires integrated management in high-pressure areas"
                    }
                ]
            },

            "anthracnose": {
                "name": "Anthracnose (Colletotrichum gloeosporioides)",
                "overview": "A fungal disease causing leaf spots, berry rot, and dieback, particularly in humid conditions.",
                "symptoms": [
                    "Dark, sunken leaf spots with concentric rings",
                    "Berry rot with salmon-colored spore masses",
                    "Twig dieback and canker formation",
                    "Leaf yellowing and premature drop",
                    "Flower blight and abortion"
                ],
                "integrated_management": {
                    "cultural_practices": [
                        "Prune to improve air circulation and light penetration",
                        "Remove and destroy infected plant debris",
                        "Avoid mechanical injury during field operations",
                        "Maintain balanced plant nutrition",
                        "Use drip irrigation to reduce leaf wetness"
                    ],
                    "chemical_control": [
                        "Protective fungicides: Chlorothalonil (1-1.5kg/ha)",
                        "Systemic fungicides: Thiophanate-methyl (1kg/ha)",
                        "Strobilurin fungicides: Pyraclostrobin (500ml/ha)",
                        "Apply at 14-21 day intervals during high-risk periods"
                    ],
                    "biological_control": [
                        "Apply Trichoderma viride as foliar spray",
                        "Use Bacillus licheniformis for biological control",
                        "Apply neem-based formulations",
                        "Use plant extracts with antifungal properties"
                    ],
                    "resistance_management": [
                        "Rotate fungicides with different modes of action",
                        "Combine biological and chemical controls",
                        "Monitor for fungicide resistance development",
                        "Use multi-site fungicides in resistance-prone areas"
                    ]
                }
            },

            "nematode_infestation": {
                "name": "Nematode Infestation (Multiple Species)",
                "overview": "Microscopic worms attacking coffee roots, causing gall formation, reduced vigor, and yield decline.",
                "symptoms": [
                    "Root galls and knots",
                    "Stunted plant growth",
                    "Yellowing leaves",
                    "Poor response to fertilizers",
                    "Wilting during hot periods",
                    "Reduced berry production"
                ],
                "nematode_species_specific": {
                    "root_knot_nematode": {
                        "identification": "Characteristic root galls",
                        "management": [
                            "Use resistant rootstocks like Apoata",
                            "Soil solarization during hot months",
                            "Apply nematicides: Carbofuran (restricted use)",
                            "Biological control with Paecilomyces lilacinus"
                        ]
                    },
                    "lesion_nematode": {
                        "identification": "Brown lesions on roots, no galls",
                        "management": [
                            "Crop rotation with marigold or pangola grass",
                            "Apply organic amendments with nematicidal properties",
                            "Use biological controls with mycorrhizal fungi",
                            "Soil fumigation in severe cases"
                        ]
                    }
                },
                "integrated_management": {
                    "preventive_measures": [
                        "Use certified nematode-free planting material",
                        "Implement soil testing before planting",
                        "Practice fallowing with cover crops",
                        "Use resistant varieties and rootstocks"
                    ],
                    "biological_control": [
                        "Apply Purpureocillium lilacinum as soil treatment",
                        "Use Bacillus firmus-based products",
                        "Introduce predatory nematodes",
                        "Apply chitin-rich amendments to stimulate natural"
                    ],
                    "cultural_controls": [
                        "Marigold intercropping (Tagetes species)",
                        "Organic matter incorporation",
                        "Biofumigation with brassica crops",
                        "Maintenance of soil health and biodiversity"
                    ]
                },
                "resistant_materials": [
                    {
                        "name": "Apoata Rootstock",
                        "resistance": "High against root-knot nematodes",
                        "characteristics": "Vigorous growth, good grafting success",
                        "adaptation": "Various soil types"
                    }
                ]
            }
        }

    def get_detailed_recommendations(self, disease_name, severity="medium", farm_conditions=None):
        """Generate comprehensive disease management recommendations"""
        if disease_name not in self.disease_recommendations:
            # Return uncertain recommendations if disease not found
            return self.get_uncertain_recommendations()

        disease_data = self.disease_recommendations[disease_name]

        # Adjust recommendations based on severity
        severity_factors = {
            "low": {"spray_frequency": "21-30 days", "intervention_level": "Preventive"},
            "medium": {"spray_frequency": "14-21 days", "intervention_level": "Curative"},
            "high": {"spray_frequency": "7-14 days", "intervention_level": "Emergency"}
        }

        severity_info = severity_factors.get(severity, severity_factors["medium"])

        # Generate farm-specific adaptations
        farm_adaptations = self._get_farm_specific_adaptations(disease_name, farm_conditions)

        result = {
            "disease_name": disease_data["name"],
            "overview": disease_data["overview"],
            "current_severity": severity,
            "symptoms": disease_data["symptoms"],
            "integrated_management": disease_data["integrated_management"],
            "severity_specific_recommendations": {
                "spray_frequency": severity_info["spray_frequency"],
                "intervention_level": severity_info["intervention_level"],
                "immediate_actions": self._get_immediate_actions(disease_name, severity),
                "long_term_strategies": self._get_long_term_strategies(disease_name)
            },
            "farm_specific_adaptations": farm_adaptations,
            "monitoring_schedule": self._get_monitoring_schedule(disease_name, severity),
            "economic_considerations": self._get_economic_analysis(disease_name, severity)
        }

        # Add emergency_measures if available
        if "emergency_measures" in disease_data:
            result["emergency_measures"] = disease_data["emergency_measures"]

        # Add resistant_varieties if available
        if "resistant_varieties" in disease_data:
            result["resistant_varieties"] = disease_data["resistant_varieties"]

        return result

    def _get_immediate_actions(self, disease_name, severity):
        """Get immediate actions based on disease and severity"""
        actions = {
            "coffee_leaf_rust": {
                "low": ["Remove heavily infected leaves", "Apply preventive fungicide", "Monitor weather conditions"],
                "medium": ["Apply systemic fungicide", "Increase monitoring frequency", "Improve air circulation"],
                "high": ["Emergency fungicide application", "Remove severely infected plants", "Implement quarantine measures"]
            },
            "coffee_berry_disease": {
                "low": ["Remove mummified berries", "Apply protective coating", "Monitor berry development"],
                "medium": ["Apply systemic fungicide", "Increase spray frequency", "Remove infected clusters"],
                "high": ["Emergency combination spray", "Harvest early if possible", "Implement strict sanitation"]
            }
        }
        return actions.get(disease_name, {}).get(severity, ["Consult agricultural extension officer"])

    def _get_long_term_strategies(self, disease_name):
        """Get long-term management strategies"""
        strategies = {
            "coffee_leaf_rust": [
                "Gradual replacement with resistant varieties",
                "Establishment of windbreaks and shade systems",
                "Implementation of precision agriculture techniques",
                "Development of farm-specific disease forecasting"
            ],
            "coffee_berry_disease": [
                "Orchard renovation with resistant varieties",
                "Installation of irrigation systems to control moisture",
                "Implementation of integrated pest management programs",
                "Regular soil and leaf tissue analysis"
            ]
        }
        return strategies.get(disease_name, ["Develop comprehensive farm health management plan"])

    def _get_farm_specific_adaptations(self, disease_name, farm_conditions):
        """Generate farm-specific adaptation recommendations"""
        if not farm_conditions:
            return {"general_recommendations": ["Conduct farm-specific risk assessment"]}

        adaptations = []

        if farm_conditions.get("altitude", 0) < 1000:
            adaptations.append("Consider Robusta varieties for lower altitude adaptation")

        if farm_conditions.get("rainfall", 0) > 2000:
            adaptations.append("Implement enhanced drainage and aeration systems")

        if farm_conditions.get("soil_type") == "clay":
            adaptations.append("Improve soil structure with organic amendments")

        if farm_conditions.get("farm_size", 0) < 5:
            adaptations.append("Focus on intensive management and high-value varieties")

        return {
            "based_on_conditions": adaptations,
            "recommended_adaptations": self._get_specific_adaptations(disease_name, farm_conditions)
        }

    def _get_specific_adaptations(self, disease_name, farm_conditions):
        """Get disease-specific farm adaptations"""
        # Implementation would consider specific farm conditions
        # This is a simplified version
        return [
            "Adjust planting density based on local conditions",
            "Modify pruning schedule according to disease pressure",
            "Adapt spray program to local weather patterns",
            "Customize fertilization based on soil test results"
        ]

    def _get_monitoring_schedule(self, disease_name, severity):
        """Generate monitoring schedule based on disease and severity"""
        base_schedule = {
            "coffee_leaf_rust": {
                "low": "Bi-weekly leaf inspections",
                "medium": "Weekly inspections with spore monitoring",
                "high": "Twice weekly inspections with detailed recording"
            },
            "coffee_berry_disease": {
                "low": "Weekly berry inspections",
                "medium": "Twice weekly inspections during critical stages",
                "high": "Daily monitoring of high-risk areas"
            }
        }

        return {
            "inspection_frequency": base_schedule.get(disease_name, {}).get(severity, "Weekly inspections"),
            "data_recording": "Maintain detailed records of disease incidence and severity",
            "action_thresholds": "Implement spray decisions based on established thresholds",
            "weather_monitoring": "Track temperature, humidity, and rainfall patterns"
        }

    def _get_economic_analysis(self, disease_name, severity):
        """Provide economic considerations for disease management"""
        cost_estimates = {
            "low": {"cost_per_ha": 50, "potential_loss": 15},
            "medium": {"cost_per_ha": 150, "potential_loss": 35},
            "high": {"cost_per_ha": 300, "potential_loss": 60}
        }

        costs = cost_estimates.get(severity, cost_estimates["medium"])

        return {
            "management_cost_usd_per_ha": costs["cost_per_ha"],
            "potential_yield_loss_percent": costs["potential_loss"],
            "return_on_investment": "High for preventive measures",
            "economic_threshold": f"Treat when disease incidence exceeds 5% or potential loss > ${costs['cost_per_ha']}",
            "cost_effective_strategies": [
                "Preventive applications during low-risk periods",
                "Resistant variety establishment",
                "Integrated management approaches"
            ]
        }

    def get_disease_prevention_calendar(self, disease_name):
        """Generate annual prevention calendar for specific disease"""
        calendars = {
            "coffee_leaf_rust": {
                "january": "Post-harvest pruning and sanitation",
                "february": "Apply dormant season fungicide",
                "march": "Monitor new growth, begin preventive sprays",
                "april": "Regular fungicide applications before rains",
                "may": "Intensive monitoring during early wet season",
                "june-august": "Regular protective sprays every 21 days",
                "september": "Reduce spray frequency as rains decrease",
                "october": "Post-rainy season assessment",
                "november": "Pre-harvest disease management",
                "december": "Harvest and post-harvest cleanup"
            }
        }
        return calendars.get(disease_name, {"message": "General farm health maintenance calendar recommended"})

    def get_uncertain_recommendations(self):
        """Generate recommendations when model prediction is uncertain"""
        return {
            "disease_name": "Uncertain Diagnosis",
            "overview": "The model prediction confidence is low, indicating uncertainty in the diagnosis. This could be due to unclear symptoms, mixed conditions, or image quality issues.",
            "current_severity": "unknown",
            "symptoms": [
                "Symptoms not clearly matching known disease patterns",
                "Possible mixed or unclear visual indicators",
                "Image quality may affect accurate diagnosis"
            ],
            "integrated_management": {
                "cultural_practices": [
                    "Maintain good field hygiene and sanitation",
                    "Ensure proper plant spacing for air circulation",
                    "Monitor plants closely for symptom development",
                    "Keep detailed records of plant health observations",
                    "Avoid stress factors like drought or nutrient imbalances"
                ],
                "chemical_control": [
                    "Apply broad-spectrum preventive fungicides if disease risk is high",
                    "Use contact fungicides for general protection",
                    "Consider multi-site fungicides for resistance management",
                    "Apply only if symptoms become clearer and more severe"
                ],
                "biological_control": [
                    "Apply beneficial microbes to enhance plant immunity",
                    "Use compost tea or other organic amendments",
                    "Introduce mycorrhizal fungi for root health",
                    "Apply plant growth-promoting rhizobacteria"
                ],
                "monitoring": [
                    "Increase monitoring frequency to daily or every other day",
                    "Take multiple photos from different angles",
                    "Consult with local agricultural extension services",
                    "Use multiple diagnostic methods if possible"
                ]
            },
            "severity_specific_recommendations": {
                "spray_frequency": "As needed based on symptom development",
                "intervention_level": "Observation and monitoring",
                "immediate_actions": [
                    "Retake photos with better lighting and focus",
                    "Consult agricultural experts for field diagnosis",
                    "Monitor plant closely for 3-5 days",
                    "Check for environmental stress factors"
                ],
                "long_term_strategies": [
                    "Improve image quality for future diagnoses",
                    "Establish baseline plant health monitoring",
                    "Develop farm-specific disease management protocols",
                    "Consider professional plant pathology consultation"
                ]
            },
            "farm_specific_adaptations": {
                "general_recommendations": [
                    "Conduct comprehensive farm health assessment",
                    "Implement integrated crop management practices",
                    "Establish regular scouting and monitoring programs"
                ]
            },
            "monitoring_schedule": {
                "inspection_frequency": "Daily monitoring until diagnosis is clear",
                "data_recording": "Document all observations with photos and notes",
                "action_thresholds": "Consult experts before taking chemical action",
                "weather_monitoring": "Track environmental conditions that may affect plant health"
            },
            "economic_considerations": {
                "management_cost_usd_per_ha": 25,
                "potential_yield_loss_percent": "Variable - depends on actual condition",
                "return_on_investment": "High for accurate diagnosis and targeted treatment",
                "economic_threshold": "Monitor closely - early intervention is cost-effective",
                "cost_effective_strategies": [
                    "Professional consultation for accurate diagnosis",
                    "Preventive measures while monitoring",
                    "Avoid unnecessary chemical applications"
                ]
            },
            "additional_recommendations": [
                "Consider laboratory testing for accurate pathogen identification",
                "Use multiple diagnostic tools (visual, molecular, serological)",
                "Consult local agricultural extension services",
                "Join farmer networks for shared experience and knowledge",
                "Keep detailed farm management records for future reference"
            ]
        }


def get_additional_recommendations(disease_class, deficiency_class):
    """
    Provides additional recommendations based on predicted disease and deficiency.
    """
    recommender = CoffeeDiseaseRecommender()

    # Use disease class index directly as key
    disease_key = str(disease_class)

    # Map deficiency class to deficiency name
    deficiency_mapping = {
        "0": "healthy",
        "1": "boron_deficiency",
        "2": "calcium_deficiency",
        "3": "iron_deficiency",
        "4": "magnesium_deficiency",
        "5": "manganese_deficiency",
        "6": "nitrogen_deficiency",
        "7": "phosphorus_deficiency",
        "8": "potassium_deficiency"
    }

    deficiency_name = deficiency_mapping.get(str(deficiency_class), "healthy")

    # Get detailed disease recommendations using the class index as key
    disease_recs = recommender.get_detailed_recommendations(disease_key, severity="medium")

    # Create deficiency-specific recommendations
    deficiency_recommendations = get_deficiency_specific_recommendations(deficiency_name)

    # Extract products from chemical_control
    products = []
    if "integrated_management" in disease_recs and "chemical_control" in disease_recs["integrated_management"]:
        chemical_control = disease_recs["integrated_management"]["chemical_control"]
        for item in chemical_control:
            # Extract product names from the strings
            if ":" in item:
                product_part = item.split(":")[1].strip()
                products.append(product_part)

    # Extract varieties from resistant_varieties
    varieties = []
    if "resistant_varieties" in disease_recs:
        for variety in disease_recs["resistant_varieties"]:
            variety_info = f"{variety['name']}: {variety['resistance_level']} resistance, {variety['characteristics']}, {variety['adaptation']}"
            varieties.append(variety_info)

    # Flatten emergency_measures into a list of strings
    emergency_measures_flat = []
    if "emergency_measures" in disease_recs:
        em = disease_recs["emergency_measures"]
        if "high_infection" in em:
            emergency_measures_flat.extend([f"High Infection: {item}" for item in em["high_infection"]])
        if "preventive_protocol" in em:
            emergency_measures_flat.extend([f"Preventive Protocol: {item}" for item in em["preventive_protocol"]])

    # Update disease_recs to include flattened emergency_measures
    if emergency_measures_flat:
        disease_recs["emergency_measures_flat"] = emergency_measures_flat

    return {
        "disease_recommendations": disease_recs,
        "deficiency_recommendations": deficiency_recommendations,
        "products": products,
        "varieties": varieties
    }


def get_deficiency_specific_recommendations(deficiency_name):
    """
    Generate specific recommendations based on the detected nutrient deficiency.
    """
    deficiency_data = {
        "healthy": {
            "basic": [
                "Maintain balanced fertilization and good agronomic practices",
                "Continue regular monitoring for nutrient status",
                "Keep soil pH between 5.5-6.5 for optimal nutrient availability",
                "Apply organic matter to maintain soil fertility"
            ]
        },
        "boron_deficiency": {
            "basic": [
                "Apply boron-containing fertilizers such as borax (1-2 kg/ha)",
                "Use foliar sprays of boric acid (0.1-0.2%) during flowering",
                "Test soil boron levels and adjust applications accordingly",
                "Avoid over-application to prevent toxicity"
            ],
            "symptoms": [
                "Deformed or brittle young leaves",
                "Poor flowering and fruit set",
                "Dieback of terminal shoots",
                "Reduced root development"
            ],
            "management": [
                "Soil application: Borax at 1-2 kg/ha annually",
                "Foliar application: 0.1-0.2% boric acid solution",
                "Timing: Apply during early growth and flowering stages",
                "Soil pH: Maintain between 5.5-6.5 for boron availability"
            ]
        },
        "calcium_deficiency": {
            "basic": [
                "Apply agricultural lime or gypsum to improve calcium levels",
                "Use calcium nitrate or calcium chloride fertilizers",
                "Ensure proper soil pH management",
                "Avoid excessive potassium and magnesium applications"
            ],
            "symptoms": [
                "Young leaves are distorted or hook-shaped",
                "Necrotic tips on young leaves",
                "Stunted root development",
                "Bitter pit in berries"
            ],
            "management": [
                "Soil application: Agricultural lime at 2-4 tons/ha",
                "Fertilizer: Calcium nitrate at 100-200 kg/ha",
                "Foliar sprays: Calcium chloride (0.5-1%)",
                "Timing: Apply during active growth periods"
            ]
        },
        "iron_deficiency": {
            "basic": [
                "Apply iron chelates or foliar sprays",
                "Ensure proper soil pH (avoid alkaline soils)",
                "Use iron sulfate or ferrous sulfate fertilizers",
                "Improve soil drainage to prevent waterlogging"
            ],
            "symptoms": [
                "Interveinal chlorosis on young leaves",
                "Veins remain green while leaf tissue yellows",
                "Reduced leaf size and plant vigor",
                "Poor fruit development"
            ],
            "management": [
                "Foliar application: Iron chelate (0.5-1 kg/ha)",
                "Soil application: Iron sulfate at 50-100 kg/ha",
                "Soil pH: Maintain below 6.5 for iron availability",
                "Organic matter: Incorporate compost to improve iron uptake"
            ]
        },
        "magnesium_deficiency": {
            "basic": [
                "Apply magnesium sulfate (Epsom salts) or dolomitic lime",
                "Use magnesium-containing fertilizers",
                "Avoid excessive potassium applications",
                "Maintain balanced calcium:magnesium ratio"
            ],
            "symptoms": [
                "Yellowing between veins on older leaves",
                "Veins remain green while interveinal tissue yellows",
                "Leaf margins may turn brown",
                "Reduced photosynthesis and yield"
            ],
            "management": [
                "Soil application: Magnesium sulfate at 100-200 kg/ha",
                "Foliar sprays: 1-2% magnesium sulfate solution",
                "Dolomitic lime: Apply to correct pH and supply magnesium",
                "Fertilizer ratio: Maintain K:Mg ratio below 5:1"
            ]
        },
        "manganese_deficiency": {
            "basic": [
                "Apply manganese sulfate or foliar sprays",
                "Ensure soil pH is not too high",
                "Use manganese chelates for alkaline soils",
                "Monitor soil manganese levels regularly"
            ],
            "symptoms": [
                "Interveinal chlorosis with small necrotic spots",
                "Gray or tan spots on leaves",
                "Reduced leaf size and curling",
                "Stunted growth and poor yields"
            ],
            "management": [
                "Soil application: Manganese sulfate at 10-20 kg/ha",
                "Foliar sprays: 0.5-1% manganese sulfate solution",
                "Chelated manganese: Use in high pH soils",
                "Timing: Apply during early growth stages"
            ]
        },
        "nitrogen_deficiency": {
            "basic": [
                "Apply nitrogen-rich fertilizers such as urea or CAN",
                "Use split applications throughout the growing season",
                "Monitor leaf color and growth rate",
                "Combine with organic matter applications"
            ],
            "symptoms": [
                "Older leaves turn pale yellow starting from the tip",
                "Reduced plant growth and vigor",
                "Small, pale green leaves",
                "Poor fruit development and yield"
            ],
            "management": [
                "Fertilizer: Urea at 100-200 kg/ha per application",
                "Split applications: 3-4 times during growing season",
                "Timing: Apply before flowering and fruit development",
                "Organic sources: Compost or manure at 5-10 tons/ha"
            ]
        },
        "phosphorus_deficiency": {
            "basic": [
                "Apply phosphorus fertilizers such as DAP or rock phosphate",
                "Use phosphorus-rich organic amendments",
                "Ensure proper soil pH for phosphorus availability",
                "Avoid excessive lime applications",
                "Apply phosphorus during early root development stages",
                "Use banded application near roots for better uptake"
            ],
            "symptoms": [
                "Dark green foliage with purplish tinge",
                "Stunted growth and reduced plant height",
                "Poor root development",
                "Delayed flowering and maturity",
                "Small, narrow leaves with upright growth",
                "Reduced leaf size and thickness",
                "Weak stems that break easily",
                "Poor fruit set and small berries",
                "Increased susceptibility to root diseases",
                "Older leaves show reddish-purple discoloration",
                "Plants mature later than healthy ones",
                "Reduced yield and poor quality berries"
            ],
            "management": [
                "Fertilizer: DAP at 100-150 kg/ha",
                "Rock phosphate: Apply 200-400 kg/ha",
                "Organic sources: Bone meal or compost",
                "Soil pH: Maintain between 5.5-6.5 for P availability",
                "Foliar application: 1-2% monoammonium phosphate solution",
                "Timing: Apply at planting and during early growth",
                "Method: Band application near roots for efficiency",
                "Split applications: 50% at planting, 50% during flowering"
            ]
        },
        "potassium_deficiency": {
            "basic": [
                "Apply muriate of potash (MOP) or potassium sulfate",
                "Use potassium-rich organic materials",
                "Monitor soil potassium levels",
                "Balance with other nutrients"
            ],
            "symptoms": [
                "Leaf edges turn brown and curl",
                "Plants become more susceptible to diseases",
                "Poor fruit quality and reduced yields",
                "Weak stems and lodging"
            ],
            "management": [
                "Fertilizer: MOP at 100-150 kg/ha",
                "Potassium sulfate: Use in chloride-sensitive crops",
                "Organic sources: Wood ash or compost",
                "Split applications: Apply during fruit development"
            ]
        }
    }

    return deficiency_data.get(deficiency_name, deficiency_data["healthy"])
