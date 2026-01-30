# Fix Upload and Analysis Issues

## Issues Identified
1. **Model Loading Bug**: `predict` method uses `self.model` but never calls `load_model()`, causing AttributeError.
2. **Slow Inference**: Model loads on every prediction (lazy loading broken), taking ~159 seconds.
3. **CORS Error**: Backend lacks CORS headers for frontend origin (https://healthycoffee.vercel.app).
4. **Config Mismatch**: Frontend config forces localhost, but deployed app uses production URL.
5. **Class Name Inconsistency**: Imports `OptimizedTorchClassifier` but class is `LightweightTorchClassifier`.

## Plan
- [x] Fix model loading in `predict` method by calling `load_model()` if needed.
- [x] Add CORS headers to Flask app for frontend origin.
- [x] Update frontend config to use production URL.
- [x] Add alias `OptimizedTorchClassifier = LightweightTorchClassifier` in optimize_model.py.
- [x] Optionally preload models at startup for faster inference.

## Summary of Changes
- **Model Loading Fix**: Added check in `predict()` to load model if not already loaded, preventing AttributeError.
- **CORS Fix**: Updated Flask CORS to allow requests from `https://healthycoffee.vercel.app` and `http://localhost:3000`.
- **Config Fix**: Updated frontend config to use production URL when not in localhost development.
- **Class Alias**: Added `OptimizedTorchClassifier = LightweightTorchClassifier` to fix import issues.
- **Performance Optimization**: Added preload option to load models at startup, reducing inference time from ~159s to expected ~1-2s.

The backend should now handle uploads faster and without CORS errors. Test the deployment to verify fixes.
