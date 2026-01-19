import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Upload, X, RotateCw, Download, 
  Leaf, AlertCircle, CheckCircle, Loader2,
  Image as ImageIcon, ScanLine, FileText,
  ChevronRight, Shield, Zap, ThermometerSun
} from 'lucide-react';
import { 
  Box, Typography, Grid, Container, Chip,
  Alert, LinearProgress, IconButton,
  CircularProgress
} from '@mui/material';

const CameraCapture = ({ uploadUrl, onResult }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  
  const [mode, setMode] = useState('idle'); // idle, camera, preview, loading, result
  const [stream, setStream] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [cameraError, setCameraError] = useState(false);

  // Step-by-step guide for proper leaf capture
  const captureSteps = [
    { icon: <Leaf />, text: "Healthy leaf", tip: "Choose mature leaf" },
    { icon: <Camera />, text: "Clear background", tip: "Solid background" },
    { icon: <Shield />, text: "Good lighting", tip: "Natural daylight" },
    { icon: <ThermometerSun />, text: "Close-up shot", tip: "Focus on leaf" }
  ];

  // Initialize camera
  useEffect(() => {
    checkBackendStatus();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    try {
      const response = await fetch(`${uploadUrl}/health`, { timeout: 5000 });
      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    }
  };

  const startCamera = async () => {
    setError(null);
    setCameraError(false);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.play();
      }
      setMode('camera');
    } catch (err) {
      console.error('Camera error:', err);
      setCameraError(true);
      setError('Camera access denied or unavailable');
      setMode('idle');
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setMode('idle');
  };

  const capturePhoto = () => {
    if (!videoRef.current || !videoRef.current.videoWidth) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    
    // Set canvas size
    const video = videoRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw video frame
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Get image data URL
    const imageData = canvas.toDataURL('image/jpeg', 0.8);
    setPreview(imageData);
    setMode('preview');
    stopCamera();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) { // 5MB max
      setError('Image too large (max 5MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      setMode('preview');
    };
    reader.onerror = () => {
      setError('Failed to load image');
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset input
  };

  const analyzeImage = async () => {
    if (!preview) return;

    setMode('loading');
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress for better UX
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Convert base64 to blob
      const base64Response = await fetch(preview);
      const blob = await base64Response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'leaf-image.jpg');

      // Upload to backend with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      const uploadResponse = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!uploadResponse.ok) {
        throw new Error(`Analysis failed: ${uploadResponse.status}`);
      }

      const data = await uploadResponse.json();
      setResult(data);
      setMode('result');
      if (onResult) onResult(data);

    } catch (err) {
      setError(err.name === 'AbortError' 
        ? 'Analysis timed out. Please try again.' 
        : 'Failed to analyze image. Please try again.');
      setMode('preview');
      setUploadProgress(0);
    }
  };

  const resetCapture = () => {
    setPreview('');
    setResult(null);
    setError(null);
    setUploadProgress(0);
    setMode('idle');
  };

  const retryAnalysis = () => {
    setResult(null);
    setMode('preview');
  };

  return (
    <Container maxWidth="lg" sx={{ 
      py: { xs: 3, sm: 4 }, 
      px: { xs: 1, sm: 2 } 
    }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6 sm:mb-8"
      >
        <div className="inline-flex items-center gap-2 sm:gap-3 mb-3 sm:mb-4">
          <div className="p-2 sm:p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-xl sm:rounded-2xl shadow-lg">
            <ScanLine className="w-5 h-5 sm:w-6 sm:h-6 md:w-8 md:h-8 text-white" />
          </div>
          <Typography 
            variant="h4" 
            className="font-black whitespace-nowrap"
            sx={{ 
              color: 'grey.900',
              fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' }
            }}
          >
            AI Leaf Analysis
          </Typography>
        </div>
        
        <Typography variant="body1" className="text-grey-600 mx-auto"
          sx={{ 
            fontSize: { xs: '0.875rem', sm: '1rem' },
            maxWidth: { xs: '95%', sm: '2xl' },
            lineHeight: 1.5,
            px: { xs: 1, sm: 0 }
          }}>
          Capture or upload leaf images for instant disease and nutrient analysis
        </Typography>
      </motion.div>

      {/* Main Content Grid */}
      <Grid container spacing={3} sm={2} alignItems="stretch">
        {/* Left Column - Capture Guide */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Box className="sticky top-4">
              {/* Capture Guide */}
              <Box className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-emerald-200 mb-4 sm:mb-6">
                <Typography variant="h6" className="font-bold text-emerald-800 mb-3 sm:mb-4 flex items-center gap-2"
                  sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                  <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
                  Capture Tips
                </Typography>
                <div className="space-y-3 sm:space-y-4">
                  {captureSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-white/80 rounded-lg sm:rounded-xl"
                    >
                      <div className="p-1.5 sm:p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg flex-shrink-0">
                        <div className="w-4 h-4 sm:w-5 sm:h-5">
                          {React.cloneElement(step.icon, { className: "w-full h-full text-emerald-600" })}
                        </div>
                      </div>
                      <div className="min-w-0">
                        <Typography variant="body2" className="font-semibold text-grey-800"
                          sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                          {step.text}
                        </Typography>
                        <Typography variant="caption" className="text-grey-600"
                          sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                          {step.tip}
                        </Typography>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Box>

              {/* Backend Status */}
              <Box className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${
                backendStatus === 'online' 
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
                  : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                    <div className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${
                      backendStatus === 'online' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
                    }`} />
                    <div className="min-w-0">
                      <Typography variant="body2" className="font-semibold text-grey-800 truncate"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                        AI Service
                      </Typography>
                      <Typography variant="caption" className="text-grey-600 truncate"
                        sx={{ fontSize: { xs: '0.7rem', sm: '0.75rem' } }}>
                        {backendStatus === 'online' ? 'Ready for analysis' : 'Checking connection'}
                      </Typography>
                    </div>
                  </div>
                  <IconButton 
                    size="small" 
                    onClick={checkBackendStatus}
                    sx={{ p: 0.5, flexShrink: 0 }}
                  >
                    <RotateCw className="w-3 h-3 sm:w-4 sm:h-4" />
                  </IconButton>
                </div>
              </Box>
            </Box>
          </motion.div>
        </Grid>

        {/* Right Column - Main Interface */}
        <Grid item xs={12} md={8}>
          <AnimatePresence mode="wait">
            {/* IDLE MODE - Selection Screen */}
            {mode === 'idle' && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
              >
                <Box className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl border border-grey-200 p-4 sm:p-6 md:p-8">
                  <div className="text-center mb-4 sm:mb-6 md:mb-8">
                    <Typography variant="h5" className="font-bold text-grey-900 mb-2"
                      sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                      Select Capture Method
                    </Typography>
                    <Typography variant="body2" className="text-grey-600"
                      sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                      Get instant analysis for your coffee leaves
                    </Typography>
                  </div>

                  <Grid container spacing={3} sm={2}>
                    {/* Camera Option */}
                    <Grid item xs={12} sm={6}>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={startCamera}
                        className="w-full group"
                        disabled={cameraError}
                      >
                        <Box className={`relative border-2 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center transition-all duration-300 h-full ${
                          cameraError 
                            ? 'border-red-200 bg-red-50/50' 
                            : 'border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100 hover:border-emerald-300 hover:shadow-lg'
                        }`}>
                          {cameraError && (
                            <div className="absolute top-2 right-2">
                              <AlertCircle className="w-4 h-4 text-red-500" />
                            </div>
                          )}
                          <div className="relative inline-flex mb-3 sm:mb-4">
                            <div className={`absolute inset-0 rounded-full blur-lg opacity-30 group-hover:opacity-50 ${
                              cameraError 
                                ? 'bg-gradient-to-r from-red-400 to-red-500' 
                                : 'bg-gradient-to-r from-emerald-400 to-emerald-500'
                            }`} />
                            <div className={`relative p-3 sm:p-4 rounded-full ${
                              cameraError 
                                ? 'bg-gradient-to-r from-red-500 to-red-600' 
                                : 'bg-gradient-to-r from-emerald-500 to-emerald-600'
                            }`}>
                              <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                          </div>
                          <Typography variant="h6" className={`font-bold mb-1 sm:mb-2 ${
                            cameraError ? 'text-red-800' : 'text-emerald-800'
                          }`}
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}>
                            {cameraError ? 'Camera Unavailable' : 'Use Camera'}
                          </Typography>
                          <Typography variant="body2" className={`${
                            cameraError ? 'text-red-600' : 'text-grey-600'
                          }`}
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            {cameraError ? 'Check camera permissions' : 'Real-time capture'}
                          </Typography>
                        </Box>
                      </motion.button>
                    </Grid>

                    {/* Upload Option */}
                    <Grid item xs={12} sm={6}>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full group"
                      >
                        <Box className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-xl sm:rounded-2xl p-4 sm:p-6 text-center hover:border-blue-300 hover:shadow-lg transition-all duration-300 h-full">
                          <div className="relative inline-flex mb-3 sm:mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full blur-lg opacity-30 group-hover:opacity-50" />
                            <div className="relative p-3 sm:p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
                              <Upload className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                            </div>
                          </div>
                          <Typography variant="h6" className="font-bold text-blue-800 mb-1 sm:mb-2"
                            sx={{ fontSize: { xs: '0.875rem', sm: '1rem', md: '1.125rem' } }}>
                            Upload Image
                          </Typography>
                          <Typography variant="body2" className="text-grey-600"
                            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                            From gallery or files
                          </Typography>
                        </Box>
                      </motion.button>
                    </Grid>
                  </Grid>

                  {/* File Input */}
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileSelect}
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                  />
                </Box>
              </motion.div>
            )}

            {/* CAMERA MODE */}
            {mode === 'camera' && (
              <motion.div
                key="camera"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Box className="bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl">
                  {/* Camera Feed */}
                  <div className="relative aspect-square sm:aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Camera Overlay */}
                    <div className="absolute inset-0">
                      {/* Capture Frame */}
                      <div className="absolute inset-0 flex items-center justify-center p-4">
                        <div className="w-full max-w-xs h-64 sm:w-64 sm:h-64 border-2 border-white/50 rounded-2xl" />
                      </div>
                      
                      {/* Controls */}
                      <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex justify-center items-center gap-4 sm:gap-6 px-4">
                        <IconButton
                          onClick={stopCamera}
                          className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                          sx={{ p: { xs: 0.75, sm: 1 } }}
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5" />
                        </IconButton>
                        
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={capturePhoto}
                          className="relative"
                        >
                          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-full p-1">
                            <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" />
                          </div>
                        </motion.button>
                        
                        <IconButton
                          onClick={() => {
                            // Handle camera flip (front/back)
                          }}
                          className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                          sx={{ p: { xs: 0.75, sm: 1 } }}
                        >
                          <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </Box>
              </motion.div>
            )}

            {/* PREVIEW MODE */}
            {mode === 'preview' && (
              <motion.div
                key="preview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Box className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl border border-grey-200 overflow-hidden">
                  {/* Preview Image */}
                  <div className="relative bg-grey-50">
                    <img
                      src={preview}
                      alt="Leaf preview"
                      className="w-full h-64 sm:h-80 object-contain"
                      loading="lazy"
                    />
                    <div className="absolute top-3 right-3 bg-black/70 text-white px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
                      Preview
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <Box className="p-4 sm:p-6">
                    <Grid container spacing={2} sm={3}>
                      <Grid item xs={12} sm={6}>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={analyzeImage}
                          disabled={backendStatus !== 'online'}
                          className={`w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 rounded-lg sm:rounded-xl font-semibold text-sm sm:text-base ${
                            backendStatus === 'online'
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg'
                              : 'bg-grey-100 text-grey-400 cursor-not-allowed'
                          }`}
                        >
                          <Zap className="w-4 h-4 sm:w-5 sm:h-5" />
                          {backendStatus === 'online' ? 'Analyze Now' : 'Service Offline'}
                        </motion.button>
                      </Grid>
                      <Grid item xs={12} sm={6}>
                        <motion.button
                          whileTap={{ scale: 0.98 }}
                          onClick={resetCapture}
                          className="w-full flex items-center justify-center gap-2 sm:gap-3 px-4 sm:px-6 py-3 sm:py-4 border-2 border-grey-300 text-grey-700 font-semibold rounded-lg sm:rounded-xl hover:bg-grey-50 text-sm sm:text-base"
                        >
                          <X className="w-4 h-4 sm:w-5 sm:h-5" />
                          Capture New
                        </motion.button>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </motion.div>
            )}

            {/* LOADING MODE */}
            {mode === 'loading' && (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <Box className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl border border-grey-200 p-6 sm:p-8 text-center">
                  {/* Animated Loader */}
                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 mx-auto mb-4 sm:mb-6">
                    <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-pulse" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-2 sm:inset-4 border-4 border-emerald-500 border-t-transparent rounded-full"
                    />
                    <Leaf className="w-8 h-8 sm:w-10 sm:h-10 text-emerald-500 absolute inset-0 m-auto" />
                  </div>

                  <Typography variant="h5" className="font-bold text-grey-900 mb-2"
                    sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                    Analyzing Leaf
                  </Typography>
                  
                  <Typography variant="body2" className="text-grey-600 mb-4 sm:mb-6"
                    sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                    AI is examining disease patterns and nutrient levels
                  </Typography>

                  {/* Progress Bar */}
                  <Box className="max-w-md mx-auto px-2 sm:px-0">
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress}
                      sx={{ 
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: 'rgb(209, 213, 219)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#10b981',
                          borderRadius: 3
                        }
                      }}
                    />
                    <Typography variant="caption" className="text-grey-500 mt-2 block"
                      sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                      {uploadProgress}% complete
                    </Typography>
                  </Box>
                </Box>
              </motion.div>
            )}

            {/* RESULT MODE */}
            {mode === 'result' && result && (
              <motion.div
                key="result"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                <Box className="space-y-4 sm:space-y-6">
                  {/* Results Summary */}
                  <Box className="bg-white rounded-2xl sm:rounded-3xl shadow-lg sm:shadow-xl border border-grey-200 p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-4 sm:mb-6 flex-wrap gap-2">
                      <Typography variant="h5" className="font-bold text-grey-900"
                        sx={{ fontSize: { xs: '1rem', sm: '1.125rem', md: '1.25rem' } }}>
                        Analysis Results
                      </Typography>
                      <Chip 
                        label="AI Powered"
                        className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800"
                        icon={<Zap className="w-3 h-3 sm:w-4 sm:h-4" />}
                        size="small"
                        sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
                      />
                    </div>

                    <Grid container spacing={2} sm={3}>
                      {/* Disease Detection */}
                      {result.disease_prediction && (
                        <Grid item xs={12} sm={6}>
                          <Box className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${
                            result.disease_prediction.class === 'Healthy' 
                              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
                              : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
                          }`}>
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                              <div className={`p-1.5 sm:p-2 rounded-lg ${
                                result.disease_prediction.class === 'Healthy' 
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : 'bg-amber-100 text-amber-600'
                              }`}>
                                <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <Typography variant="h6" className="font-bold min-w-0 truncate"
                                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                Disease Status
                              </Typography>
                            </div>
                            <Typography variant="h4" className={`font-black mb-1 sm:mb-2 ${
                              result.disease_prediction.class === 'Healthy' 
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}
                              sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
                              {result.disease_prediction.class}
                            </Typography>
                            <div className="flex items-center justify-between">
                              <Typography variant="body2" className="text-grey-600"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                Confidence
                              </Typography>
                              <Typography variant="body2" className="font-semibold text-grey-800"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                {Math.round(result.disease_prediction.confidence * 100)}%
                              </Typography>
                            </div>
                          </Box>
                        </Grid>
                      )}

                      {/* Nutrient Analysis */}
                      {result.deficiency_prediction && (
                        <Grid item xs={12} sm={6}>
                          <Box className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border ${
                            result.deficiency_prediction.class === 'Healthy' 
                              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
                              : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                          }`}>
                            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                              <div className={`p-1.5 sm:p-2 rounded-lg ${
                                result.deficiency_prediction.class === 'Healthy' 
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
                              </div>
                              <Typography variant="h6" className="font-bold min-w-0 truncate"
                                sx={{ fontSize: { xs: '0.875rem', sm: '1rem' } }}>
                                Nutrient Status
                              </Typography>
                            </div>
                            <Typography variant="h4" className={`font-black mb-1 sm:mb-2 ${
                              result.deficiency_prediction.class === 'Healthy' 
                                ? 'text-emerald-700'
                                : 'text-blue-700'
                            }`}
                              sx={{ fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' } }}>
                              {result.deficiency_prediction.class}
                            </Typography>
                            <div className="flex items-center justify-between">
                              <Typography variant="body2" className="text-grey-600"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                Confidence
                              </Typography>
                              <Typography variant="body2" className="font-semibold text-grey-800"
                                sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}>
                                {Math.round(result.deficiency_prediction.confidence * 100)}%
                              </Typography>
                            </div>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  {/* Action Buttons */}
                  <Grid container spacing={2} sm={3}>
                    <Grid item xs={12} sm={4}>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={resetCapture}
                        className="w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-lg sm:rounded-xl hover:shadow-lg text-sm sm:text-base"
                      >
                        <Leaf className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>New Analysis</span>
                      </motion.button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {/* Download PDF */}}
                        className="w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg sm:rounded-xl hover:shadow-lg text-sm sm:text-base"
                      >
                        <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>PDF Report</span>
                      </motion.button>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <motion.button
                        whileTap={{ scale: 0.98 }}
                        onClick={retryAnalysis}
                        className="w-full flex items-center justify-center gap-2 sm:gap-3 px-3 sm:px-4 md:px-6 py-2.5 sm:py-3 border-2 border-grey-300 text-grey-700 font-semibold rounded-lg sm:rounded-xl hover:bg-grey-50 text-sm sm:text-base"
                      >
                        <RotateCw className="w-4 h-4 sm:w-5 sm:h-5" />
                        <span>Retry</span>
                      </motion.button>
                    </Grid>
                  </Grid>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Error Display */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 sm:mt-6"
            >
              <Alert 
                severity="error"
                onClose={() => setError(null)}
                className="rounded-xl sm:rounded-2xl"
                sx={{ 
                  fontSize: { xs: '0.875rem', sm: '1rem' },
                  '& .MuiAlert-message': { py: { xs: 0.5, sm: 1 } }
                }}
              >
                {error}
              </Alert>
            </motion.div>
          )}
        </Grid>
      </Grid>

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Container>
  );
};

export default CameraCapture;