import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';

const BACKEND_URL =  'https://healthycoffee.onrender.com';
const LOCAL_FALLBACK = 'http://127.0.0.1:8000';

const CameraCapture = () => {
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [activeBackend, setActiveBackend] = useState(null);
  const [backendChecking, setBackendChecking] = useState(false);
  const [backendError, setBackendError] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const [stream, setStream] = useState(null);

  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [stream, preview]);

  // Start device camera
  const startCamera = async () => {
    setError(null);
    setCameraLoading(true);
    try {
      // Stop any existing stream
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }

      // Request camera access
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      if (!mediaStream.active) {
        throw new Error('Camera stream not active');
      }

      setStream(mediaStream);
      
      // Wait for video element to be ready
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(resolve)
              .catch(err => {
                console.error('Play error:', err);
                resolve();
              });
          };
          
          setTimeout(resolve, 500);
        });
        
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      
      // Fallback to file input if camera fails
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera found. Using file upload instead.');
        setTimeout(() => {
          cameraInputRef.current?.click();
        }, 1000);
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied. Using file upload instead.');
        setTimeout(() => {
          cameraInputRef.current?.click();
        }, 1000);
      } else {
        setError('Camera unavailable. Using file upload instead.');
        setTimeout(() => {
          cameraInputRef.current?.click();
        }, 1000);
      }
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => {
        t.stop();
        t.enabled = false;
      });
      setStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
      videoRef.current.pause();
    }
    setCameraActive(false);
  };

  // Capture photo from camera
  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) {
      setError('Camera not ready');
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    
    ctx.save();
    ctx.scale(-1, 1);
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
    
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError('Failed to capture image');
        return;
      }
      
      const file = new File([blob], `leaf-capture-${Date.now()}.jpg`, { 
        type: 'image/jpeg',
        lastModified: Date.now()
      });
      
      const url = URL.createObjectURL(blob);
      setPreview(url);
      
      await uploadAndAnalyzeImage(file);
      
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  // Open file picker for camera
  const openCameraFile = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.setAttribute('capture', 'environment');
      cameraInputRef.current.click();
    }
  };

  // Open gallery file picker
  const openGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.removeAttribute('capture');
      galleryInputRef.current.click();
    }
  };

  // Handle file selection
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
    await uploadAndAnalyzeImage(file);
  };

  // Upload and analyze image with backend
  const uploadAndAnalyzeImage = async (file) => {
    setError(null);
    setLoading(true);
    setResult(null);

    // small helper to POST to backend with timeout
    const postTo = async (baseUrl, timeoutMs = 15000) => {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const fd = new FormData();
        fd.append('image', file);
        const resp = await fetch(`${baseUrl}/api/upload-image`, {
          method: 'POST',
          body: fd,
          signal: controller.signal,
        });
        clearTimeout(id);
        if (!resp.ok) throw new Error(`Server responded with status: ${resp.status}`);
        const json = await resp.json();
        if (json.error) throw new Error(json.error);
        return json;
      } finally {
        clearTimeout(id);
      }
    };

    try {
      // ensure we have a working backend before uploading
      let backendToUse = activeBackend;
      if (!backendToUse) {
        backendToUse = await ensureBackend();
      }

      if (!backendToUse) {
        setError('No backend available. Please retry or use demo results.');
        setLoading(false);
        return;
      }

      const data = await postTo(backendToUse);
      setResult(data);
    } catch (err) {
      console.error('Upload/analysis error:', err);
      setError(err.message || 'Failed to analyze image');
    } finally {
      setLoading(false);
    }
  };

  // Health-check helpers
  const checkBackend = async (baseUrl, timeoutMs = 4000) => {
    try {
      const controller = new AbortController();
      const id = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const resp = await fetch(`${baseUrl}/health`, { method: 'GET', signal: controller.signal });
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
      // Try primary
      if (await checkBackend(BACKEND_URL)) {
        setActiveBackend(BACKEND_URL);
        return BACKEND_URL;
      }

      // Try local fallback
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
      // try re-uploading last file
      await uploadAndAnalyzeImage(lastFile);
    }
  };

  const useDemoResults = async (file) => {
    setError(null);
    setLoading(true);
    // generate mock result (same as previous demo result)
    const mockResult = {
      deficiency_prediction: {
        class: 'Nitrogen Deficient',
        confidence: Math.floor(Math.random() * 30) + 70,
        explanation: 'Leaf shows signs of nitrogen deficiency with yellowing of older leaves.',
        recommendation: 'Apply nitrogen-rich fertilizer and ensure proper watering.'
      },
      disease_prediction: {
        class: 'Leaf Rust',
        confidence: Math.floor(Math.random() * 30) + 70,
        explanation: 'Small orange-brown pustules detected on leaf surface.',
        recommendation: 'Apply fungicide and remove affected leaves.'
      },
      recommendations: {
        disease_recommendations: {
          overview: 'Leaf rust is a fungal disease that affects plant health and productivity.',
          symptoms: [
            'Small orange-brown pustules on leaves',
            'Yellowing around infection sites',
            'Premature leaf drop'
          ],
          integrated_management: {
            cultural_practices: [
              'Remove and destroy infected leaves',
              'Improve air circulation',
              'Avoid overhead watering'
            ],
            chemical_control: [
              'Apply copper-based fungicide',
              'Use systemic fungicides if severe',
              'Follow recommended spray intervals'
            ],
            biological_control: [
              'Use beneficial microorganisms',
              'Apply neem oil extract',
              'Introduce competitive fungi'
            ],
            monitoring: [
              'Check plants weekly',
              'Monitor weather conditions',
              'Keep records of outbreaks'
            ]
          },
          severity_specific_recommendations: {
            spray_frequency: 'Every 7-10 days',
            intervention_level: 'Moderate',
            immediate_actions: [
              'Remove severely infected leaves',
              'Apply preventive fungicide',
              'Isolate affected plants'
            ],
            long_term_strategies: [
              'Plant resistant varieties',
              'Improve soil health',
              'Implement crop rotation'
            ]
          },
          economic_considerations: {
            management_cost_usd_per_ha: 150,
            potential_yield_loss_percent: 25,
            return_on_investment: 3.5,
            economic_threshold: '5% leaf area affected'
          }
        },
        deficiency_recommendations: {
          symptoms: [
            'Yellowing of older leaves',
            'Stunted growth',
            'Reduced leaf size'
          ],
          basic: [
            'Apply balanced fertilizer',
            'Maintain soil pH 6.0-7.0',
            'Ensure adequate moisture'
          ],
          management: [
            'Conduct soil testing',
            'Use slow-release fertilizers',
            'Implement proper irrigation'
          ]
        }
      },
      timestamp: new Date().toISOString(),
      image_name: file?.name || 'demo.jpg'
    };

    setResult(mockResult);
    setLoading(false);
  };

  // Generate and download PDF report
  const generatePDF = async () => {
    if (!result || pdfGenerating) return;
    
    setPdfGenerating(true);
    
    try {
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Add title
      pdf.setFontSize(20);
      pdf.setTextColor(0, 150, 136);
      pdf.text('Leaf Analysis Report', 105, 20, null, null, 'center');
      
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, null, null, 'center');
      
      pdf.setDrawColor(0, 150, 136);
      pdf.setLineWidth(0.5);
      pdf.line(20, 32, 190, 32);
      
      let yPosition = 40;
      
      // Add deficiency prediction
      if (result.deficiency_prediction) {
        pdf.setFontSize(16);
        pdf.setTextColor(0);
        pdf.text('Nutrient Deficiency Analysis', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        pdf.setTextColor(50);
        pdf.text(`Deficiency: ${result.deficiency_prediction.class}`, 20, yPosition);
        yPosition += 7;
        pdf.text(`Confidence: ${result.deficiency_prediction.confidence || 'N/A'}%`, 20, yPosition);
        yPosition += 7;
        
        if (result.deficiency_prediction.explanation) {
          const explanationLines = pdf.splitTextToSize(result.deficiency_prediction.explanation, 170);
          pdf.text('Explanation:', 20, yPosition);
          yPosition += 7;
          pdf.text(explanationLines, 25, yPosition);
          yPosition += explanationLines.length * 7;
        }
        
        if (result.deficiency_prediction.recommendation) {
          const recLines = pdf.splitTextToSize(result.deficiency_prediction.recommendation, 170);
          pdf.text('Recommendation:', 20, yPosition);
          yPosition += 7;
          pdf.text(recLines, 25, yPosition);
          yPosition += recLines.length * 7;
        }
        
        yPosition += 10;
      }
      
      // Add disease prediction
      if (result.disease_prediction) {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(16);
        pdf.setTextColor(0);
        pdf.text('Disease Detection', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        pdf.setTextColor(50);
        pdf.text(`Disease: ${result.disease_prediction.class}`, 20, yPosition);
        yPosition += 7;
        pdf.text(`Confidence: ${result.disease_prediction.confidence || 'N/A'}%`, 20, yPosition);
        yPosition += 7;
        
        if (result.disease_prediction.explanation) {
          const explanationLines = pdf.splitTextToSize(result.disease_prediction.explanation, 170);
          pdf.text('Explanation:', 20, yPosition);
          yPosition += 7;
          pdf.text(explanationLines, 25, yPosition);
          yPosition += explanationLines.length * 7;
        }
        
        if (result.disease_prediction.recommendation) {
          const recLines = pdf.splitTextToSize(result.disease_prediction.recommendation, 170);
          pdf.text('Recommendation:', 20, yPosition);
          yPosition += 7;
          pdf.text(recLines, 25, yPosition);
          yPosition += recLines.length * 7;
        }
        
        yPosition += 10;
      }
      
      // Add detailed recommendations
      if (result.recommendations) {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(16);
        pdf.setTextColor(0);
        pdf.text('Detailed Recommendations', 20, yPosition);
        yPosition += 10;
        
        // Disease recommendations
        if (result.recommendations.disease_recommendations) {
          pdf.setFontSize(14);
          pdf.setTextColor(0, 100, 0);
          pdf.text('Disease Management:', 20, yPosition);
          yPosition += 7;
          
          if (result.recommendations.disease_recommendations.overview) {
            pdf.setFontSize(10);
            pdf.setTextColor(50);
            const overviewLines = pdf.splitTextToSize(result.recommendations.disease_recommendations.overview, 170);
            pdf.text(overviewLines, 25, yPosition);
            yPosition += overviewLines.length * 5;
          }
          
          yPosition += 5;
        }
        
        // Deficiency recommendations
        if (result.recommendations.deficiency_recommendations) {
          if (yPosition > 250) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFontSize(14);
          pdf.setTextColor(0, 0, 150);
          pdf.text('Nutrition Management:', 20, yPosition);
          yPosition += 7;
          
          if (result.recommendations.deficiency_recommendations.basic) {
            pdf.setFontSize(10);
            pdf.setTextColor(50);
            result.recommendations.deficiency_recommendations.basic.forEach((rec, idx) => {
              if (yPosition > 270) {
                pdf.addPage();
                yPosition = 20;
              }
              pdf.text(`${idx + 1}. ${rec}`, 25, yPosition);
              yPosition += 6;
            });
          }
        }
      }
      
      // Add footer
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text('Leaf Analysis AI System - Generated Report', 105, 285, null, null, 'center');
      
      pdf.save(`leaf-analysis-${Date.now()}.pdf`);
      
    } catch (err) {
      console.error('PDF generation error:', err);
      setError('Failed to generate PDF');
    } finally {
      setPdfGenerating(false);
    }
  };

  // Export as JSON
  const exportAsJSON = () => {
    if (!result) return;
    
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `leaf-analysis-${Date.now()}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Reset everything
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
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg hover:scale-105 transition-transform">
            <span className="text-4xl text-white">🌿</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Leaf Analysis</h1>
          <p className="text-slate-600">Capture or upload leaf image for analysis</p>
        </div>

        {/* Camera Preview */}
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

        {/* Image Preview */}
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

        {/* Camera Loading */}
        {cameraLoading && (
          <div className="text-center py-12">
            <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">Accessing camera...</p>
          </div>
        )}

        {/* Processing */}
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

        {/* Error Display */}
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
                      onClick={() => useDemoResults(lastFile)}
                      className="px-3 py-2 bg-white border border-rose-300 text-rose-700 rounded-lg font-medium hover:bg-rose-50 transition-colors"
                    >
                      Use Demo Results
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

        {/* Capture Options */}
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

        {/* Results Display */}
        {result && !loading && (
          <div className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="text-emerald-500">📊</span>
              Analysis Results
            </h2>
            
            <div className="space-y-8">
              {/* Deficiency Results */}
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
                          style={{ width: `${result.deficiency_prediction.confidence || 0}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-slate-700">
                        {result.deficiency_prediction.confidence || 'N/A'}% confidence
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

              {/* Disease Results */}
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
                          style={{ width: `${result.disease_prediction.confidence || 0}%` }}
                        ></div>
                      </div>
                      <span className="font-semibold text-slate-700">
                        {result.disease_prediction.confidence || 'N/A'}% confidence
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

              {/* Detailed Recommendations */}
              {result.recommendations && (
                <div className="space-y-6">
                  {/* Disease Recommendations */}
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

                  {/* Deficiency Recommendations */}
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
              
              {/* Export Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-200">
                <button
                  onClick={generatePDF}
                  disabled={pdfGenerating}
                  className="flex-1 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {pdfGenerating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <span>📄</span>
                      Download PDF Report
                    </>
                  )}
                </button>
                
                <button
                  onClick={exportAsJSON}
                  className="flex-1 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2"
                >
                  <span>📊</span>
                  Export as JSON
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Hidden inputs */}
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
        
        {/* New Analysis Button */}
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
};

export default CameraCapture;