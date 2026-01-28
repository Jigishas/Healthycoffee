import React, { useState, useRef, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Camera, Upload, X, RotateCw, Leaf, Shield, Zap, ThermometerSun, ScanLine, FileText } from 'lucide-react';
import { Box, Typography, Grid, Container, Chip, Alert, LinearProgress, IconButton } from '@mui/material';

const CAPTURE_STEPS = [
  { icon: Leaf, text: "Select healthy leaf", tip: "Choose mature, representative leaf" },
  { icon: Camera, text: "Clear background", tip: "Use solid color or soil background" },
  { icon: Shield, text: "Good lighting", tip: "Natural daylight, no shadows" },
  { icon: ThermometerSun, text: "Close-up shot", tip: "Focus on entire leaf surface" }
];

const CameraCapture = ({ uploadUrl, onResult }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);
  const [mode, setMode] = useState('idle');
  const [stream, setStream] = useState(null);
  const [preview, setPreview] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking');
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => { checkBackendStatus(); return () => { if (stream) stream.getTracks().forEach(track => track.stop()); }; }, []);

  const checkBackendStatus = async () => {
    setBackendStatus('checking');
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500); // Reduced timeout to 2000ms for faster check
      const response = await fetch(`${uploadUrl}/health`, { signal: controller.signal });
      clearTimeout(timeoutId);
      setBackendStatus(response.ok ? 'online' : 'offline');
    } catch { setBackendStatus('offline'); }
  };

  const startCamera = async () => {
    setError(null);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } } });
      setStream(mediaStream);
      if (videoRef.current) videoRef.current.srcObject = mediaStream;
      setMode('camera');
    } catch (err) { setError('Camera access denied. Please check permissions.'); setMode('idle'); }
  };

  const stopCamera = () => { if (stream) { stream.getTracks().forEach(track => track.stop()); setStream(null); } setMode('idle'); };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    setPreview(canvas.toDataURL('image/jpeg'));
    setMode('preview');
    stopCamera();
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Please select an image file'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('Image too large (max 10MB)'); return; }
    const reader = new FileReader();
    reader.onload = (e) => { setPreview(e.target.result); setMode('preview'); fileInputRef.current.file = file; };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const analyzeImage = async () => {
    if (!preview) return;
    setMode('loading'); setError(null); setUploadProgress(0);
    const progressInterval = setInterval(() => setUploadProgress(prev => prev >= 90 ? 90 : prev + 10), 200);
    try {
      const blob = await (await fetch(preview)).blob();
      const formData = new FormData();
      formData.append('image', blob, 'leaf-image.jpg');
      const uploadResponse = await fetch(`${uploadUrl}/api/upload-image`, { method: 'POST', body: formData });
      clearInterval(progressInterval);
      setUploadProgress(100);
      if (!uploadResponse.ok) throw new Error('Analysis failed');
      const data = await uploadResponse.json();
      setResult(data); setMode('result');
      if (onResult) onResult(data);
    } catch (err) { setError('Failed to analyze image. Please try again.'); setMode('preview'); setUploadProgress(0); clearInterval(progressInterval); }
  };

  const resetCapture = () => { setPreview(''); setResult(null); setError(null); setUploadProgress(0); setMode('idle'); };
  const retryAnalysis = () => { setResult(null); setMode('preview'); };

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
            <ScanLine className="w-8 h-8 text-white" />
          </div>
          <Typography variant="h4" className="font-black" sx={{ color: 'grey.900' }}>AI Leaf Analysis</Typography>
        </div>
        <Typography variant="body1" className="text-grey-600 max-w-2xl mx-auto">Capture or upload leaf images for instant disease and nutrient analysis</Typography>
      </motion.div>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <Box className="sticky top-4">
              <Box className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-6 border border-emerald-200 mb-6">
                <Typography variant="h6" className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <Leaf className="w-5 h-5" />
                  Capture Tips
                </Typography>
                <div className="space-y-4">
                  {CAPTURE_STEPS.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-white/80 rounded-xl"
                    >
                      <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg">
                        {React.createElement(step.icon, { className: "w-5 h-5" })}
                      </div>
                      <div>
                        <Typography variant="body2" className="font-semibold text-grey-800">
                          {step.text}
                        </Typography>
                        <Typography variant="caption" className="text-grey-600">
                          {step.tip}
                        </Typography>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </Box>

              {/* Backend Status */}
              <Box className={`p-4 rounded-2xl border ${
                backendStatus === 'online' 
                  ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
                  : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      backendStatus === 'online' ? 'bg-emerald-500' : 'bg-amber-500'
                    }`} />
                    <div>
                      <Typography variant="body2" className="font-semibold text-grey-800">
                        AI Service
                      </Typography>
                      <Typography variant="caption" className="text-grey-600">
                        {backendStatus === 'online' ? 'Ready for analysis' : 'Checking connection'}
                      </Typography>
                    </div>
                  </div>
                  <IconButton size="small" onClick={checkBackendStatus}>
                    <RotateCw className="w-4 h-4" />
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
                <Box className="bg-white rounded-3xl shadow-xl border border-grey-200 p-8">
                  <div className="text-center mb-8">
                    <Typography variant="h5" className="font-bold text-grey-900 mb-2">
                      Select Capture Method
                    </Typography>
                    <Typography variant="body2" className="text-grey-600">
                      Get instant analysis for your coffee leaves
                    </Typography>
                  </div>

                  <Grid container spacing={4}>
                    {/* Camera Option */}
                    <Grid item xs={12} md={6}>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={startCamera} className="w-full group">
                        <Box className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl p-8 text-center hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
                          <div className="relative inline-flex mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full blur-lg opacity-30 group-hover:opacity-50" />
                            <div className="relative p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full">
                              <Camera className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <Typography variant="h6" className="font-bold text-emerald-800 mb-2">Use Camera</Typography>
                          <Typography variant="body2" className="text-grey-600">Real-time capture</Typography>
                        </Box>
                      </motion.button>
                    </Grid>
                    <Grid item xs={12} md={6}>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={() => fileInputRef.current?.click()} className="w-full group">
                        <Box className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-8 text-center hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                          <div className="relative inline-flex mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full blur-lg opacity-30 group-hover:opacity-50" />
                            <div className="relative p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
                              <Upload className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <Typography variant="h6" className="font-bold text-blue-800 mb-2">Upload Image</Typography>
                          <Typography variant="body2" className="text-grey-600">From gallery or files</Typography>
                        </Box>
                      </motion.button>
                    </Grid>
                  </Grid>

                  {/* File Input */}
                  <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                </Box>
              </motion.div>
            )}

            {mode === 'camera' && (
              <motion.div key="camera" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Box className="bg-black rounded-3xl overflow-hidden shadow-2xl">
                  <div className="relative aspect-video">
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                    <div className="absolute inset-0">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-white/50 rounded-2xl" />
                      </div>
                      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
                        <IconButton onClick={stopCamera} className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
                          <X className="w-6 h-6" />
                        </IconButton>
                        <motion.button whileTap={{ scale: 0.9 }} onClick={capturePhoto} className="relative">
                          <div className="w-20 h-20 bg-white rounded-full p-1">
                            <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" />
                          </div>
                        </motion.button>
                        <IconButton className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm">
                          <RotateCw className="w-6 h-6" />
                        </IconButton>
                      </div>
                    </div>
                  </div>
                </Box>
              </motion.div>
            )}

            {mode === 'preview' && (
              <motion.div key="preview" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Box className="bg-white rounded-3xl shadow-xl border border-grey-200 overflow-hidden">
                  <div className="relative">
                    <img src={preview} alt="Leaf preview" className="w-full h-96 object-contain bg-grey-50" />
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">Preview</div>
                  </div>
                  <Box className="p-6">
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={analyzeImage} disabled={backendStatus !== 'online'} className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold ${backendStatus === 'online' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg' : 'bg-grey-100 text-grey-400 cursor-not-allowed'}`}>
                          <Zap className="w-5 h-5" />
                          {backendStatus === 'online' ? 'Analyze Now' : 'Service Offline'}
                        </motion.button>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={resetCapture} className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-grey-300 text-grey-700 font-semibold rounded-xl hover:bg-grey-50">
                          <X className="w-5 h-5" />
                          Capture New
                        </motion.button>
                      </Grid>
                    </Grid>
                  </Box>
                </Box>
              </motion.div>
            )}

            {mode === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <Box className="bg-white rounded-3xl shadow-xl border border-grey-200 p-8 text-center">
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-pulse" />
                    <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute inset-4 border-4 border-emerald-500 border-t-transparent rounded-full" />
                    <Leaf className="w-12 h-12 text-emerald-500 absolute inset-0 m-auto" />
                  </div>
                  <Typography variant="h5" className="font-bold text-grey-900 mb-2">Analyzing Leaf</Typography>
                  <Typography variant="body2" className="text-grey-600 mb-6">AI is examining disease patterns and nutrient levels</Typography>
                  <Box className="max-w-md mx-auto">
                    <LinearProgress variant="determinate" value={uploadProgress} sx={{ height: 8, borderRadius: 4, backgroundColor: 'rgb(209, 213, 219)', '& .MuiLinearProgress-bar': { backgroundColor: '#10b981', borderRadius: 4 } }} />
                    <Typography variant="caption" className="text-grey-500 mt-2 block">{uploadProgress}% complete</Typography>
                  </Box>
                </Box>
              </motion.div>
            )}

            {mode === 'result' && result && (
              <motion.div key="result" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                <Box className="space-y-6">
                  <Box className="bg-white rounded-3xl shadow-xl border border-grey-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <Typography variant="h5" className="font-bold text-grey-900">Analysis Results</Typography>
                      <Chip label="AI Powered" className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800" icon={<Zap className="w-4 h-4" />} />
                    </div>
                    <Grid container spacing={4}>
                      {result.disease_prediction && (
                        <Grid item xs={12} md={6}>
                          <Box className={`p-4 rounded-2xl border ${result.disease_prediction.class === 'Healthy' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200' : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'}`}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`p-2 rounded-lg ${result.disease_prediction.class === 'Healthy' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                <Shield className="w-5 h-5" />
                              </div>
                              <Typography variant="h6" className="font-bold">Disease Status</Typography>
                            </div>
                            <Typography variant="h4" className={`font-black mb-2 ${result.disease_prediction.class === 'Healthy' ? 'text-emerald-700' : 'text-amber-700'}`}>{result.disease_prediction.class}</Typography>
                            <div className="flex items-center justify-between">
                              <Typography variant="body2" className="text-grey-600">Confidence</Typography>
                              <Typography variant="body2" className="font-semibold text-grey-800">{Math.round(result.disease_prediction.confidence * 100)}%</Typography>
                            </div>
                          </Box>
                        </Grid>
                      )}
                      {result.deficiency_prediction && (
                        <Grid item xs={12} md={6}>
                          <Box className={`p-4 rounded-2xl border ${result.deficiency_prediction.class === 'Healthy' ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200' : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'}`}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`p-2 rounded-lg ${result.deficiency_prediction.class === 'Healthy' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}`}>
                                <Leaf className="w-5 h-5" />
                              </div>
                              <Typography variant="h6" className="font-bold">Nutrient Status</Typography>
                            </div>
                            <Typography variant="h4" className={`font-black mb-2 ${result.deficiency_prediction.class === 'Healthy' ? 'text-emerald-700' : 'text-blue-700'}`}>{result.deficiency_prediction.class}</Typography>
                            <div className="flex items-center justify-between">
                              <Typography variant="body2" className="text-grey-600">Confidence</Typography>
                              <Typography variant="body2" className="font-semibold text-grey-800">{Math.round(result.deficiency_prediction.confidence * 100)}%</Typography>
                            </div>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={resetCapture} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg">
                        <Leaf className="w-5 h-5" />
                        New Analysis
                      </motion.button>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg">
                        <FileText className="w-5 h-5" />
                        PDF Report
                      </motion.button>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={retryAnalysis} className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-grey-300 text-grey-700 font-semibold rounded-xl hover:bg-grey-50">
                        <RotateCw className="w-5 h-5" />
                        Retry Analysis
                      </motion.button>
                    </Grid>
                  </Grid>
                </Box>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mt-6">
              <Alert severity="error" onClose={() => setError(null)} className="rounded-2xl">{error}</Alert>
            </motion.div>
          )}
        </Grid>
      </Grid>
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </Container>
  );
};

export default CameraCapture;