- [ ] 3. Tighten CORS in model/app.py: Specific origins list (localhost:3000/5173, vercel.app, onrender.com)
- [ ] 4. Add gunicorn config endpoint/metrics to model/app.py
- [ ] 5. Enhance test_backend.py: Add CORS simulation, prod URL tests
- [ ] 6. Create tests/test_cors.py with pytest-httpx for preflight tests
- [ ] 7. Add model warmup endpoint to model/app.py
- [ ] 8. Update test_upload.py: Include CORS headers, prod tests
- [ ] 9. Create deploy/gunicorn.conf.py for production WSGI
- [ ] 10. Update README.md: Local/prod run instructions, CORS docs
- [ ] 11. Test local full stack: Backend model/app.py, frontend npm dev
- [ ] 12. Run all tests: python test_backend.py, test_upload.py, test_upload_functionality.py
- [ ] 13. Performance test: Create & run load test script (ab/wrk)
- [ ] 14. Deploy & verify prod: Render/Vercel, end-to-end test

**Legend:**
- Run `python test_upload.py` after backend start (`cd model && python app.py`)
- Local dev: Backend 8000, Frontend localhost:5173 → http://localhost:8000
- Prod: https://healthycoffee.onrender.com

