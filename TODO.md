# Backend Optimization & Analysis Pipeline Fix
## Status: [In Progress] ✅ Approved Plan

## Step 1: Create/Update Primary App (app.py) - Enhanced Logging & Test Endpoint
- [ ] Enhance model/app.py: Add prediction logging (top-3 classes, image shape), /api/test-image endpoint, top-3 in response
- [ ] Update model/src/inference.py: TorchClassifier.predict return top-3 predictions

## Step 2: Clean Requirements & Remove Redundancies
- [ ] Trim model/requirements.txt: Remove unused (redis, Flask-Caching, onnxruntime, opencv, plotting libs)
- [ ] DELETE: model/app_combined.py, model/app_optimized.py, model/src/api.py, model/src/preprocessing.py

## Step 3: CORS Verification
- [ ] Add /api/cors-test endpoint in app.py
- [ ] Test frontend -> backend connectivity

## Step 4: Install & Test
- [ ] `pip install -r model/requirements.txt`
- [ ] Local test: `python model/app.py` + curl POST /api/v1/upload-image & /api/test-image
- [ ] Deploy Render/Vercel, check logs
- [ ] Frontend test: coffee/src/Components/BODY/Ask me/Upload.jsx

## Step 5: Validation
- [ ] Confirm image analysis works (no more "not analyzing")
- [ ] Verify CORS (frontend calls succeed)
- [ ] Performance: inference <2s, memory stable

**Next Action:** Update app.py with enhancements
