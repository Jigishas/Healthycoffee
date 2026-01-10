import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const CameraCapture = () => {
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const cameraInputRef = useRef(null);
  const galleryInputRef = useRef(null);
  const resultRef = useRef(null);
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
        
        // Wait for video to load
        await new Promise((resolve) => {
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play()
              .then(resolve)
              .catch(err => {
                console.error('Play error:', err);
                resolve(); // Continue even if play fails
              });
          };
          
          // Fallback in case onloadedmetadata doesn't fire
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
    
    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    
    // Draw video frame to canvas (no mirroring)
    ctx.save();
    ctx.scale(-1, 1); // Flip horizontally for natural view
    ctx.drawImage(video, -canvas.width, 0, canvas.width, canvas.height);
    ctx.restore();
    
    // Convert to blob and process
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
      
      // Process the image
      await processImage(file);
      
      // Stop camera after capture
      stopCamera();
    }, 'image/jpeg', 0.95);
  };

  // Open file picker for camera
  const openCameraFile = () => {
    if (cameraInputRef.current) {
      // Set capture attribute for mobile cameras
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
    
    // Reset file input
    e.target.value = '';
    
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large (max 10MB)');
      return;
    }
    
    const url = URL.createObjectURL(file);
    setPreview(url);
    await processImage(file);
  };

  // Process image (upload and analyze)
  const processImage = async (file) => {
    setError(null);
    setLoading(true);
    
    try {
      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock analysis result
      const mockResult = {
        disease: Math.random() > 0.7 ? 'Healthy' : 'Fungal Infection',
        confidence: Math.floor(Math.random() * 30) + 70,
        recommendations: [
          'Apply fungicide if symptoms persist',
          'Ensure proper drainage',
          'Maintain adequate spacing between plants',
          'Remove affected leaves'
        ],
        nutrients: {
          nitrogen: Math.floor(Math.random() * 100),
          phosphorus: Math.floor(Math.random() * 100),
          potassium: Math.floor(Math.random() * 100)
        },
        timestamp: new Date().toISOString(),
        imageName: file.name
      };
      
      setAnalysisResult(mockResult);
      setResult(mockResult);
      
    } catch (err) {
      console.error('Processing error:', err);
      setError('Failed to analyze image');
    } finally {
      setLoading(false);
    }
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
      pdf.setTextColor(0, 150, 136); // Teal color
      pdf.text('Leaf Analysis Report', 105, 20, null, null, 'center');
      
      // Add date
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, null, null, 'center');
      
      // Add horizontal line
      pdf.setDrawColor(0, 150, 136);
      pdf.setLineWidth(0.5);
      pdf.line(20, 32, 190, 32);
      
      // Add image if available
      if (preview) {
        try {
          // Convert image to data URL
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.src = preview;
          
          await new Promise((resolve, reject) => {
            img.onload = () => {
              const canvas = document.createElement('canvas');
              const ctx = canvas.getContext('2d');
              
              // Calculate dimensions for PDF (max width 170mm, maintain aspect ratio)
              const maxWidth = 170;
              const scaleFactor = maxWidth / img.width;
              canvas.width = maxWidth;
              canvas.height = img.height * scaleFactor;
              
              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
              
              const imgData = canvas.toDataURL('image/jpeg', 0.8);
              pdf.addImage(imgData, 'JPEG', 20, 40, 170, canvas.height);
              resolve();
            };
            img.onerror = reject;
          });
        } catch (imgErr) {
          console.warn('Could not add image to PDF:', imgErr);
        }
      }
      
      let yPosition = preview ? 40 + (pdf.internal.pageSize.height / 3) : 40;
      
      // Add analysis results
      pdf.setFontSize(16);
      pdf.setTextColor(0);
      pdf.text('Analysis Results', 20, yPosition);
      yPosition += 10;
      
      pdf.setFontSize(12);
      pdf.setTextColor(50);
      pdf.text(`Status: ${result.disease}`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Confidence: ${result.confidence}%`, 20, yPosition);
      yPosition += 10;
      
      // Add nutrient levels
      pdf.setFontSize(14);
      pdf.setTextColor(0);
      pdf.text('Nutrient Levels', 20, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(12);
      pdf.setTextColor(50);
      pdf.text(`Nitrogen: ${result.nutrients.nitrogen}%`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Phosphorus: ${result.nutrients.phosphorus}%`, 20, yPosition);
      yPosition += 7;
      pdf.text(`Potassium: ${result.nutrients.potassium}%`, 20, yPosition);
      yPosition += 10;
      
      // Add recommendations
      pdf.setFontSize(14);
      pdf.setTextColor(0);
      pdf.text('Recommendations', 20, yPosition);
      yPosition += 7;
      
      pdf.setFontSize(10);
      result.recommendations.forEach((rec, index) => {
        if (yPosition > 270) { // Check if we need new page
          pdf.addPage();
          yPosition = 20;
        }
        pdf.text(`${index + 1}. ${rec}`, 25, yPosition);
        yPosition += 6;
      });
      
      // Add footer
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text('Leaf Analysis AI System - Generated Report', 105, 285, null, null, 'center');
      
      // Save PDF
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
    setAnalysisResult(null);
    setResult(null);
    stopCamera();
    
    // Clear file inputs
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
            <p className="text-slate-600">Processing leaf details...</p>
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
              <button
                onClick={resetCapture}
                className="px-4 py-2 bg-white border border-rose-300 text-rose-700 rounded-lg font-medium hover:bg-rose-50 transition-colors"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {/* Capture Options */}
        {!preview && !loading && !cameraActive && !cameraLoading && (
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
          <div ref={resultRef} className="bg-white rounded-2xl shadow-xl p-6 mb-6">
            <h2 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="text-emerald-500">📊</span>
              Analysis Results
            </h2>
            
            <div className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-5 border border-emerald-100">
                  <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                    <span className="text-emerald-500">🌱</span>
                    Leaf Status
                  </h3>
                  <div className="text-3xl font-bold text-slate-800 mb-2">{result.disease}</div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 bg-slate-200 rounded-full h-2">
                      <div 
                        className="bg-gradient-to-r from-emerald-500 to-teal-600 h-2 rounded-full"
                        style={{ width: `${result.confidence}%` }}
                      ></div>
                    </div>
                    <span className="font-semibold text-slate-700">{result.confidence}%</span>
                  </div>
                </div>
                
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-5 border border-blue-100">
                  <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                    <span className="text-blue-500">🧪</span>
                    Nutrient Levels
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm text-slate-600 mb-1">
                        <span>Nitrogen</span>
                        <span>{result.nutrients.nitrogen}%</span>
                      </div>
                      <div className="bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full"
                          style={{ width: `${result.nutrients.nitrogen}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-slate-600 mb-1">
                        <span>Phosphorus</span>
                        <span>{result.nutrients.phosphorus}%</span>
                      </div>
                      <div className="bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-purple-500 to-pink-600 h-2 rounded-full"
                          style={{ width: `${result.nutrients.phosphorus}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-sm text-slate-600 mb-1">
                        <span>Potassium</span>
                        <span>{result.nutrients.potassium}%</span>
                      </div>
                      <div className="bg-slate-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-orange-600 h-2 rounded-full"
                          style={{ width: `${result.nutrients.potassium}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-5 border border-amber-100">
                <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                  <span className="text-amber-500">💡</span>
                  Recommendations
                </h3>
                <ul className="space-y-3">
                  {result.recommendations.map((rec, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="text-amber-500 mt-1">•</span>
                      <span className="text-slate-700">{rec}</span>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-slate-200">
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