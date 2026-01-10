import React, { useState, useRef, useEffect } from 'react';

const CameraCapture = () => {
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);

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

  const startCamera = async () => {
    setError(null);
    setCameraLoading(true);
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
      const mediaStream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setCameraActive(true);
      }
    } catch (err) {
      console.error('Camera error:', err);
      setError('Camera access required');
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }
    if (videoRef.current) videoRef.current.pause();
    setCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(async (blob) => {
      if (!blob) return;
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      const url = URL.createObjectURL(file);
      setPreview(url);
      await uploadImage(file);
      stopCamera();
    }, 'image/jpeg', 0.9);
  };

  const openCamera = () => cameraInputRef.current?.click();
  const openGallery = () => galleryInputRef.current?.click();

  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Select an image file');
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    await uploadImage(file);
  };

  const uploadImage = async (file) => {
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      const res = await fetch('https://healthycoffee.onrender.com/api/upload-image', {
        method: 'POST',
        body: fd
      });
      if (!res.ok) throw new Error('Upload failed');
      const data = await res.json();
      console.log('Upload successful:', data);
      // Handle response here - you can display predictions or results
      // For example: setResult(data);
    } catch (err) {
      console.error('Upload error:', err);
      setError('Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const resetCapture = () => {
    setPreview('');
    setError(null);
    setLoading(false);
    stopCamera();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl text-white">🌿</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Leaf Scanner</h1>
          <p className="text-slate-600 mt-2">Capture or upload leaf image</p>
        </div>

        {/* Camera View */}
        {cameraActive && (
          <div className="mb-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl border-4 border-white">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-64 object-cover bg-black"
                style={{ transform: 'scaleX(-1)' }}
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={capturePhoto}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                >
                  <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full"></div>
                </button>
              </div>
            </div>
            <button
              onClick={stopCamera}
              className="mt-4 w-full py-3 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Preview */}
        {preview && !cameraActive && (
          <div className="mb-6">
            <div className="relative rounded-2xl overflow-hidden shadow-xl">
              <img
                src={preview}
                alt="Captured"
                className="w-full h-64 object-cover"
              />
            </div>
            {!loading && (
              <button
                onClick={resetCapture}
                className="mt-4 w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity"
              >
                Capture New
              </button>
            )}
          </div>
        )}

        {/* Camera Loading */}
        {cameraLoading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-500 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-600">Initializing camera...</p>
          </div>
        )}

        {/* Image Processing */}
        {loading && (
          <div className="text-center py-12">
            <div className="relative mx-auto w-16 h-16 mb-4">
              <div className="absolute inset-0 border-4 border-emerald-200 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-slate-600">Processing image...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="text-center p-6 bg-gradient-to-r from-rose-50 to-pink-50 rounded-2xl border border-rose-200 mb-6">
            <div className="w-12 h-12 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl text-white">⚠️</span>
            </div>
            <p className="text-rose-700 font-medium mb-4">{error}</p>
            <button
              onClick={resetCapture}
              className="py-2 px-6 bg-white border border-rose-300 text-rose-700 rounded-xl font-medium hover:bg-rose-50 transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Capture Options - Only show when idle */}
        {!preview && !loading && !cameraActive && !cameraLoading && (
          <div className="space-y-4">
            <button
              onClick={startCamera}
              className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-3 shadow-lg"
            >
              <span className="text-xl">📷</span>
              Use Camera
            </button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-slate-50 text-slate-500">or</span>
              </div>
            </div>

            <button
              onClick={openGallery}
              className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-3 shadow-lg"
            >
              <span className="text-xl">🖼️</span>
              Choose from Gallery
            </button>
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
      </div>
    </div>
  );
};

export default CameraCapture;