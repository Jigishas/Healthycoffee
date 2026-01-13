import React, { useState, useRef, useEffect } from 'react';
import { resizeImage } from '../../lib/imageUtils';

const TARGET_WIDTH = 224;
const TARGET_HEIGHT = 224;
const BACKEND_URL = 'https://healthycoffee.onrender.com';
const LOCAL_FALLBACK = 'http://localhost:5000';



export default function CameraCapture({ uploadUrl = `${BACKEND_URL}/api/upload-image`, onResult }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);

  const [stream, setStream] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeBackend, setActiveBackend] = useState(null);
  const [backendChecking, setBackendChecking] = useState(false);
  const [backendError, setBackendError] = useState(null);
  const [lastFile, setLastFile] = useState(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((t) => t.stop());
      }
    };
  }, [stream]);

  const startCamera = async () => {
    setCameraLoading(true);
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = s;
        videoRef.current.play();
      }
      setStream(s);
      setCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setError('Unable to access camera. Please check permissions.');
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  const capturePhoto = async () => {
    if (!videoRef.current) return;

    setError(null);
    setLoading(true);

    try {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!canvas) throw new Error('Canvas not available');

      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context not available');

      // Set canvas to target size
      canvas.width = TARGET_WIDTH;
      canvas.height = TARGET_HEIGHT;

      // Calculate cropping to maintain aspect ratio
      const videoAspect = video.videoWidth / video.videoHeight;
      const targetAspect = TARGET_WIDTH / TARGET_HEIGHT;
      let sx = 0, sy = 0, sWidth = video.videoWidth, sHeight = video.videoHeight;

      if (videoAspect > targetAspect) {
        sWidth = video.videoHeight * targetAspect;
        sx = (video.videoWidth - sWidth) / 2;
      } else {
        sHeight = video.videoWidth / targetAspect;
        sy = (video.videoHeight - sHeight) / 2;
      }

      ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, TARGET_WIDTH, TARGET_HEIGHT);

      canvas.toBlob(async (blob) => {
        if (!blob) throw new Error('Failed to create image blob');

        const url = URL.createObjectURL(blob);
        setPreview(url);
        setLastFile(blob);

        await uploadAndAnalyzeImage(blob);
        stopCamera();
      }, 'image/jpeg', 0.95);
    } catch (err) {
      console.error('Capture error:', err);
      setError('Failed to capture photo');
      setLoading(false);
    }
  };

  const openCameraFile = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.setAttribute('capture', 'environment');
      cameraInputRef.current.click();
    }
  };

  const openGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.removeAttribute('capture');
      galleryInputRef.current.click();
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    e.target.value = '';

    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large (max 10MB)');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreview(url);
    setLastFile(file);
    await uploadAndAnalyzeImage(file);
  };

  const uploadAndAnalyzeImage = async (file) => {
    setError(null);
    setLoading(true);
    setResult(null);

    try {
      // Resize image to 224x224
      const resizedBlob = await resizeImage(file);

      // Ensure we have a working backend
      let backendToUse = activeBackend;
      if (!backendToUse) {
        backendToUse = await ensureBackend();
      }

      if (!backendToUse && !uploadUrl) {
        throw new Error('No backend available for analysis. Please check your connection and try again.');
      }

      // Build the final endpoint using the provided uploadUrl and the detected backend base if needed
      const buildEndpoint = (backendBase) => {
        try {
          const parsed = new URL(uploadUrl);
          if (backendBase) {
            const base = new URL(backendBase);
            return `${base.origin}${parsed.pathname}${parsed.search}`;
          }
          return parsed.toString();
        } catch (e) {
          // uploadUrl might be a relative path like '/api/upload-image'
          if (backendBase) return backendBase.replace(/\/$/, '') + (uploadUrl.startsWith('/') ? uploadUrl : '/' + uploadUrl);
          return uploadUrl;
        }
      };

      const endpoint = buildEndpoint(backendToUse);
      if (!endpoint) throw new Error('Failed to build backend endpoint');

      // Upload resized image as FormData
      const fd = new FormData();
      fd.append('image', resizedBlob, 'resized_image.jpg');

      const resp = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Accept: 'application/json'
        },
        body: fd
      });

      if (!resp.ok) {
        throw new Error(`Server responded with status: ${resp.status}`);
      }

      let json;
      try {
        json = await resp.json();
      } catch (e) {
        throw new Error('Invalid JSON response from server');
      }

      if (json.error) throw new Error(json.error);

      setResult(json);
      if (onResult) onResult(json);
    } catch (err) {
      console.error('Upload/analysis error:', err);
      setError(err.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  const checkBackend = async (baseUrl, timeoutMs = 4000) => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const resp = await fetch(`${baseUrl}/health`, {
          method: 'GET',
          signal: controller.signal
        });
        clearTimeout(id);
        return resp.ok;
      } finally {
        clearTimeout(id);
      }
    } catch (err) {
      return false;
    }
  };

  const ensureBackend = async () => {
    setBackendChecking(true);
    setBackendError(null);
    try {
      // Prefer explicit host from uploadUrl if it's absolute
      try {
        const parsed = new URL(uploadUrl);
        const origin = parsed.origin;
        if (await checkBackend(origin)) {
          setActiveBackend(origin);
          return origin;
        }
      } catch (e) {
        // uploadUrl not absolute, fall back to defaults
      }

      if (await checkBackend(BACKEND_URL)) {
        setActiveBackend(BACKEND_URL);
        return BACKEND_URL;
      }
      if (await checkBackend(LOCAL_FALLBACK)) {
        setActiveBackend(LOCAL_FALLBACK);
        return LOCAL_FALLBACK;
      }
      setActiveBackend(null);
      setBackendError('No reachable backend');
      return null;
    } finally {
      setBackendChecking(false);
    }
  };

  const retryBackend = async () => {
    setError(null);
    const selected = await ensureBackend();
    if (selected && lastFile) {
      await uploadAndAnalyzeImage(lastFile);
    }
  };



  const resetCapture = () => {
    setPreview('');
    setError(null);
    setLoading(false);
    setResult(null);
    stopCamera();

    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg hover:scale-105 transition-transform">
            <span className="text-4xl text-white">🌿</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Leaf Analysis</h1>
          <p className="text-slate-600">Capture or upload leaf image for analysis</p>
        </div>

        {cameraActive && (
          <div className="mb-8">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white bg-black">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-80 object-contain"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4">
                <button
                  onClick={capturePhoto}
                  className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform active:scale-95"
                >
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full border-4 border-white"></div>
                </button>
              </div>
            </div>
            <button
              onClick={stopCamera}
              className="mt-4 w-full py-3 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <span>✕</span>
              Cancel Camera
            </button>
          </div>
        )}

        {preview && !cameraActive && (
          <div className="mb-8">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={preview}
                alt="Captured leaf"
                className="w-full h-80 object-contain bg-slate-100"
              />
              <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                Preview
              </div>
            </div>

            {!loading && (
              <button
                onClick={resetCapture}
                className="mt-4 w-full py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
              >
                <span>🔄</span>
                Capture New
              </button>
            )}
          </div>
        )}

        {cameraLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Accessing camera...</p>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="relative mx-auto w-20 h-20 mb-6">
              <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-pulse"></div>
              <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">Analyzing Image</h3>
            <p className="text-slate-600">Connecting to AI analysis service...</p>
          </div>
        )}

        {error && (
          <div className="bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-200 p-6 mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl text-white">⚠️</span>
              </div>
              <div className="flex-1">
                <p className="text-rose-700 font-medium">{error}</p>
              </div>
              <div className="flex items-center gap-2">
                {backendChecking ? (
                  <div className="px-4 py-2 bg-white border border-rose-300 text-rose-700 rounded-lg font-medium">
                    Checking backends...
                  </div>
                ) : (backendError || (error && error.includes('No backend'))) ? (
                  <>
                    <button
                      onClick={retryBackend}
                      className="px-3 py-2 bg-white border border-emerald-300 text-emerald-700 rounded-lg font-medium hover:bg-emerald-50 transition-colors"
                    >
                      Retry Backend
                    </button>
                    <button
                      onClick={resetCapture}
                      className="px-3 py-2 bg-white border border-slate-200 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </>
                ) : (
                  <button
                    onClick={resetCapture}
                    className="px-4 py-2 bg-white border border-rose-300 text-rose-700 rounded-lg font-medium hover:bg-rose-50 transition-colors"
                  >
                    OK
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {!preview && !loading && !cameraActive && !cameraLoading && !result && (
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <button
                onClick={startCamera}
                className="group py-6 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg flex flex-col items-center justify-center gap-3"
              >
                <span className="text-4xl">📷</span>
                <span>Use Camera</span>
                <span className="text-sm font-normal opacity-90">Live capture</span>
              </button>

              <button
                onClick={openGallery}
                className="group py-6 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-all hover:scale-[1.02] shadow-lg flex flex-col items-center justify-center gap-3"
              >
                <span className="text-4xl">🖼️</span>
                <span>From Gallery</span>
                <span className="text-sm font-normal opacity-90">Upload image</span>
              </button>
            </div>

            <div className="text-center">
              <button
                onClick={openCameraFile}
                className="text-slate-600 hover:text-slate-800 text-sm font-medium hover:underline"
              >
                Can't access camera? Use file picker
              </button>
            </div>
          </div>
        )}

        {result && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="text-emerald-500">📊</span>
              Analysis Results
            </h2>

            <div className="space-y-8">
              {result.deficiency_prediction && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-blue-500">🧪</span>
                    Nutrient Analysis
                  </h3>
                  <div className="mb-4">
                    <div className="text-xl font-bold text-slate-800 mb-2">
                      {result.deficiency_prediction.class}
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                          style={{ width: `${result.deficiency_prediction.confidence ? Math.round(result.deficiency_prediction.confidence * 100) : 0}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-slate-700">
                        {result.deficiency_prediction.confidence ? Math.round(result.deficiency_prediction.confidence * 100) : 'N/A'}% confidence
                      </span>
                    </div>
                    {result.deficiency_prediction.explanation && (
                      <p className="text-slate-700 mb-3">{result.deficiency_prediction.explanation}</p>
                    )}
                    {result.deficiency_prediction.recommendation && (
                      <div className="bg-blue-100/80 rounded-lg p-3">
                        <div className="font-semibold text-blue-800 mb-1">Recommendation:</div>
                        <p className="text-blue-700">{result.deficiency_prediction.recommendation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {result.disease_prediction && (
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 rounded-xl p-5 border border-rose-100">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-rose-500">🔬</span>
                    Disease Detection
                  </h3>
                  <div className="mb-4">
                    <div className="text-xl font-bold text-slate-800 mb-2">
                      {result.disease_prediction.class}
                    </div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-1 bg-slate-200 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-rose-500 to-pink-600 h-2 rounded-full"
                          style={{ width: `${result.disease_prediction.confidence ? Math.round(result.disease_prediction.confidence * 100) : 0}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-slate-700">
                        {result.disease_prediction.confidence ? Math.round(result.disease_prediction.confidence * 100) : 'N/A'}% confidence
                      </span>
                    </div>
                    {result.disease_prediction.explanation && (
                      <p className="text-slate-700 mb-3">{result.disease_prediction.explanation}</p>
                    )}
                    {result.disease_prediction.recommendation && (
                      <div className="bg-rose-100/80 rounded-lg p-3">
                        <div className="font-semibold text-rose-800 mb-1">Recommendation:</div>
                        <p className="text-rose-700">{result.disease_prediction.recommendation}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {result.recommendations && (
                <div className="space-y-6">
                  {result.recommendations.disease_recommendations && (
                    <div className="bg-gradient-to-br from-purple-50 to-violet-50 rounded-xl p-5 border border-purple-100">
                      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="text-purple-500">🛡️</span>
                        Disease Management Plan
                      </h3>

                      {result.recommendations.disease_recommendations.overview && (
                        <div className="mb-4">
                          <div className="font-semibold text-purple-800 mb-2">Overview:</div>
                          <p className="text-slate-700">{result.recommendations.disease_recommendations.overview}</p>
                        </div>
                      )}

                      {result.recommendations.disease_recommendations.symptoms && (
                        <div className="mb-4">
                          <div className="font-semibold text-purple-800 mb-2">Symptoms:</div>
                          <ul className="space-y-1">
                            {result.recommendations.disease_recommendations.symptoms.map((symptom, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-purple-500 mt-1">•</span>
                                <span className="text-slate-700">{symptom}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.recommendations.disease_recommendations.integrated_management && (
                        <div>
                          <div className="font-semibold text-purple-800 mb-2">Management Strategies:</div>
                          <div className="grid md:grid-cols-2 gap-4">
                            {result.recommendations.disease_recommendations.integrated_management.cultural_practices && (
                              <div>
                                <div className="font-medium text-slate-800 mb-1">Cultural:</div>
                                <ul className="space-y-1">
                                  {result.recommendations.disease_recommendations.integrated_management.cultural_practices.map((practice, idx) => (
                                    <li key={idx} className="text-sm text-slate-700">• {practice}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                            {result.recommendations.disease_recommendations.integrated_management.chemical_control && (
                              <div>
                                <div className="font-medium text-slate-800 mb-1">Chemical:</div>
                                <ul className="space-y-1">
                                  {result.recommendations.disease_recommendations.integrated_management.chemical_control.map((control, idx) => (
                                    <li key={idx} className="text-sm text-slate-700">• {control}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {result.recommendations.deficiency_recommendations && (
                    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                      <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="text-emerald-500">🌱</span>
                        Nutrition Management
                      </h3>

                      {result.recommendations.deficiency_recommendations.symptoms && (
                        <div className="mb-4">
                          <div className="font-semibold text-emerald-800 mb-2">Symptoms:</div>
                          <ul className="space-y-1">
                            {result.recommendations.deficiency_recommendations.symptoms.map((symptom, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-500 mt-1">•</span>
                                <span className="text-slate-700">{symptom}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {result.recommendations.deficiency_recommendations.basic && (
                        <div>
                          <div className="font-semibold text-emerald-800 mb-2">Basic Recommendations:</div>
                          <ul className="space-y-2">
                            {result.recommendations.deficiency_recommendations.basic.map((rec, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="text-emerald-500 mt-1">•</span>
                                <span className="text-slate-700">{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        <input
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          ref={cameraInputRef}
          onChange={handleFileSelect}
        />
        <input
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={galleryInputRef}
          onChange={handleFileSelect}
        />
        <canvas ref={canvasRef} style={{ display: 'none' }} />

        {result && (
          <button
            onClick={resetCapture}
            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-3 shadow-lg"
          >
            <span>🌿</span>
            Analyze Another Leaf
          </button>
        )}
      </div>
    </div>
  );
}
