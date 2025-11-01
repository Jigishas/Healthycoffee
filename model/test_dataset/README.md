# Test Dataset for Coffee Leaf Disease and Deficiency Detection

This directory contains labeled test images for evaluating model accuracy.

## Directory Structure
```
test_dataset/
├── diseases/
│   ├── cerscospora/
│   ├── healthy/
│   ├── leaf_rust/
│   └── phoma/
├── deficiencies/
│   ├── healthy/
│   ├── boron_deficiency/
│   ├── calcium_deficiency/
│   ├── iron_deficiency/
│   ├── magnesium_deficiency/
│   ├── manganese_deficiency/
│   ├── nitrogen_deficiency/
│   ├── phosphorus_deficiency/
│   └── potassium_deficiency/
└── README.md
```

## Data Collection Guidelines
- Use high-quality images (minimum 1024x768 resolution)
- Capture leaves under natural lighting conditions
- Include various angles and lighting conditions
- Label images accurately based on expert diagnosis
- Minimum 20 images per class for reliable evaluation

## Usage
Images in this dataset are used for:
- Model accuracy evaluation
- Confusion matrix generation
- Performance metric calculation
- Cross-validation testing

## Current Status
- Dataset creation in progress
- Need to collect and label real coffee leaf images
- Target: 50+ images per class for robust evaluation
