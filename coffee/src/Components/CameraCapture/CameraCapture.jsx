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

  // Handle camera capture - SIMPLIFIED VERSION
  const openCamera = async () => {
    setCameraLoading(true);
    setError(null);
    setCameraActive(false);

    // Check if HTTPS is required for camera access
    if (!isHttps && window.location.hostname !== 'localhost') {
      setCameraLoading(false);
      setError('Camera access requires HTTPS. Please ensure you are using a secure connection (https://) or localhost.');
      return;
    }

    try {
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      // Try to get camera access with simplified constraints
      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment' // Prefer rear camera
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        // Remove the onloadedmetadata wait and just play immediately
        videoRef.current.play()
          .then(() => {
            setCameraActive(true);
            setCameraLoading(false);
          })
          .catch(err => {
            console.error('Error playing video:', err);
            setCameraLoading(false);
            setError('Failed to start camera preview. Please try again.');
          });
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraLoading(false);
      
      if (err.name === 'NotAllowedError') {
        setError('Camera access was denied. Please allow camera permissions and try again.');
      } else if (err.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (err.name === 'NotSupportedError') {
        setError('Camera not supported in this browser.');
      } else {
        setError('Failed to access camera. Please try again or use gallery upload.');
      }
      
      // Fallback to file input
      if (cameraInputRef.current) {
        cameraInputRef.current.click();
      }
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
      });
      setStream(null);
    }
    setCameraActive(false);
    setCameraLoading(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      // Set canvas dimensions to match video
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      // Convert to blob and create file
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
          const imageUrl = URL.createObjectURL(file);
          setPreview(imageUrl);
          uploadToBackend(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.9); // 90% quality
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
    // Stop camera if active
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    setPreview('');
    setResult(null);
    setError(null);
    setUploadProgress(0);
    setCameraActive(false);
    setCameraLoading(false);
    
    if (cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
    if (galleryInputRef.current) {
      galleryInputRef.current.value = '';
    }
  };

  // Clean up stream on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

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

      {/* Camera Loading State - SIMPLIFIED */}
      {cameraLoading && (
        <Card className="p-8 text-center">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <div>
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">Opening Camera</h3>
              <p className="text-slate-600">Requesting camera access...</p>
            </div>
          </div>
        </Card>
      )}

      {/* Real Camera View - Shows immediately when camera is active */}
      {cameraActive && (
        <div className="space-y-6">
          <Card className="p-6">
            <h3 className="text-xl font-semibold text-slate-800 mb-4 text-center">Camera Preview - Point at Leaf</h3>
            <div className="flex justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-w-full h-auto max-h-96 rounded-xl shadow-lg bg-black"
                style={{ transform: 'scaleX(-1)' }} // Mirror the video for better UX
              />
            </div>
            <div className="text-center mt-4">
              <p className="text-slate-600 text-sm">Ensure the leaf is well-lit and centered in the frame</p>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
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
              Cancel Camera
            </button>
          </div>
        </div>
      )}

      {/* Capture Options - Only show when no camera is active and no loading */}
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
                  <div className="font-semibold">Open Camera</div>
                  <div className="text-sm opacity-90">Take photo directly</div>
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

      {/* Preview Section */}
      {preview && !cameraActive && (
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
              <button 
                onClick={resetCapture} 
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300"
              >
                Capture New Photo
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
          <h3 className="text-xl font-semibold text-slate-800 mb-2">Camera Error</h3>
          <p className="text-slate-600 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <button onClick={openCamera} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
              Try Again
            </button>
            <button onClick={openGallery} className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300">
              Use Gallery
            </button>
          </div>
        </Card>
      )}

      {/* Rest of your results display component remains the same */}
      {result && !error && (
        <div className="space-y-6">
          {/* Your existing results display code */}
        </div>
      )}
    </div>
  );
});

CameraCapture.displayName = 'CameraCapture';

export default CameraCapture;