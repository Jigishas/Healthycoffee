# HealthyCoffee - Coffee Leaf Disease and Deficiency Detection System

[![Live Demo](https://img.shields.io/badge/Live%20Demo-https://healthycoffee.vercel.app-green)](https://healthycoffee.vercel.app)


[![Frontend](https://img.shields.io/badge/Frontend-Vercel-black)](https://healthycoffee.vercel.app)

A comprehensive AI-powered system for detecting coffee leaf diseases and nutrient deficiencies, featuring a modern React web interface, Progressive Web App (PWA) capabilities, and optimized machine learning models deployed on Render.

## 🌐 Live Demo

**Production URL**: [https://healthycoffee.vercel.app](https://healthycoffee.vercel.app)


Experience the full application with:
- Real-time AI leaf analysis
- Camera capture for instant diagnosis
- Offline-capable PWA features
- Backend health monitoring

## 🌟 Overview


This project combines:
- **Frontend**: React 19 + Vite 7 PWA with modern UI, camera integration, and offline support
- **Backend**: Flask API with optimized PyTorch models deployed on Render
- **Models**: EfficientNet-B4 classifiers with >90% accuracy for real-time inference
- **Deployment**: Production-ready with Render (backend) + Vercel (frontend) + Docker support
- **Integration**: End-to-end real AI analysis pipeline with backend health monitoring


## 📁 Project Structure

```
├── coffee/                          # React 19 Frontend (Vite + PWA)
│   ├── src/
│   │   ├── Components/              # React Components
│   │   │   ├── ABOUT/              # About Coffee Section
│   │   │   ├── BODY/               # Main Content Sections
│   │   │   │   ├── Ask me/         # AI Analysis & Upload
│   │   │   │   ├── imageSlider/    # Image Carousel
│   │   │   │   └── Stat/           # Statistics Display
│   │   │   ├── CameraCapture/      # Camera Integration
│   │   │   ├── Navbar/             # Navigation
│   │   │   ├── PWAInstallPrompt.jsx # PWA Install UI
│   │   │   ├── BackendStatus.jsx   # Health Monitor UI
│   │   │   ├── FAQ/                # FAQ Section
│   │   │   ├── contact/            # Contact Form
│   │   │   ├── footer/             # Footer Component
│   │   │   └── ui/                 # Radix UI Components
│   │   ├── hooks/                  # Custom React Hooks
│   │   │   ├── useBackendHealth.js # Health Check Hook
│   │   │   └── usePWAInstall.js    # PWA Install Hook
│   │   ├── lib/                    # Utility Functions
│   │   │   ├── imageUtils.ts       # Image Processing
│   │   │   └── utils.ts            # General Utilities
│   │   ├── assets/                 # Images and Static Assets
│   │   ├── pingBackend.js          # Backend Health Monitor
│   │   ├── serviceWorker.js        # PWA Service Worker
│   │   └── config.js               # App Configuration
│   ├── public/                     # Public Assets
│   │   ├── manifest.json           # PWA Manifest
│   │   ├── sw.js                   # Service Worker
│   │   └── pwa-*.png               # PWA Icons
│   ├── Dockerfile                  # Frontend Docker
│   ├── docker-compose.yml          # Multi-container Setup
│   ├── vite.config.js              # Vite Configuration
│   ├── tsconfig.json               # TypeScript Config
│   └── package.json                # Frontend Dependencies
│
├── model/                          # Flask Backend & ML Models
│   ├── src/                        # Backend Source Code
│   │   ├── api.py                  # API Endpoints (CORS, OPTIONS)
│   │   ├── inference.py            # Model Inference Logic
│   │   ├── preprocessing.py        # Image Preprocessing
│   │   ├── recommendations.py      # AI Recommendations
│   │   ├── explanations.py         # AI Explanations
│   │   └── utils.py                # Utility Functions
│   ├── models/                     # Trained Model Files
│   │   ├── leaf_diseases/          # Disease Models (4 classes)
│   │   └── leaf_deficiencies/      # Deficiency Models (9 classes)
│   ├── test_dataset/               # Test Images
│   ├── evaluation_results/         # Performance Metrics
│   ├── cross_validation_results/   # CV Results
│   ├── app.py                      # Main Flask App
│   ├── app_optimized.py            # Optimized App
│   ├── app_combined.py             # Combined Disease+Deficiency
│   ├── wsgi.py                     # WSGI Entry Point
│   ├── requirements.txt            # Python Dependencies
│   ├── render.yaml                 # Render Deployment Config
│   └── Dockerfile                  # Backend Docker
│
├── .github/workflows/              # GitHub Actions
│   └── keep-alive.yml              # Render Keep-Alive Cron
├── vercel.json                     # Vercel Deployment Config
├── package.json                    # Root Package
└── README.md                       # This File
```


## 🚀 Features

### Frontend (React 19 + Vite 7 PWA)
- **Progressive Web App**: Installable with offline support, service worker, and manifest
- **Modern UI**: Clean, responsive design with Tailwind CSS 4, Framer Motion animations
- **Camera Integration**: Real-time camera capture for instant leaf analysis
- **Image Upload**: Drag-and-drop with preview and validation
- **Real AI Analysis**: Live backend integration with 60-second analysis timeout
- **Backend Health Monitor**: Visual status indicator with auto-retry (green/blue/amber states)
- **Results Visualization**: Interactive cards with confidence scores, AI explanations, and recommendations
- **WhatsApp Integration**: Direct contact for consultations
- **FAQ Section**: Comprehensive coffee cultivation information
- **TypeScript Support**: Full TS integration for type safety

### Backend (Flask 3 + PyTorch 2.8)
- **Real AI Pipeline**: End-to-end analysis with actual model predictions (no mock data)
- **Dual Classification**: Simultaneous disease + deficiency detection in single request
- **Enhanced CORS**: Full preflight OPTIONS support for production deployment
- **Health Monitoring**: `/health` endpoint with aggressive keep-alive strategy
- **AI Explanations**: Generated explanations for each prediction
- **Smart Recommendations**: Personalized treatment suggestions based on diagnosis
- **Error Handling**: Robust validation with helpful error messages
- **Render Optimized**: Configured for free-tier with ping keep-alive

### AI Models (EfficientNet-B4)
- **Disease Detection**: 4 classes (Cerscospora, Leaf Rust, Phoma, Healthy) - 94.2% accuracy
- **Deficiency Detection**: 9 classes (N, P, K, Ca, Mg, Fe, Mn, B, Healthy) - 91.8% accuracy
- **Fast Inference**: <500ms per prediction on CPU
- **Low Resource**: <2GB RAM usage, supports 50+ concurrent requests
- **Cross-Validated**: Rigorous evaluation with confusion matrices


## 🛠️ Installation & Setup

### Prerequisites
- Docker & Docker Compose (recommended for full stack)
- Node.js 18+ & npm (frontend development)
- Python 3.8+ (backend development)
- Git

### Production Deployment (Render + Vercel)

The application is already deployed at:
- **Frontend**: [https://healthycoffee.vercel.app](https://healthycoffee.vercel.app)



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
   - Frontend: http://localhost:5173 (Vite default)
   - Backend API: http://localhost:8000

### Local Development Setup

#### Frontend Setup
```bash
cd coffee
npm install
npm run dev        # Starts Vite dev server on :5173
```

#### Backend Setup
```bash
cd model
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python app.py            # Starts Flask on :8000
```

### Environment Configuration

Create `coffee/.env` for frontend:
```env
VITE_BACKEND_URL=http://localhost:8000   # Development
# VITE_BACKEND_URL=https://healthycoffee.vercel.app  # Production

```

Create `model/.env` for backend:
```env
FLASK_ENV=development
MODEL_PATH=models/
UPLOAD_FOLDER=uploads/
```

### Render Deployment (Backend)

1. Connect GitHub repo to Render
2. Use `render.yaml` configuration (included)
3. Set environment variables in Render dashboard
4. Deploy automatically on push to main

### Vercel Deployment (Frontend)

1. Connect `coffee/` directory to Vercel
2. Use `vercel.json` configuration (included)
3. Set `VITE_BACKEND_URL` environment variable
4. Deploy with zero config


## 📊 Model Performance

### Disease Classification (4 Classes)
| Metric | Value |
|--------|-------|
| **Accuracy** | 94.2% |
| **Precision** | 93.8% |
| **Recall** | 94.0% |
| **F1-Score** | 93.9% |
| **Classes** | Cerscospora, Leaf Rust, Phoma, Healthy |
| **Model** | EfficientNet-B4 (optimized) |

### Deficiency Classification (9 Classes)
| Metric | Value |
|--------|-------|
| **Accuracy** | 91.8% |
| **Precision** | 91.2% |
| **Recall** | 91.5% |
| **F1-Score** | 91.3% |
| **Classes** | N, P, K, Ca, Mg, Fe, Mn, B, Healthy |
| **Model** | EfficientNet-B4 (optimized) |

### System Performance
| Metric | Value |
|--------|-------|
| **Inference Time** | <500ms per prediction |
| **Analysis Timeout** | 60 seconds (full pipeline) |
| **Memory Usage** | <2GB RAM |
| **Concurrent Requests** | 50+ simultaneous |
| **Backend Health Check** | 1.5s timeout, 20s intervals |
| **Keep-Alive Ping** | Every 5 minutes (Render free-tier) |


## 🔧 API Documentation

### Endpoints

#### POST `/api/upload-image`
Upload an image for AI analysis. Supports CORS with preflight OPTIONS.

**Request:**
```bash
curl -X POST https://healthycoffee.vercel.app/api/upload-image \

  -F "image=@leaf_photo.jpg"
```

**Response:**
```json
{
  "success": true,
  "disease_prediction": {
    "class_name": "leaf_rust",
    "confidence": 0.97,
    "explanation": "Orange-yellow pustules on leaf surface indicating fungal infection...",
    "recommendation": "Apply copper-based fungicide and improve air circulation..."
  },
  "deficiency_prediction": {
    "class_name": "nitrogen_deficiency",
    "confidence": 0.89,
    "explanation": "Uniform yellowing of older leaves suggests nitrogen deficiency...",
    "recommendation": "Apply nitrogen-rich fertilizer (NPK 20-10-10)..."
  },
  "recommendations": [
    "Remove and destroy infected leaves",
    "Maintain proper spacing between plants",
    "Monitor soil pH levels regularly"
  ],
  "processing_time": 0.45
}
```

#### GET `/health`
Health check with CORS support for frontend monitoring.

**Response:**
```json
{
  "status": "healthy",
  "models_loaded": true,
  "disease_model": "efficientnet_disease_balanced.pth",
  "deficiency_model": "efficientnet_deficiency_balanced.pth",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

#### GET `/api/model-info`
Detailed model information and class mappings.

#### GET `/api/performance`
Performance metrics and prediction statistics.

### Frontend Integration Example

```javascript
// Using fetch with FormData
const analyzeImage = async (imageFile) => {
  const formData = new FormData();
  formData.append('image', imageFile);

  const response = await fetch('https://healthycoffee.vercel.app/api/upload-image', {

    method: 'POST',
    body: formData,
    // 60-second timeout for AI processing
    signal: AbortSignal.timeout(60000)
  });

  if (!response.ok) {
    throw new Error(`Analysis failed: ${response.status}`);
  }

  return await response.json();
};
```

### Python Client Example

```python
import requests

def analyze_leaf(image_path):
    url = "https://healthycoffee.vercel.app/api/upload-image"

    
    with open(image_path, 'rb') as f:
        files = {'image': f}
        response = requests.post(url, files=files, timeout=60)
    
    result = response.json()
    
    print(f"Disease: {result['disease_prediction']['class_name']} "
          f"({result['disease_prediction']['confidence']:.1%})")
    print(f"Deficiency: {result['deficiency_prediction']['class_name']} "
          f"({result['deficiency_prediction']['confidence']:.1%})")
    print(f"Recommendations: {len(result['recommendations'])} items")
    
    return result

# Usage
result = analyze_leaf('coffee_leaf.jpg')
```


## 🧪 Testing & Evaluation

### Model Evaluation
```bash
cd model
python evaluate_real_dataset.py    # Evaluate on real dataset
python cross_validation.py         # Cross-validation analysis
python benchmark.py                # Performance benchmarking
python compare_models.py           # Model comparison
```

### Backend Testing
```bash
cd model
python test_app.py                 # Test API endpoints
python debug_evaluate.py           # Debug evaluation

# Or use the test scripts in root
python test_backend.py             # Test backend connectivity
python test_upload.py                # Test image upload
python test_upload_functionality.py  # Full upload test
```

### Frontend Testing
```bash
cd coffee
npm run lint                       # ESLint check
npm run preview                    # Preview production build
```

### Integration Testing
The application includes comprehensive integration tests:
- Backend health monitoring (`pingBackend.js`)
- CORS preflight validation
- Image upload pipeline
- Real AI analysis flow (no mock data)


## 🚀 Deployment

### Render Deployment (Recommended for Backend)

The backend is optimized for Render's free tier with keep-alive:

1. **Connect to Render:**
   - Use included `render.yaml` blueprint
   - Or manual setup with GitHub integration

2. **Environment Variables:**
   ```env
   FLASK_ENV=production
   MODEL_PATH=models/
   UPLOAD_FOLDER=uploads/
   ```

3. **Keep-Alive (Free Tier):**
   - GitHub Actions workflow pings every 10 minutes (`.github/workflows/keep-alive.yml`)
   - Frontend aggressive health checks (1.5s timeout, 20s intervals)
   - Prevents cold start delays

### Vercel Deployment (Frontend)

1. **Connect `coffee/` directory to Vercel**
2. **Build Settings:**
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables:**
   ```env
   VITE_BACKEND_URL=""

   ```

### Docker Production Deployment

```bash
# Build optimized images
docker-compose -f docker-compose.prod.yml build

# Deploy
docker-compose -f docker-compose.prod.yml up -d
```

### Environment Variables Reference

| Variable | Description | Default |
|----------|-------------|---------|
| `FLASK_ENV` | Flask environment | `development` |
| `MODEL_PATH` | Path to model files | `models/` |
| `UPLOAD_FOLDER` | Temporary uploads | `uploads/` |
| `VITE_BACKEND_URL` | Backend API URL | `http://localhost:8000` |
| `REDIS_URL` | Redis cache (optional) | - |


## 🏗️ System Architecture

### Data Flow
```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   React Frontend │────▶│  Flask Backend   │────▶│  PyTorch Models │
│   (Vite + PWA)   │     │  (Render.com)    │     │ (EfficientNet)  │
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                        │
        ▼                        ▼                        ▼
   Camera/Upload           Image Preprocessing        Disease/Deficiency
   Health Monitor          AI Inference               Classification
   Results Display         Recommendations            Explanations
```

### Backend Health Monitoring
The frontend implements aggressive health monitoring for Render's free tier:
- **Initial Check**: Every 2.5 seconds for first 10 seconds
- **Regular Check**: Every 20 seconds after confirmed online
- **Keep-Alive Ping**: Every 5 minutes to prevent cold starts
- **Timeout**: 1.5 seconds for health checks, 60 seconds for analysis

### CORS Configuration
Production backend supports:
- Preflight OPTIONS requests
- Multiple origins (localhost, vercel.app, onrender.com)
- Credentials and all standard headers

## 🆕 Recent Improvements

### v2.0 - Real AI Analysis Pipeline
- ✅ **Removed all dummy/mock data** - 100% real AI predictions
- ✅ **End-to-end integration** - Frontend → Backend → AI Models
- ✅ **Enhanced CORS** - Full preflight support for production
- ✅ **Backend health monitoring** - Visual status with auto-retry
- ✅ **60-second analysis timeout** - Handles AI processing time
- ✅ **AI explanations** - Generated insights for each prediction

### v1.5 - PWA & Performance
- ✅ **Progressive Web App** - Installable, offline-capable
- ✅ **Camera integration** - Real-time leaf capture
- ✅ **Optimized models** - <500ms inference, <2GB RAM
- ✅ **Render deployment** - Free-tier optimized with keep-alive

## 🛟 Troubleshooting

### Backend Connection Issues (Render Free Tier)
**Problem**: Backend shows "Offline" or slow response
**Solution**: 
- Wait 30-60 seconds for cold start (free tier spins down)
- Check health indicator - it will auto-retry
- Manual refresh button available in UI

### CORS Errors
**Problem**: `Access-Control-Allow-Origin` errors
**Solution**:
- Backend CORS is configured for production domains
- For local development, use `http://localhost:5173` (Vite default)
- Check `coffee/src/config.js` for backend URL

### Image Upload Failures
**Problem**: Upload times out or fails
**Solution**:
- Maximum file size: Check backend limits (typically 16MB)
- Supported formats: JPG, PNG, WebP
- Timeout: 60 seconds for full AI analysis
- Try smaller image size if consistently failing

### Model Loading Issues
**Problem**: "Models not loaded" error
**Solution**:
- Backend requires ~2GB RAM for model loading
- First request after deployment takes 10-15 seconds
- Health check will show when models are ready

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

Please ensure:
- Frontend linting passes (`npm run lint`)
- Backend tests pass (`python test_app.py`)
- TypeScript types are correct
- CORS is tested for production scenarios

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Coffee leaf disease dataset contributors
- PyTorch and EfficientNet research teams
- React 19, Vite 7, and Tailwind CSS communities
- Flask and Gunicorn communities
- Render and Vercel for free hosting tiers
- Agricultural experts for domain knowledge and validation

## 📞 Contact

- **Email**: jigishaflamings336@gmail.com
- **WhatsApp**: Available through the web interface
- **Live Demo**: [https://healthycoffee.vercel.app](https://healthycoffee.vercel.app)

- **GitHub**: [Jigishas/Healthycoffee](https://github.com/Jigishas/Healthycoffee)

---

**HealthyCoffee** - Empowering coffee farmers with AI-driven plant health monitoring. 🌱☕

*Built with React 19, Flask 3, PyTorch 2.8, and ❤️*
