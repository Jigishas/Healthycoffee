import React, { useState, useRef } from 'react';

const BACKEND_URL = 'http://127.0.0.1:8000';

const CameraCapture = () => {
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const componentRef = useRef(null);

  // Upload to backend with progress
  const uploadToBackend = async (file) => {
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fetch(`${BACKEND_URL}/api/upload-image`, {
        method: 'POST',
        body: formData,
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error('Upload error:', err);
      setError(err.message || 'Failed to upload image');
    } finally {
      setLoading(false);
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  // Handle camera capture
  const openCamera = async () => {
    setCameraLoading(true);
    setError(null);

    try {
      // First try with environment camera for mobile
      let constraints = { video: { facingMode: 'environment', width: { ideal: 640 }, height: { ideal: 480 } } };
      let stream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(stream);

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setCameraActive(true);
            setCameraLoading(false);
          }).catch(err => {
            console.error('Play error:', err);
            setCameraLoading(false);
            setError('Failed to start camera preview');
          });
        };
      } else {
        setCameraLoading(false);
        setError('Video element not available');
      }
    } catch (err) {
      console.error('Error with environment camera:', err);
      try {
        // Fallback to user-facing camera
        const constraints = { video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(() => {
              setCameraActive(true);
              setCameraLoading(false);
            }).catch(err => {
              console.error('Play error:', err);
              setCameraLoading(false);
              setError('Failed to start camera preview');
            });
          };
        } else {
          setCameraLoading(false);
          setError('Video element not available');
        }
      } catch (err2) {
        console.error('Error with user camera:', err2);
        try {
          // Final fallback to any camera
          const constraints = { video: { width: { ideal: 640 }, height: { ideal: 480 } } };
          const stream = await navigator.mediaDevices.getUserMedia(constraints);
          setStream(stream);

          if (videoRef.current) {
            videoRef.current.srcObject = stream;
            videoRef.current.onloadedmetadata = () => {
              videoRef.current.play().then(() => {
                setCameraActive(true);
                setCameraLoading(false);
              }).catch(err => {
                console.error('Play error:', err);
                setCameraLoading(false);
                setError('Failed to start camera preview');
              });
            };
          } else {
            setCameraLoading(false);
            setError('Video element not available');
          }
        } catch (err3) {
          console.error('Error accessing any camera:', err3);
          setCameraLoading(false);
          setError('Camera access denied or not available. Please check permissions and try again.');
          // Fallback to file input
          if (cameraInputRef.current) {
            cameraInputRef.current.click();
          }
        }
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
    setCameraLoading(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0);
      canvas.toBlob((blob) => {
        const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
        const imageUrl = URL.createObjectURL(file);
        setPreview(imageUrl);
        uploadToBackend(file);
        stopCamera();
      }, 'image/jpeg');
    }
  };



  // Handle gallery selection
  const openGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }

      const imageUrl = URL.createObjectURL(file);
      setPreview(imageUrl);
      uploadToBackend(file);
    }
  };

  const resetCapture = () => {
    setPreview('');
    setResult(null);
    setError(null);
    setUploadProgress(0);
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
    }
  };

  return (
    <div ref={componentRef} className="max-w-4xl mx-auto p-8 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 rounded-2xl shadow-xl border border-blue-200/50">
      <h2 className="text-3xl font-bold text-center mb-8 bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">Leaf Analysis Studio</h2>

      {/* Camera Loading State */}
      {cameraLoading && !preview && !loading && (
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-slate-200/50 shadow-xl">
            <h3 className="text-center text-xl font-bold text-slate-800 mb-4 flex items-center justify-center">
              <span className="text-2xl mr-3">📷</span>
              Camera Preview
            </h3>
            <div className="flex justify-center relative">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-w-md h-64 rounded-xl shadow-lg border-2 border-slate-200 object-cover bg-black"
              />
              <div className="absolute inset-0 bg-white flex items-center justify-center">
                <div className="flex items-center space-x-4 bg-white px-8 py-4 rounded-xl shadow-2xl">
                  <div className="w-8 h-8 border-4 border-slate-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-slate-800 text-lg font-semibold">Opening Camera...</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Camera View - Show when camera is active */}
      {cameraActive && !preview && !loading && !cameraLoading && (
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-slate-200/50 shadow-xl">
            <h3 className="text-center text-xl font-bold text-slate-800 mb-4 flex items-center justify-center">
              <span className="text-2xl mr-3">📷</span>
              Camera Preview
            </h3>
            <div className="flex justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-w-full h-auto max-h-80 rounded-xl shadow-lg border-2 border-slate-200"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <button
              onClick={capturePhoto}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md flex items-center justify-center gap-3"
            >
              <span className="text-xl">📸</span>
              Capture Photo
            </button>
            <button
              onClick={stopCamera}
              className="flex-1 bg-gradient-to-r from-red-500 to-pink-500 hover:from-red-600 hover:to-pink-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
            >
              <span className="text-xl">❌</span>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Capture Options - Show when no preview and camera not active and not loading */}
      {!preview && !loading && !cameraActive && !cameraLoading && (
        <div className="space-y-8">
          {/* Instructions Card */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 p-6 rounded-xl border border-amber-200/50 shadow-lg">
            <div className="flex items-center mb-4">
              <span className="text-2xl mr-3">💡</span>
              <h3 className="text-xl font-semibold text-amber-800">Quick Tips for Best Results</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center space-x-3">
                <span className="text-amber-600">☀️</span>
                <span className="text-amber-700 font-medium">Good lighting</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-amber-600">🎯</span>
                <span className="text-amber-700 font-medium">Center the leaf</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-amber-600">📏</span>
                <span className="text-amber-700 font-medium">6-12 inches away</span>
              </div>
              <div className="flex items-center space-x-3">
                <span className="text-amber-600">🤚</span>
                <span className="text-amber-700 font-medium">Hold steady</span>
              </div>
            </div>
          </div>

          {/* Method Selection */}
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-slate-200/50 shadow-xl">
            <h3 className="text-center text-2xl font-bold text-slate-800 mb-6 flex items-center justify-center">
              <span className="text-3xl mr-3">🎯</span>
              Choose Your Method
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Camera Column */}
              <div className="text-center space-y-6 p-6 bg-gradient-to-br from-emerald-50 to-green-50 rounded-xl border border-emerald-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-6xl mb-4">📷</div>
                <h4 className="text-xl font-bold text-emerald-800">Take Photo</h4>
                <p className="text-emerald-700 text-sm">Capture a fresh leaf image</p>
                <button
                  onClick={openCamera}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md flex items-center justify-center gap-3"
                >
                  <span className="text-xl">📷</span>
                  Open Camera
                </button>
              </div>

              {/* Gallery Column */}
              <div className="text-center space-y-6 p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl border border-blue-200/50 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105">
                <div className="text-6xl mb-4">🖼️</div>
                <h4 className="text-xl font-bold text-blue-800">From Gallery</h4>
                <p className="text-blue-700 text-sm">Select existing photo</p>
                <button
                  onClick={openGallery}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 hover:shadow-lg shadow-md flex items-center justify-center gap-3"
                >
                  <span className="text-xl">🖼️</span>
                  Choose Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hidden file inputs */}
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

      {/* Preview Section */}
      {preview && (
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-xl border border-slate-200/50 shadow-xl">
            <h3 className="text-center text-xl font-bold text-slate-800 mb-4 flex items-center justify-center">
              <span className="text-2xl mr-3">🖼️</span>
              Captured Image
            </h3>
            <div className="flex justify-center">
              <img
                src={preview}
                alt="Captured leaf"
                className="max-w-full h-auto max-h-80 rounded-xl shadow-lg border-2 border-slate-200"
              />
            </div>
          </div>

          {!loading && (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={openCamera}
                className="flex-1 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
              >
                <span className="text-xl">🔄</span>
                Retake Photo
              </button>
              <button
                onClick={openGallery}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
              >
                <span className="text-xl">🌿</span>
                Analyze Leaf
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl border border-slate-200/50 shadow-xl max-w-md mx-auto">
            <div className="flex flex-col items-center space-y-6">
              <div className="w-20 h-20 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
              <div className="text-center">
                <h3 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Image</h3>
                <p className="text-slate-600">AI is processing your leaf...</p>
              </div>
              {uploadProgress > 0 && (
                <div className="w-full max-w-xs">
                  <div className="bg-blue-100 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-600 to-indigo-600 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-slate-500 mt-2">{uploadProgress}% complete</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 rounded-xl border border-red-200/50 shadow-lg max-w-md mx-auto text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h3 className="text-2xl font-bold text-red-800 mb-3">Analysis Error</h3>
          <p className="text-red-700 mb-6">{error}</p>
          <button
            onClick={resetCapture}
            className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Results Display */}
      {result && !error && (
        <div className="results-container">
          {(result.deficiency_prediction || result.disease_prediction) && (
            <div className="bg-white/95 p-8 rounded-xl border border-slate-200/50 shadow-xl mb-6">
              <div className="flex items-center mb-6">
                <span className="text-4xl mr-4">🔍</span>
                <h3 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">Leaf Analysis Results</h3>
              </div>

              <div className="grid grid-cols-1 gap-6">
                {result.deficiency_prediction && (
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200/50 shadow-lg">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">🧪</span>
                      <h4 className="text-xl font-bold text-blue-800">Nutrient Deficiency</h4>
                    </div>
                    <div className="mb-4">
                      <p className="text-blue-800 font-semibold text-lg mb-2">{result.deficiency_prediction.class}</p>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-blue-600 text-sm font-medium">Confidence</span>
                        <span className="text-blue-600 text-sm font-semibold">{Math.round((result.deficiency_prediction.confidence || 0) * 100)}%</span>
                      </div>
                      <div className="w-full bg-blue-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.round((result.deficiency_prediction.confidence || 0) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    {result.deficiency_prediction.explanation && (
                      <div className="mb-3">
                        <h5 className="font-semibold text-blue-800 mb-1">Explanation:</h5>
                        <p className="text-blue-700 text-sm">{result.deficiency_prediction.explanation}</p>
                      </div>
                    )}
                    {result.deficiency_prediction.recommendation && (
                      <div>
                        <h5 className="font-semibold text-blue-800 mb-1">Recommendation:</h5>
                        <p className="text-blue-700 text-sm">{result.deficiency_prediction.recommendation}</p>
                      </div>
                    )}
                  </div>
                )}

                {result.disease_prediction && (
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 p-6 rounded-xl border border-red-200/50 shadow-lg">
                    <div className="flex items-center mb-4">
                      <span className="text-2xl mr-3">🔬</span>
                      <h4 className="text-xl font-bold text-red-800">Disease Detection</h4>
                    </div>
                    <div className="mb-4">
                      <p className="text-red-800 font-semibold text-lg mb-2">{result.disease_prediction.class}</p>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-red-600 text-sm font-medium">Confidence</span>
                        <span className="text-red-600 text-sm font-semibold">{Math.round((result.disease_prediction.confidence || 0) * 100)}%</span>
                      </div>
                      <div className="w-full bg-red-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-red-500 to-pink-500 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${Math.round((result.disease_prediction.confidence || 0) * 100)}%` }}
                        ></div>
                      </div>
                    </div>
                    {result.disease_prediction.explanation && (
                      <div className="mb-3">
                        <h5 className="font-semibold text-red-800 mb-1">Explanation:</h5>
                        <p className="text-red-700 text-sm">{result.disease_prediction.explanation}</p>
                      </div>
                    )}
                    {result.disease_prediction.recommendation && (
                      <div>
                        <h5 className="font-semibold text-red-800 mb-1">Recommendation:</h5>
                        <p className="text-red-700 text-sm">{result.disease_prediction.recommendation}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {result.recommendations && result.recommendations.disease_recommendations && (
            <div className="result-section additional bg-white/95 p-6 rounded-xl border border-purple-200/50 shadow-xl mb-6">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">💡</span>
                <h3 className="text-2xl font-bold text-purple-800">Detailed Disease Recommendations</h3>
              </div>

              {result.recommendations.disease_recommendations.overview && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Overview:</h4>
                  <p className="text-purple-700">{result.recommendations.disease_recommendations.overview}</p>
                </div>
              )}

              {result.recommendations.disease_recommendations.symptoms && result.recommendations.disease_recommendations.symptoms.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Symptoms:</h4>
                  <ul className="list-disc list-inside text-purple-700 space-y-1">
                    {result.recommendations.disease_recommendations.symptoms.map((symptom, index) => (
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              )}

              {result.recommendations.disease_recommendations.integrated_management && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Integrated Management</h4>
                  {result.recommendations.disease_recommendations.integrated_management.cultural_practices && result.recommendations.disease_recommendations.integrated_management.cultural_practices.length > 0 && (
                    <div className="mb-2">
                      <p className="font-medium text-purple-800">Cultural Practices:</p>
                      <ul className="list-disc list-inside text-purple-700 space-y-1">
                        {result.recommendations.disease_recommendations.integrated_management.cultural_practices.map((practice, index) => (
                          <li key={index}>{practice}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.recommendations.disease_recommendations.integrated_management.chemical_control && result.recommendations.disease_recommendations.integrated_management.chemical_control.length > 0 && (
                    <div className="mb-2">
                      <p className="font-medium text-purple-800">Chemical Control:</p>
                      <ul className="list-disc list-inside text-purple-700 space-y-1">
                        {result.recommendations.disease_recommendations.integrated_management.chemical_control.map((control, index) => (
                          <li key={index}>{control}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.recommendations.disease_recommendations.integrated_management.biological_control && result.recommendations.disease_recommendations.integrated_management.biological_control.length > 0 && (
                    <div className="mb-2">
                      <p className="font-medium text-purple-800">Biological Control:</p>
                      <ul className="list-disc list-inside text-purple-700 space-y-1">
                        {result.recommendations.disease_recommendations.integrated_management.biological_control.map((control, index) => (
                          <li key={index}>{control}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.recommendations.disease_recommendations.integrated_management.monitoring && result.recommendations.disease_recommendations.integrated_management.monitoring.length > 0 && (
                    <div className="mb-2">
                      <p className="font-medium text-purple-800">Monitoring:</p>
                      <ul className="list-disc list-inside text-purple-700 space-y-1">
                        {result.recommendations.disease_recommendations.integrated_management.monitoring.map((monitor, index) => (
                          <li key={index}>{monitor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {result.recommendations.disease_recommendations.severity_specific_recommendations && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Severity Specific Recommendations</h4>
                  <p className="text-purple-700"><strong>Spray Frequency:</strong> {result.recommendations.disease_recommendations.severity_specific_recommendations.spray_frequency}</p>
                  <p className="text-purple-700"><strong>Intervention Level:</strong> {result.recommendations.disease_recommendations.severity_specific_recommendations.intervention_level}</p>
                  {result.recommendations.disease_recommendations.severity_specific_recommendations.immediate_actions && result.recommendations.disease_recommendations.severity_specific_recommendations.immediate_actions.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium text-purple-800">Immediate Actions:</p>
                      <ul className="list-disc list-inside text-purple-700 space-y-1">
                        {result.recommendations.disease_recommendations.severity_specific_recommendations.immediate_actions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.recommendations.disease_recommendations.severity_specific_recommendations.long_term_strategies && result.recommendations.disease_recommendations.severity_specific_recommendations.long_term_strategies.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium text-purple-800">Long-term Strategies:</p>
                      <ul className="list-disc list-inside text-purple-700 space-y-1">
                        {result.recommendations.disease_recommendations.severity_specific_recommendations.long_term_strategies.map((strategy, index) => (
                          <li key={index}>{strategy}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {result.recommendations.disease_recommendations.monitoring_schedule && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Monitoring Schedule</h4>
                  <p className="text-purple-700"><strong>Inspection Frequency:</strong> {result.recommendations.disease_recommendations.monitoring_schedule.inspection_frequency}</p>
                  <p className="text-purple-700"><strong>Data Recording:</strong> {result.recommendations.disease_recommendations.monitoring_schedule.data_recording}</p>
                  <p className="text-purple-700"><strong>Action Thresholds:</strong> {result.recommendations.disease_recommendations.monitoring_schedule.action_thresholds}</p>
                  <p className="text-purple-700"><strong>Weather Monitoring:</strong> {result.recommendations.disease_recommendations.monitoring_schedule.weather_monitoring}</p>
                </div>
              )}

              {result.recommendations.disease_recommendations.economic_considerations && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Economic Considerations</h4>
                  <p className="text-purple-700"><strong>Management Cost (USD/ha):</strong> {result.recommendations.disease_recommendations.economic_considerations.management_cost_usd_per_ha}</p>
                  <p className="text-purple-700"><strong>Potential Yield Loss (%):</strong> {result.recommendations.disease_recommendations.economic_considerations.potential_yield_loss_percent}</p>
                  <p className="text-purple-700"><strong>Return on Investment:</strong> {result.recommendations.disease_recommendations.economic_considerations.return_on_investment}</p>
                  <p className="text-purple-700"><strong>Economic Threshold:</strong> {result.recommendations.disease_recommendations.economic_considerations.economic_threshold}</p>
                  {result.recommendations.disease_recommendations.economic_considerations.cost_effective_strategies && result.recommendations.disease_recommendations.economic_considerations.cost_effective_strategies.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium text-purple-800">Cost Effective Strategies:</p>
                      <ul className="list-disc list-inside text-purple-700 space-y-1">
                        {result.recommendations.disease_recommendations.economic_considerations.cost_effective_strategies.map((strategy, index) => (
                          <li key={index}>{strategy}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {result.recommendations.disease_recommendations.emergency_measures && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Emergency Measures</h4>
                  {result.recommendations.disease_recommendations.emergency_measures.high_infection && result.recommendations.disease_recommendations.emergency_measures.high_infection.length > 0 && (
                    <div className="mb-2">
                      <p className="font-medium text-purple-800">High Infection:</p>
                      <ul className="list-disc list-inside text-purple-700 space-y-1">
                        {result.recommendations.disease_recommendations.emergency_measures.high_infection.map((measure, index) => (
                          <li key={index}>{measure}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {result.recommendations.disease_recommendations.emergency_measures.preventive_protocol && result.recommendations.disease_recommendations.emergency_measures.preventive_protocol.length > 0 && (
                    <div className="mb-2">
                      <p className="font-medium text-purple-800">Preventive Protocol:</p>
                      <ul className="list-disc list-inside text-purple-700 space-y-1">
                        {result.recommendations.disease_recommendations.emergency_measures.preventive_protocol.map((protocol, index) => (
                          <li key={index}>{protocol}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {result.recommendations.disease_recommendations.resistant_varieties && result.recommendations.disease_recommendations.resistant_varieties.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-purple-800 mb-2">Resistant Varieties</h4>
                  <ul className="list-disc list-inside text-purple-700 space-y-1">
                    {result.recommendations.disease_recommendations.resistant_varieties.map((variety, index) => (
                      <li key={index}>
                        <strong>{variety.name}</strong> - {variety.resistance_level} resistance<br/>
                        <em>Characteristics:</em> {variety.characteristics}<br/>
                        <em>Adaptation:</em> {variety.adaptation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {result.recommendations && result.recommendations.deficiency_recommendations && (
            <div className="result-section nutrition bg-white/95 p-6 rounded-xl border border-green-200/50 shadow-xl mb-6">
              <div className="flex items-center mb-4">
                <span className="text-3xl mr-3">🌱</span>
                <h3 className="text-2xl font-bold text-green-800">Nutrition Recommendations</h3>
              </div>
              {result.recommendations.deficiency_recommendations.symptoms && result.recommendations.deficiency_recommendations.symptoms.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">Symptoms:</h4>
                  <ul className="list-disc list-inside text-green-700 space-y-1">
                    {result.recommendations.deficiency_recommendations.symptoms.map((symptom, index) => (
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.recommendations.deficiency_recommendations.basic && result.recommendations.deficiency_recommendations.basic.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">Basic Recommendations:</h4>
                  <ul className="list-disc list-inside text-green-700 space-y-1">
                    {result.recommendations.deficiency_recommendations.basic.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              {result.recommendations.deficiency_recommendations.management && result.recommendations.deficiency_recommendations.management.length > 0 && (
                <div className="mb-4">
                  <h4 className="font-semibold text-green-800 mb-2">Management:</h4>
                  <ul className="list-disc list-inside text-green-700 space-y-1">
                    {result.recommendations.deficiency_recommendations.management.map((manage, index) => (
                      <li key={index}>{manage}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}



          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={resetCapture}
              className="bg-gradient-to-r from-emerald-600 via-teal-600 to-green-600 hover:from-emerald-700 hover:via-teal-700 hover:to-green-700 text-white font-bold py-4 px-8 rounded-xl shadow-xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl text-sm flex items-center justify-center gap-3 mx-auto"
            >
              <span className="text-xl">🔄</span>
              Analyze Another Leaf
              <span className="text-xl">🌿</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


export default CameraCapture;
