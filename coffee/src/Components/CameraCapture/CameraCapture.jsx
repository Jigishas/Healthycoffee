import React, { useState, useRef, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';

const BACKEND_URL = 'https://healthycoffee.onrender.com';

// eslint-disable-next-line no-unused-vars
const CameraCapture = React.forwardRef((props, ref) => {
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [isHttps, setIsHttps] = useState(false);
  const [imageZoomed, setImageZoomed] = useState(false);

  // Export functions
  const exportAsJSON = () => {
    if (!result) return;
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'leaf-analysis-results.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportAsPDF = async () => {
    if (!result) return;
    alert('PDF export feature coming soon! Use JSON export for now.');
  };

  // Zoom functionality
  const toggleZoom = () => {
    setImageZoomed(!imageZoomed);
  };

  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const componentRef = useRef(null);

  // Check if running on HTTPS
  useEffect(() => {
    setIsHttps(window.location.protocol === 'https:');
  }, []);

  // Upload to backend with progress
  const uploadToBackend = async (file) => {
    setLoading(true);
    setError(null);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      formData.append('image', file);

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

    if (!isHttps && window.location.hostname !== 'localhost') {
      setCameraLoading(false);
      setError('Camera access requires HTTPS. Please ensure you are using a secure connection (https://) or localhost.');
      return;
    }

    try {
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
            setError('Failed to start camera preview. Please check camera permissions.');
          });
        };
      } else {
        setCameraLoading(false);
        setError('Video element not available');
      }
    } catch (err) {
      console.error('Error with environment camera:', err);
      try {
        const constraints = { video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } } };
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        setStream(stream);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play().then(() => {
              setCameraActive(true);
              setCameraLoading(false);
            });
          };
        }
      } catch (err2) {
        console.error('Error with user camera:', err2);
        setCameraLoading(false);
        setError('Camera access denied or not available. Please check permissions and try again.');
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
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
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  // Modern Card Component
  const Card = ({ children, className = '' }) => (
    <div className={`bg-white/80 backdrop-blur-xl rounded-2xl border border-white/50 shadow-2xl shadow-blue-500/10 ${className}`}>
      {children}
    </div>
  );

  // Status Badge Component
  const StatusBadge = ({ status, confidence }) => {
    const getStatusColor = (status) => {
      const lowerStatus = status.toLowerCase();
      if (lowerStatus.includes('healthy') || lowerStatus.includes('normal')) 
        return 'from-emerald-500 to-green-600';
      if (lowerStatus.includes('mild') || lowerStatus.includes('moderate')) 
        return 'from-amber-500 to-orange-600';
      return 'from-rose-500 to-red-600';
    };

    return (
      <div className="flex items-center gap-3">
        <div className={`bg-gradient-to-r ${getStatusColor(status)} text-white px-4 py-2 rounded-full font-semibold text-sm shadow-lg`}>
          {status}
        </div>
        {confidence && (
          <div className="text-slate-600 text-sm font-medium">
            {Math.round(confidence * 100)}% confidence
          </div>
        )}
      </div>
    );
  };

  // Progress Bar Component
  const ProgressBar = ({ value, color = 'from-blue-500 to-indigo-600' }) => (
    <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
      <div 
        className={`h-full bg-gradient-to-r ${color} rounded-full transition-all duration-500 ease-out`}
        style={{ width: `${value}%` }}
      />
    </div>
  );

  return (
    <div ref={componentRef} className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Header */}
      <Card className="p-8 mb-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-4">
          <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
            <span className="text-2xl text-white">🌿</span>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
            Leaf Analysis Studio
          </h1>
        </div>
        <p className="text-slate-600 text-lg max-w-2xl mx-auto">
          Advanced AI-powered analysis for plant health assessment and disease detection
        </p>
      </Card>

      {/* Camera Loading State */}
      {cameraLoading && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">Initializing Camera</h3>
              <p className="text-slate-600">Setting up camera preview...</p>
            </div>
          </div>
        </Card>
      )}

      {/* Camera View */}
      {cameraActive && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">Camera Preview</h3>
            <div className="flex justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-w-full h-auto max-h-96 rounded-xl shadow-lg"
              />
            </div>
          </Card>
          <div className="flex gap-4 justify-center">
            <button
              onClick={capturePhoto}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3"
            >
              <span className="text-xl">📸</span>
              Capture Photo
            </button>
            <button
              onClick={stopCamera}
              className="bg-gradient-to-r from-slate-600 to-slate-700 hover:from-slate-700 hover:to-slate-800 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center gap-3"
            >
              <span className="text-xl">❌</span>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Capture Options */}
      {!preview && !loading && !cameraActive && !cameraLoading && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Instructions */}
          <Card className="p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl flex items-center justify-center">
                <span className="text-white text-lg">💡</span>
              </div>
              <h3 className="text-xl font-semibold text-slate-800">Capture Guidelines</h3>
            </div>
            <div className="space-y-3">
              {[
                { icon: '☀️', text: 'Good natural lighting' },
                { icon: '🎯', text: 'Center the leaf in frame' },
                { icon: '📏', text: '6-12 inches distance' },
                { icon: '🤚', text: 'Keep camera steady' },
                { icon: '🌿', text: 'Clear background preferred' },
                { icon: '📱', text: 'High resolution image' }
              ].map((item, index) => (
                <div key={index} className="flex items-center gap-3 text-slate-700">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.text}</span>
                </div>
              ))}
            </div>
          </Card>

          {/* Method Selection */}
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-6 text-center">Select Method</h3>
            <div className="space-y-4">
              <button
                onClick={openCamera}
                className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
              >
                <span className="text-2xl">📷</span>
                <div className="text-left">
                  <div className="font-semibold">Take Photo</div>
                  <div className="text-sm opacity-90">Use camera</div>
                </div>
              </button>
              
              <button
                onClick={openGallery}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🖼️</span>
                <div className="text-left">
                  <div className="font-semibold">From Gallery</div>
                  <div className="text-sm opacity-90">Select existing photo</div>
                </div>
              </button>
            </div>
          </Card>
        </div>
      )}

      {/* Hidden file inputs */}
      <input type="file" accept="image/*" capture="environment" style={{ display: 'none' }} ref={cameraInputRef} onChange={handleFileSelect} />
      <input type="file" accept="image/*" style={{ display: 'none' }} ref={galleryInputRef} onChange={handleFileSelect} />

      {/* Preview Section */}
      {preview && (
        <Card className="p-6 mb-6">
          <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">Captured Image</h3>
          <div className="flex justify-center">
            <img
              src={preview}
              alt="Captured leaf"
              className={`max-w-full h-auto max-h-80 rounded-xl shadow-lg cursor-pointer transition-all duration-300 ${
                imageZoomed ? 'scale-150' : 'hover:scale-105'
              }`}
              onClick={toggleZoom}
            />
          </div>
          {!loading && (
            <div className="flex gap-4 justify-center mt-6">
              <button onClick={openCamera} className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
                Retake Photo
              </button>
            </div>
          )}
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-200 rounded-full"></div>
              <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">Analyzing Image</h3>
              <p className="text-slate-600 mb-4">AI is processing your leaf sample...</p>
              {uploadProgress > 0 && (
                <div className="w-64 mx-auto">
                  <ProgressBar value={uploadProgress} />
                  <p className="text-sm text-slate-500 mt-2">{uploadProgress}% complete</p>
                </div>
              )}
            </div>
          </div>
        </Card>
      )}

      {/* Error State */}
      {error && (
        <Card className="p-8 text-center max-w-md mx-auto">
          <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl text-white">⚠️</span>
          </div>
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Analysis Error</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <button onClick={resetCapture} className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
            Try Again
          </button>
        </Card>
      )}

      {/* Results Display */}
      {result && !error && (
        <div className="space-y-6">
          {/* Overview Card */}
          <Card className="p-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Analysis Results</h2>
                <p className="text-slate-600">Comprehensive health assessment of your leaf sample</p>
              </div>
              <div className="flex gap-2">
                <button onClick={exportAsJSON} className="bg-slate-700 hover:bg-slate-800 text-white px-4 py-2 rounded-lg transition-colors">
                  Export JSON
                </button>
                <button onClick={exportAsPDF} className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg transition-colors">
                  Export PDF
                </button>
              </div>
            </div>

            {/* Results Overview */}
            <div className="grid md:grid-cols-2 gap-6 mb-8">
              {result.deficiency_prediction && (
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🧪</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">Nutrient Analysis</h4>
                      <p className="text-sm text-slate-600">Deficiency Detection</p>
                    </div>
                  </div>
                  <StatusBadge status={result.deficiency_prediction.class} confidence={result.deficiency_prediction.confidence} />
                  {result.deficiency_prediction.explanation && (
                    <p className="text-slate-700 mt-3 text-sm">{result.deficiency_prediction.explanation}</p>
                  )}
                </div>
              )}

              {result.disease_prediction && (
                <div className="bg-gradient-to-br from-rose-50 to-pink-50 p-6 rounded-xl border border-rose-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg">🔬</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-slate-800">Disease Detection</h4>
                      <p className="text-sm text-slate-600">Pathogen Analysis</p>
                    </div>
                  </div>
                  <StatusBadge status={result.disease_prediction.class} confidence={result.disease_prediction.confidence} />
                  {result.disease_prediction.explanation && (
                    <p className="text-slate-700 mt-3 text-sm">{result.disease_prediction.explanation}</p>
                  )}
                </div>
              )}
            </div>

            {/* Detailed Recommendations */}
            {(result.recommendations?.disease_recommendations || result.recommendations?.deficiency_recommendations) && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-slate-800 mb-4">Detailed Recommendations</h3>
                
                {/* Disease Recommendations */}
                {result.recommendations.disease_recommendations && (
                  <div className="bg-gradient-to-br from-purple-50 to-violet-50 p-6 rounded-xl border border-purple-200">
                    <h4 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-3">
                      <span className="text-2xl">🛡️</span>
                      Disease Management Plan
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {/* Symptoms */}
                      {result.recommendations.disease_recommendations.symptoms && (
                        <div>
                          <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <span className="text-purple-600">📋</span>
                            Symptoms
                          </h5>
                          <ul className="space-y-2">
                            {result.recommendations.disease_recommendations.symptoms.map((symptom, index) => (
                              <li key={index} className="flex items-start gap-2 text-slate-700">
                                <span className="text-purple-500 mt-1">•</span>
                                {symptom}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Management Strategies */}
                      {result.recommendations.disease_recommendations.integrated_management && (
                        <div>
                          <h5 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                            <span className="text-purple-600">⚡</span>
                            Management Strategies
                          </h5>
                          <div className="space-y-3">
                            {result.recommendations.disease_recommendations.integrated_management.cultural_practices && (
                              <div>
                                <h6 className="font-medium text-slate-700 mb-1">Cultural Practices</h6>
                                <ul className="text-sm text-slate-600 space-y-1">
                                  {result.recommendations.disease_recommendations.integrated_management.cultural_practices.slice(0, 3).map((practice, index) => (
                                    <li key={index}>• {practice}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Economic Considerations */}
                    {result.recommendations.disease_recommendations.economic_considerations && (
                      <div className="mt-6 p-4 bg-white rounded-lg border">
                        <h5 className="font-semibold text-slate-800 mb-3">Economic Impact</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                          <div className="text-center">
                            <div className="font-semibold text-slate-800">
                              ${result.recommendations.disease_recommendations.economic_considerations.management_cost_usd_per_ha}
                            </div>
                            <div className="text-slate-600">Cost/ha</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-slate-800">
                              {result.recommendations.disease_recommendations.economic_considerations.potential_yield_loss_percent}
                            </div>
                            <div className="text-slate-600">Yield Loss</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-slate-800">
                              {result.recommendations.disease_recommendations.economic_considerations.return_on_investment}
                            </div>
                            <div className="text-slate-600">ROI</div>
                          </div>
                          <div className="text-center">
                            <div className="font-semibold text-slate-800">
                              {result.recommendations.disease_recommendations.severity_specific_recommendations?.intervention_level || 'Moderate'}
                            </div>
                            <div className="text-slate-600">Priority</div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Deficiency Recommendations */}
                {result.recommendations.deficiency_recommendations && (
                  <div className="bg-gradient-to-br from-emerald-50 to-green-50 p-6 rounded-xl border border-emerald-200">
                    <h4 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-3">
                      <span className="text-2xl">🌱</span>
                      Nutrition Management
                    </h4>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                      {result.recommendations.deficiency_recommendations.basic && (
                        <div>
                          <h5 className="font-semibold text-slate-800 mb-3">Basic Recommendations</h5>
                          <ul className="space-y-2">
                            {result.recommendations.deficiency_recommendations.basic.map((rec, index) => (
                              <li key={index} className="flex items-start gap-2 text-slate-700">
                                <span className="text-emerald-500 mt-1">•</span>
                                {rec}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      
                      {result.recommendations.deficiency_recommendations.management && (
                        <div>
                          <h5 className="font-semibold text-slate-800 mb-3">Advanced Management</h5>
                          <ul className="space-y-2">
                            {result.recommendations.deficiency_recommendations.management.map((manage, index) => (
                              <li key={index} className="flex items-start gap-2 text-slate-700">
                                <span className="text-emerald-500 mt-1">•</span>
                                {manage}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}
          </Card>

          {/* Action Button */}
          <div className="text-center">
            <button
              onClick={resetCapture}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-4 px-8 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105 inline-flex items-center gap-3"
            >
              <span className="text-xl">🔄</span>
              Analyze Another Leaf
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

CameraCapture.displayName = 'CameraCapture';

export default CameraCapture;