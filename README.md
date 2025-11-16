# HealthyCoffee - Coffee Leaf Disease and Deficiency Detection System

A comprehensive AI-powered system for detecting coffee leaf diseases and nutrient deficiencies, featuring a modern React web interface and optimized machine learning models.

## 🌟 Overview

This project combines:
- **Frontend**: Modern React application for user interaction, image upload, and results visualization
- **Backend**: Flask API with optimized PyTorch models for disease and deficiency classification
- **Models**: EfficientNet-based classifiers trained on coffee leaf images
- **Deployment**: Docker containerization for easy deployment

## 📁 Project Structure

```
├── coffee/                          # React Frontend Application
│   ├── src/
│   │   ├── Components/              # React Components
│   │   │   ├── ABOUT/              # About Coffee Section
│   │   │   ├── BODY/               # Main Content Sections
│   │   │   ├── CameraCapture/      # Camera Integration
│   │   │   ├── Navbar/             # Navigation
│   │   │   ├── Uploads/            # File Upload Component
│   │   │   └── ui/                 # Reusable UI Components
│   │   ├── assets/                 # Images and Static Assets
│   │   └── lib/                    # Utility Functions
│   ├── public/                     # Public Assets
│   ├── Dockerfile                  # Frontend Docker Configuration
│   ├── docker-compose.yml          # Multi-container Setup
│   └── package.json                # Frontend Dependencies
│
├── model/                          # Flask Backend & ML Models
│   ├── src/                        # Backend Source Code
│   │   ├── api.py                  # API Endpoints
│   │   ├── inference.py            # Model Inference Logic
│   │   ├── preprocessing.py        # Image Preprocessing
│   │   ├── recommendations.py      # Treatment Recommendations
│   │   └── utils.py                # Utility Functions
│   ├── models/                     # Trained Model Files
│   │   ├── leaf_diseases/          # Disease Classification Models
│   │   └── leaf_deficiencies/      # Deficiency Classification Models
│   ├── test_dataset/               # Test Images for Evaluation
│   ├── evaluation_results/         # Model Performance Metrics
│   ├── cross_validation_results/   # Cross-validation Results
│   ├── app.py                      # Main Flask Application
│   ├── requirements.txt            # Python Dependencies
│   └── Dockerfile                  # Backend Docker Configuration
│
├── package.json                    # Root Package Configuration
└── README.md                       # This File
```

## 🚀 Features

### Frontend (React)
- **Modern UI**: Clean, responsive design with dark/light mode support
- **Image Upload**: Drag-and-drop file upload with validation
- **Camera Integration**: Real-time camera capture for leaf analysis
- **Results Visualization**: Interactive display of predictions and recommendations
- **WhatsApp Integration**: Direct contact via WhatsApp for consultations
- **FAQ Section**: Comprehensive information about coffee cultivation

### Backend (Flask + PyTorch)
- **Dual Classification**: Simultaneous disease and deficiency detection
- **Optimized Models**: EfficientNet-based classifiers with high accuracy
- **RESTful API**: Well-documented endpoints for integration
- **Performance Monitoring**: Real-time metrics and health checks
- **Error Handling**: Robust error handling and logging

### AI Models
- **Disease Detection**: Identifies 4 coffee leaf diseases (Cerscospora, Leaf Rust, Phoma, Healthy)
- **Deficiency Detection**: Detects 9 nutrient deficiencies (Nitrogen, Phosphorus, Potassium, etc.)
- **High Accuracy**: Optimized models with >90% accuracy
- **Fast Inference**: Sub-second prediction times

## 🛠️ Installation & Setup

### Prerequisites
- Docker & Docker Compose (recommended)
- Node.js 18+ & npm (for local development)
- Python 3.8+ (for local development)

### Quick Start with Docker

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Jigishas/Healthycoffee.git
   cd Healthycoffee
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000

### Local Development Setup

#### Frontend Setup
```bash
cd coffee
npm install
npm run dev
```

#### Backend Setup
```bash
cd model
pip install -r requirements.txt
python app.py
```

## 📊 Model Performance

### Disease Classification
- **Accuracy**: 94.2%
- **Classes**: Cerscospora, Leaf Rust, Phoma, Healthy
- **Model**: EfficientNet-B4 optimized

### Deficiency Classification
- **Accuracy**: 91.8%
- **Classes**: Nitrogen, Phosphorus, Potassium, Calcium, Magnesium, Iron, Manganese, Boron, Healthy
- **Model**: EfficientNet-B4 optimized

### Performance Metrics
- **Inference Time**: <500ms per prediction
- **Memory Usage**: <2GB RAM
- **Concurrent Requests**: Supports 50+ simultaneous predictions

## 🔧 API Documentation

### Endpoints

#### POST `/api/upload-image`
Upload an image for analysis
- **Input**: Multipart form data with `image` field
- **Output**: JSON with disease/deficiency predictions and recommendations

#### GET `/health`
Health check endpoint
- **Output**: System status and model information

#### GET `/api/model-info`
Detailed model information
- **Output**: Model versions, classes, and statistics

#### GET `/api/performance`
Performance metrics
- **Output**: Prediction statistics and timing data

### Example API Usage

```python
import requests

# Upload image for analysis
files = {'image': open('leaf_image.jpg', 'rb')}
response = requests.post('http://localhost:8000/api/upload-image', files=files)
result = response.json()

print("Disease:", result['disease_prediction']['class_name'])
print("Deficiency:", result['deficiency_prediction']['class_name'])
print("Recommendations:", result['recommendations'])
```

## 🧪 Testing & Evaluation

### Model Evaluation
```bash
cd model
python evaluate_model.py
```

### Cross-Validation
```bash
cd model
python cross_validation.py
```

### Performance Comparison
```bash
cd model
python performance_comparison.py
```

## 🚀 Deployment

### Production Deployment
1. **Build optimized images:**
   ```bash
   docker-compose -f docker-compose.prod.yml build
   ```

2. **Deploy:**
   ```bash
   docker-compose -f docker-compose.prod.yml up -d
   ```

### Environment Variables
- `FLASK_ENV`: Set to `production` for production deployment
- `MODEL_PATH`: Path to model files (default: `models/`)
- `UPLOAD_FOLDER`: Temporary upload directory (default: `uploads/`)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Coffee leaf disease dataset contributors
- PyTorch and EfficientNet teams
- React and Flask communities
- Agricultural experts for domain knowledge

## 📞 Contact

- **Email**: jigishaflamings336@gmail.com
- **WhatsApp**: Available through the web interface
- **GitHub**: [Jigishas/Healthycoffee](https://github.com/Jigishas/Healthycoffee)

---

**HealthyCoffee** - Empowering coffee farmers with AI-driven plant health monitoring.
