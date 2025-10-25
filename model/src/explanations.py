# simple explanation provider — extend as needed or load from files
DEFAULT_EXPLANATIONS = {
    # Deficiency explanations
    "healthy": {
        "description": {
            "en": "Leaf shows no visible nutrient deficiency symptoms.",
            "sw": "Jani halina dalili za upungufu wa virutubisho."
        },
        "recommendation": {
            "en": "Maintain balanced fertilization and good agronomic practices.",
            "sw": "Endelea na mbolea iliyosawazishwa na mazoea mazuri ya kilimo."
        }
    },
    "boron deficiency": {
        "description": {
            "en": "Deformed or brittle young leaves, poor flowering and fruit set.",
            "sw": "Majani mapya yameharibika au kavu, maua na matunda habadiliki vizuri."
        },
        "recommendation": {
            "en": "Apply boron-containing fertilizers such as borax in recommended doses.",
            "sw": "Tumia mbolea zenye boron kama borax kwa kipimo kilichopendekezwa."
        }
    },
    "calcium deficiency": {
        "description": {
            "en": "Young leaves are distorted or hook-shaped, with necrotic tips.",
            "sw": "Majani mapya yamepinduka au kama ndoano, ncha zimekufa."
        },
        "recommendation": {
            "en": "Apply agricultural lime or gypsum to improve calcium levels.",
            "sw": "Tumia chokaa ya kilimo au gypsum ili kuongeza kiwango cha kalsiamu."
        }
    },
    "iron deficiency": {
        "description": {
            "en": "Interveinal chlorosis on young leaves while veins remain green.",
            "sw": "Kupungua kwa rangi kati ya mishipa kwenye majani mapya, mishipa inabaki kijani."
        },
        "recommendation": {
            "en": "Apply iron chelates or foliar sprays; ensure proper soil pH.",
            "sw": "Tumia chelates za chuma au dawa za kunyunyizia; hakikisha pH ya udongo ni sahihi."
        }
    },
    "magnesium deficiency": {
        "description": {
            "en": "Yellowing between veins on older leaves, veins remain green.",
            "sw": "Kupungua kwa rangi kati ya mishipa kwenye majani ya zamani, mishipa inabaki kijani."
        },
        "recommendation": {
            "en": "Apply magnesium sulfate (Epsom salts) or dolomitic lime.",
            "sw": "Tumia magnesium sulfate (chumvi ya Epsom) au chokaa ya dolomiti."
        }
    },
    "manganese deficiency": {
        "description": {
            "en": "Interveinal chlorosis with small necrotic spots on young leaves.",
            "sw": "Kupungua kwa rangi kati ya mishipa na madoa madogo ya kufa kwenye majani mapya."
        },
        "recommendation": {
            "en": "Apply manganese sulfate or foliar sprays.",
            "sw": "Tumia manganese sulfate au dawa za kunyunyizia."
        }
    },
    "nitrogen deficiency": {
        "description": {
            "en": "Older leaves turn pale yellow starting from the tip.",
            "sw": "Majani ya zamani hupungua rangi na kuwa njano kuanzia ncha."
        },
        "recommendation": {
            "en": "Apply nitrogen-rich fertilizers such as urea or CAN.",
            "sw": "Tumia mbolea zenye nitrojeni nyingi kama urea au CAN."
        }
    },
    "phosphorus deficiency": {
        "description": {
            "en": "Dark green foliage with purplish tinge, stunted growth.",
            "sw": "Majani ya kijani giza yenye rangi ya zambarau, ukuaji umepungua."
        },
        "recommendation": {
            "en": "Apply phosphorus fertilizers such as DAP or rock phosphate.",
            "sw": "Tumia mbolea za fosforasi kama DAP au fosforasi ya mwamba."
        }
    },
    "potassium deficiency": {
        "description": {
            "en": "Leaf edges turn brown and curl, plants more disease-prone.",
            "sw": "Makali ya majani hupungua rangi na kukunja, mimea huwa rahisi kupatwa na magonjwa."
        },
        "recommendation": {
            "en": "Apply muriate of potash (MOP) or potassium sulphate.",
            "sw": "Tumia muriate of potash (MOP) au potassium sulphate."
        }
    },
    # Disease explanations
    "cerscospora": {
        "description": {
            "en": "Small brown or grey spots with light centers, often enlarging and merging, caused by Cercospora coffeicola.",
            "sw": "Madoa madogo ya kahawia au kijivu yenye vituo vyeupe, mara nyingi hukua na kuungana."
        },
        "recommendation": {
            "en": "Remove infected leaves, maintain proper spacing, and apply protective fungicides.",
            "sw": "Ondoa majani yaliyoambukizwa, weka nafasi sahihi, na tumia dawa za kuzuia ukungu."
        }
    },
    "leaf rust": {
        "description": {
            "en": "Orange or yellow powdery spots, usually on the underside of leaves, caused by Hemileia vastatrix.",
            "sw": "Madoa ya rangi ya chungwa au njano yenye unga, kawaida upande wa chini wa majani."
        },
        "recommendation": {
            "en": "Remove and destroy infected leaves, improve air circulation, and apply recommended fungicides.",
            "sw": "Ondoa na uharibu majani yaliyoambukizwa, boresha mzunguko wa hewa, na tumia dawa za kuzuia ukungu zilizopendekezwa."
        }
    },
    "phoma": {
        "description": {
            "en": "Dark brown to black lesions, often with yellow halos, caused by Phoma spp.",
            "sw": "Vidonda vya kahawia giza hadi nyeusi, mara nyingi na mduara wa njano."
        },
        "recommendation": {
            "en": "Prune affected branches, avoid overhead irrigation, and apply copper-based fungicides.",
            "sw": "Kata matawi yaliyoathirika, epuka kumwagilia juu, na tumia dawa za kuzuia ukungu zenye shaba."
        }
    },
}


def get_explanation(class_name: str, lang: str = "en") -> str:
    """Return a human readable description for a predicted class."""
    if not class_name:
        return ""
    entry = DEFAULT_EXPLANATIONS.get(class_name.lower())
    if entry:
        desc = entry.get("description", {})
        return desc.get(lang, desc.get("en", "No description available."))
    return f"No description available for '{class_name}'."


def get_recommendation(class_name: str, lang: str = "en") -> str:
    """Return a recommendation for a predicted class."""
    if not class_name:
        return ""
    entry = DEFAULT_EXPLANATIONS.get(class_name.lower())
    if entry:
        rec = entry.get("recommendation", {})
        return rec.get(lang, rec.get("en", "No recommendation available."))
    return f"No recommendation available for '{class_name}'."
