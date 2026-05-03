# HealthyCoffee Backend Deployment Fix - TODO

## Status: ✅ Step 1 Complete - Requirements.txt fixed

### Step 1: ✅ Fix requirements.txt
- [x] Replace model/requirements.txt with complete pinned dependencies
  - Flask==3.0.0
  - flask-cors==6.0.1 (fixes immediate error)
  - Flask-Caching==2.3.0 
  - torch==2.4.1+cpu (Render CPU-only)
  - torchvision==0.19.1+cpu
  - Pillow==11.1.0 (PIL)
  - gevent==24.11.2 (WSGI server)
  - numpy==2.1.1
  - scikit-learn==1.5.2

### ⏳ Next Steps:
### Step 2: ✅ Installation verified
- [x] Core deps (flask-cors, torch 2.6.0, torchvision 0.21.0) satisfied
- [x] Anaconda pip version quirks handled

### Step 3: ✅ Server running successfully!
- [x] `python app.py` → "Starting WSGI server on port 8003"
- [x] No flask_cors import error!
- [x] Server active (lazy model load)

