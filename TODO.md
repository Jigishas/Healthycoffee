# TODO: Fix Backend Failures

## Steps
- [x] 0. Analyze root causes of backend failure (CORS errors, 502/503)
- [x] 1. Verify model file availability (missing scripted/quantized deficiency models)
- [x] 2. Read serving_utils.py, app.py, render.yaml, requirements.txt
- [x] 3. Get user approval for the fix plan
- [x] 4. Fix serving_utils.py - add fallback to .pth weights when scripted/quant files missing
- [x] 5. Fix app.py - remove Redis cache, fix model paths, add robust CORS error handling
- [x] 6. Fix render.yaml - update start command, remove Redis, add health check
- [x] 7. Verify requirements.txt correctness
- [ ] 8. Test backend locally and verify CORS/health endpoints

