# Backend Fix TODO

## Status: In Progress

## Steps to Complete:
- [x] 1. Update ping interval to 2 minutes
- [ ] 2. Simplify backend app.py with correct model paths
- [ ] 3. Test backend locally
- [ ] 4. Build and verify frontend changes work
- [ ] 5. Deploy to production

## Current Issues:
- Backend models paths are incorrect in app.py
- Memory issues on Render free tier
- Model loading causing 503 errors

## Fix Plan:
1. Fix model paths in app.py to point to correct locations
2. Use simpler model loading without complex fallbacks
3. Test locally before deployment
