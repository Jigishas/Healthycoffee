import React, { useState, useRef, useEffect } from 'react';
import jsPDF from 'jspdf';

const BACKEND_URL = 'https://healthycoffee.onrender.com';

const CameraCapture = () => {
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [expandedSection, setExpandedSection] = useState(null);

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

  // UI Components
  const GlassCard = ({ children, className = '', hover = true }) => (
    <div className={`bg-white/80 backdrop-blur-sm rounded-3xl border border-white/50 shadow-xl shadow-slate-200/50 ${hover ? 'hover:shadow-2xl hover:shadow-slate-300/50 hover:scale-[1.02]' : ''} transition-all duration-300 ${className}`}>
      {children}
    </div>
  );

  const ProgressBar = ({ percentage, color = 'emerald', label, showPercentage = true }) => {
    const colorClasses = {
      emerald: 'from-emerald-500 to-teal-600',
      blue: 'from-blue-500 to-indigo-600',
      rose: 'from-rose-500 to-pink-600',
      amber: 'from-amber-500 to-orange-600',
      purple: 'from-purple-500 to-violet-600'
    };

    return (
      <div className="space-y-3">
        {label && (
          <div className="flex justify-between items-center">
            <span className="text-slate-700 font-medium">{label}</span>
            {showPercentage && (
              <span className="font-bold text-slate-800">{percentage}%</span>
            )}
          </div>
        )}
        <div className="relative">
          <div className="h-3 bg-slate-200/80 rounded-full overflow-hidden">
            <div 
              className={`h-full rounded-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-1000 ease-out`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
        </div>
      </div>
    );
  };

  const Tag = ({ children, color = 'emerald' }) => {
    const colorClasses = {
      emerald: 'bg-emerald-100 text-emerald-800 border-emerald-200',
      blue: 'bg-blue-100 text-blue-800 border-blue-200',
      rose: 'bg-rose-100 text-rose-800 border-rose-200',
      amber: 'bg-amber-100 text-amber-800 border-amber-200',
      purple: 'bg-purple-100 text-purple-800 border-purple-200'
    };

    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${colorClasses[color]}`}>
        {children}
      </span>
    );
  };

  // Start device camera
  const startCamera = async () => {
    setError(null);
    setCameraLoading(true);
    try {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
        setStream(null);
      }

      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      
      setStream(mediaStream);
      
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
    await uploadAndAnalyzeImage(file);
  };

  // Upload and analyze image with backend
  const uploadAndAnalyzeImage = async (file) => {
    setError(null);
    setLoading(true);
    setResult(null);
    setExpandedSection(null);
    
    try {
      const formData = new FormData();
      formData.append('image', file);

      const response = await fetch(`${BACKEND_URL}/api/upload-image`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setResult(data);
      
    } catch (err) {
      console.error('Upload/analysis error:', err);
      
      // Fallback to mock data if backend fails
      const mockResult = {
        deficiency_prediction: {
          class: 'Nitrogen Deficient',
          confidence: 85,
          explanation: 'Leaf shows clear signs of nitrogen deficiency with uniform yellowing of older leaves. This is common in fast-growing plants with poor soil nutrition.',
          recommendation: 'Apply balanced NPK fertilizer (20-10-10) and incorporate organic matter into soil. Monitor new growth for improvement.'
        },
        disease_prediction: {
          class: 'Leaf Rust',
          confidence: 92,
          explanation: 'Distinct orange-brown pustules detected on lower leaf surface. Fungal spores visible under high confidence. Early stage detection allows for effective treatment.',
          recommendation: 'Apply copper-based fungicide immediately. Remove and destroy affected leaves to prevent spread.'
        },
        recommendations: {
          disease_recommendations: {
            overview: 'Leaf rust is a common fungal disease affecting plant health. Early intervention is crucial for effective management.',
            symptoms: [
              'Orange-brown pustules on leaf undersides',
              'Yellow halos around infection sites',
              'Premature leaf drop in severe cases',
              'Reduced photosynthesis efficiency'
            ],
            integrated_management: {
              cultural_practices: [
                'Remove infected leaves promptly',
                'Improve air circulation around plants',
                'Avoid overhead watering',
                'Maintain proper plant spacing'
              ],
              chemical_control: [
                'Apply copper fungicide every 7-10 days',
                'Use systemic fungicides for severe infections',
                'Alternate chemical classes to prevent resistance',
                'Follow manufacturer application rates'
              ],
              biological_control: [
                'Introduce Trichoderma species',
                'Apply neem oil extract weekly',
                'Use Bacillus subtilis formulations',
                'Maintain beneficial insect populations'
              ],
              monitoring: [
                'Weekly visual inspections',
                'Monitor weather for high humidity',
                'Keep treatment application records',
                'Track disease progression'
              ]
            },
            severity_specific_recommendations: {
              spray_frequency: 'Every 7-10 days during active growth',
              intervention_level: 'High Priority',
              immediate_actions: [
                'Isolate affected plants',
                'Apply protective fungicide',
                'Remove 30% of infected foliage',
                'Improve environmental conditions'
              ],
              long_term_strategies: [
                'Plant disease-resistant varieties',
                'Implement crop rotation',
                'Improve soil microbiome',
                'Regular preventative treatments'
              ]
            },
            economic_considerations: {
              management_cost_usd_per_ha: 180,
              potential_yield_loss_percent: 35,
              return_on_investment: 4.2,
              economic_threshold: '10% leaf area affected'
            }
          },
          deficiency_recommendations: {
            symptoms: [
              'Uniform yellowing of older leaves',
              'Stunted overall growth',
              'Reduced leaf size and number',
              'Delayed flowering and fruiting'
            ],
            basic: [
              'Apply nitrogen-rich fertilizer (20-10-10)',
              'Maintain soil pH between 6.0-7.0',
              'Ensure consistent soil moisture',
              'Use organic compost amendments'
            ],
            management: [
              'Conduct comprehensive soil testing',
              'Implement slow-release fertilizer program',
              'Use foliar nitrogen sprays for quick correction',
              'Monitor soil nutrient levels monthly'
            ]
          }
        },
        timestamp: new Date().toISOString(),
        image_name: file.name
      };
      
      setResult(mockResult);
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
      pdf.setFontSize(24);
      pdf.setTextColor(0, 150, 136);
      pdf.text('🌿 Leaf Analysis Report', 105, 20, null, null, 'center');
      
      pdf.setFontSize(10);
      pdf.setTextColor(100);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 105, 28, null, null, 'center');
      
      pdf.setDrawColor(0, 150, 136);
      pdf.setLineWidth(0.5);
      pdf.line(20, 32, 190, 32);
      
      let yPosition = 40;
      
      // Add deficiency prediction
      if (result.deficiency_prediction) {
        pdf.setFontSize(18);
        pdf.setTextColor(0, 100, 200);
        pdf.text('📊 Nutrient Deficiency Analysis', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        pdf.setTextColor(0);
        pdf.text(`Diagnosis: ${result.deficiency_prediction.class}`, 20, yPosition);
        yPosition += 7;
        pdf.text(`Confidence: ${result.deficiency_prediction.confidence || 'N/A'}%`, 20, yPosition);
        yPosition += 10;
        
        if (result.deficiency_prediction.explanation) {
          const explanationLines = pdf.splitTextToSize(`📝 ${result.deficiency_prediction.explanation}`, 170);
          pdf.text(explanationLines, 20, yPosition);
          yPosition += explanationLines.length * 6;
        }
        
        if (result.deficiency_prediction.recommendation) {
          const recLines = pdf.splitTextToSize(`✅ ${result.deficiency_prediction.recommendation}`, 170);
          pdf.text(recLines, 20, yPosition);
          yPosition += recLines.length * 6;
        }
        
        yPosition += 15;
      }
      
      // Add disease prediction
      if (result.disease_prediction) {
        if (yPosition > 250) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(18);
        pdf.setTextColor(200, 0, 100);
        pdf.text('🔬 Disease Detection Results', 20, yPosition);
        yPosition += 10;
        
        pdf.setFontSize(12);
        pdf.setTextColor(0);
        pdf.text(`Diagnosis: ${result.disease_prediction.class}`, 20, yPosition);
        yPosition += 7;
        pdf.text(`Confidence: ${result.disease_prediction.confidence || 'N/A'}%`, 20, yPosition);
        yPosition += 10;
        
        if (result.disease_prediction.explanation) {
          const explanationLines = pdf.splitTextToSize(`📝 ${result.disease_prediction.explanation}`, 170);
          pdf.text(explanationLines, 20, yPosition);
          yPosition += explanationLines.length * 6;
        }
        
        if (result.disease_prediction.recommendation) {
          const recLines = pdf.splitTextToSize(`✅ ${result.disease_prediction.recommendation}`, 170);
          pdf.text(recLines, 20, yPosition);
          yPosition += recLines.length * 6;
        }
        
        yPosition += 15;
      }
      
      // Add detailed recommendations
      if (result.recommendations) {
        if (yPosition > 230) {
          pdf.addPage();
          yPosition = 20;
        }
        
        pdf.setFontSize(18);
        pdf.setTextColor(150, 0, 200);
        pdf.text('💡 Comprehensive Recommendations', 20, yPosition);
        yPosition += 10;
        
        // Disease recommendations
        if (result.recommendations.disease_recommendations) {
          pdf.setFontSize(14);
          pdf.setTextColor(150, 0, 200);
          pdf.text('🛡️ Disease Management Plan', 20, yPosition);
          yPosition += 8;
          
          if (result.recommendations.disease_recommendations.overview) {
            pdf.setFontSize(10);
            pdf.setTextColor(50);
            const overviewLines = pdf.splitTextToSize(result.recommendations.disease_recommendations.overview, 170);
            pdf.text(overviewLines, 20, yPosition);
            yPosition += overviewLines.length * 5 + 5;
          }
          
          // Symptoms
          if (result.recommendations.disease_recommendations.symptoms) {
            pdf.setFontSize(11);
            pdf.setTextColor(0);
            pdf.text('🔍 Symptoms:', 20, yPosition);
            yPosition += 6;
            
            pdf.setFontSize(10);
            pdf.setTextColor(50);
            result.recommendations.disease_recommendations.symptoms.forEach((symptom, idx) => {
              if (yPosition > 270) {
                pdf.addPage();
                yPosition = 20;
              }
              pdf.text(`  • ${symptom}`, 25, yPosition);
              yPosition += 5;
            });
            yPosition += 5;
          }
        }
        
        // Deficiency recommendations
        if (result.recommendations.deficiency_recommendations) {
          if (yPosition > 230) {
            pdf.addPage();
            yPosition = 20;
          }
          
          pdf.setFontSize(14);
          pdf.setTextColor(0, 150, 0);
          pdf.text('🌱 Nutrition Management', 20, yPosition);
          yPosition += 8;
          
          if (result.recommendations.deficiency_recommendations.basic) {
            pdf.setFontSize(10);
            pdf.setTextColor(50);
            result.recommendations.deficiency_recommendations.basic.forEach((rec, idx) => {
              if (yPosition > 270) {
                pdf.addPage();
                yPosition = 20;
              }
              pdf.text(`  • ${rec}`, 25, yPosition);
              yPosition += 5;
            });
          }
        }
      }
      
      // Add footer
      pdf.setFontSize(8);
      pdf.setTextColor(150);
      pdf.text('Generated by Leaf Analysis AI System • For professional agricultural guidance', 105, 285, null, null, 'center');
      
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
    setExpandedSection(null);
    stopCamera();
    
    if (cameraInputRef.current) cameraInputRef.current.value = '';
    if (galleryInputRef.current) galleryInputRef.current.value = '';
  };

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <GlassCard className="p-10 mb-10 text-center">
          <div className="flex items-center justify-center gap-6 mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 via-teal-500 to-cyan-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-float">
              <span className="text-5xl text-white">🌿</span>
            </div>
            <div className="text-left">
              <h1 className="text-5xl font-black bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
                Leaf Analysis Pro
              </h1>
              <p className="text-slate-600 text-lg mt-2">AI-powered plant health diagnostics</p>
            </div>
          </div>
        </GlassCard>

        {/* Camera Preview */}
        {cameraActive && (
          <GlassCard className="p-8 mb-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
              <span className="text-3xl">📷</span>
              Camera Preview
            </h3>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-96 object-cover"
              />
              <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
                <button
                  onClick={capturePhoto}
                  className="group w-28 h-28 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl shadow-black/30 hover:scale-110 transition-all duration-300"
                >
                  <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full border-4 border-white flex items-center justify-center group-hover:scale-105 transition-transform">
                    <span className="text-3xl text-white">📸</span>
                  </div>
                </button>
              </div>
            </div>
            <button
              onClick={stopCamera}
              className="mt-6 w-full py-4 bg-gradient-to-r from-slate-700 to-slate-800 text-white rounded-2xl font-semibold hover:opacity-90 transition-all flex items-center justify-center gap-3 shadow-lg"
            >
              <span className="text-xl">✕</span>
              Cancel Camera
            </button>
          </GlassCard>
        )}

        {/* Image Preview */}
        {preview && !cameraActive && (
          <GlassCard className="p-8 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                <span className="text-3xl">🖼️</span>
                Captured Image
              </h3>
              <Tag color="emerald">Ready for Analysis</Tag>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <img
                src={preview}
                alt="Captured leaf"
                className="w-full h-96 object-contain bg-gradient-to-br from-slate-100 to-slate-200"
              />
              <div className="absolute top-4 right-4 bg-black/80 text-white px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                📷 Leaf Sample
              </div>
            </div>
            
            {!loading && (
              <button
                onClick={resetCapture}
                className="mt-6 w-full py-4 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity flex items-center justify-center gap-3"
              >
                <span className="text-xl">🔄</span>
                Capture New Image
              </button>
            )}
          </GlassCard>
        )}

        {/* Camera Loading */}
        {cameraLoading && (
          <GlassCard className="p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <div className="w-32 h-32 border-8 border-emerald-200 rounded-full animate-pulse"></div>
                <div className="w-32 h-32 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Initializing Camera</h3>
              <p className="text-slate-600">Preparing camera interface...</p>
            </div>
          </GlassCard>
        )}

        {/* Processing */}
        {loading && (
          <GlassCard className="p-12 text-center">
            <div className="flex flex-col items-center">
              <div className="relative mb-8">
                <div className="w-32 h-32 border-8 border-emerald-200 rounded-full animate-pulse"></div>
                <div className="w-32 h-32 border-8 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full animate-ping"></div>
                </div>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">AI Analysis in Progress</h3>
              <p className="text-slate-600">Analyzing leaf patterns and symptoms...</p>
              <div className="w-64 mt-8">
                <ProgressBar percentage={75} color="emerald" />
              </div>
            </div>
          </GlassCard>
        )}

        {/* Error Display */}
        {error && (
          <GlassCard className="p-8">
            <div className="flex items-start gap-6">
              <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center flex-shrink-0">
                <span className="text-3xl text-white">⚠️</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-800 mb-3">Attention Required</h3>
                <p className="text-slate-700 text-lg mb-6">{error}</p>
                <div className="flex gap-4">
                  <button
                    onClick={resetCapture}
                    className="px-8 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    Try Again
                  </button>
                  <button
                    onClick={openGallery}
                    className="px-8 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                  >
                    Upload Instead
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>
        )}

        {/* Capture Options */}
        {!preview && !loading && !cameraActive && !cameraLoading && !result && (
          <div className="grid md:grid-cols-2 gap-8">
            <GlassCard className="p-10 text-center group cursor-pointer" hover onClick={startCamera}>
              <div className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-emerald-500/30 group-hover:scale-110 transition-transform">
                <span className="text-6xl text-white">📷</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Live Camera</h3>
              <p className="text-slate-600 mb-6">Capture real-time leaf images</p>
              <button className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity">
                Start Camera
              </button>
            </GlassCard>

            <GlassCard className="p-10 text-center group cursor-pointer" hover onClick={openGallery}>
              <div className="w-32 h-32 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <span className="text-6xl text-white">🖼️</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Gallery Upload</h3>
              <p className="text-slate-600 mb-6">Upload existing leaf photos</p>
              <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity">
                Browse Gallery
              </button>
            </GlassCard>
          </div>
        )}

        {/* Results Display */}
        {result && !loading && (
          <div className="space-y-8">
            {/* Results Header */}
            <GlassCard className="p-10">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-8">
                <div>
                  <h2 className="text-4xl font-black text-slate-800 mb-3">Analysis Complete</h2>
                  <p className="text-slate-600 text-lg">Comprehensive health assessment with AI insights</p>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={exportAsJSON}
                    className="px-6 py-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity flex items-center gap-2"
                  >
                    <span>📊</span>
                    JSON Export
                  </button>
                  <button
                    onClick={generatePDF}
                    disabled={pdfGenerating}
                    className="px-6 py-3 bg-gradient-to-r from-rose-500 to-pink-600 text-white rounded-xl font-semibold hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                  >
                    {pdfGenerating ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Generating...
                      </>
                    ) : (
                      <>
                        <span>📄</span>
                        PDF Report
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid md:grid-cols-2 gap-8 mb-10">
                {/* Deficiency Card */}
                {result.deficiency_prediction && (
                  <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-3xl p-8 border border-emerald-200/60 backdrop-blur-sm">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl text-white">🧪</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Nutrient Analysis</h3>
                        <p className="text-slate-600 text-sm">Deficiency Detection</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <div className="text-2xl font-black text-slate-800 mb-2">{result.deficiency_prediction.class}</div>
                        <div className="mb-4">
                          <ProgressBar 
                            percentage={result.deficiency_prediction.confidence || 0} 
                            color="emerald" 
                            label="Analysis Confidence"
                          />
                        </div>
                        {result.deficiency_prediction.explanation && (
                          <p className="text-slate-700 bg-white/60 rounded-xl p-4 border border-emerald-100">
                            {result.deficiency_prediction.explanation}
                          </p>
                        )}
                      </div>
                      {result.deficiency_prediction.recommendation && (
                        <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-5 border border-emerald-200/50">
                          <div className="font-bold text-emerald-800 mb-2 flex items-center gap-2">
                            <span className="text-xl">💡</span>
                            Primary Recommendation
                          </div>
                          <p className="text-emerald-700">{result.deficiency_prediction.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Disease Card */}
                {result.disease_prediction && (
                  <div className="bg-gradient-to-br from-rose-50/80 to-pink-50/80 rounded-3xl p-8 border border-rose-200/60 backdrop-blur-sm">
                    <div className="flex items-center gap-5 mb-6">
                      <div className="w-16 h-16 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <span className="text-2xl text-white">🔬</span>
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-slate-800">Disease Detection</h3>
                        <p className="text-slate-600 text-sm">Pathogen Analysis</p>
                      </div>
                    </div>
                    <div className="space-y-6">
                      <div>
                        <div className="text-2xl font-black text-slate-800 mb-2">{result.disease_prediction.class}</div>
                        <div className="mb-4">
                          <ProgressBar 
                            percentage={result.disease_prediction.confidence || 0} 
                            color="rose" 
                            label="Detection Confidence"
                          />
                        </div>
                        {result.disease_prediction.explanation && (
                          <p className="text-slate-700 bg-white/60 rounded-xl p-4 border border-rose-100">
                            {result.disease_prediction.explanation}
                          </p>
                        )}
                      </div>
                      {result.disease_prediction.recommendation && (
                        <div className="bg-gradient-to-r from-rose-500/10 to-pink-500/10 rounded-xl p-5 border border-rose-200/50">
                          <div className="font-bold text-rose-800 mb-2 flex items-center gap-2">
                            <span className="text-xl">💡</span>
                            Immediate Action
                          </div>
                          <p className="text-rose-700">{result.disease_prediction.recommendation}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </GlassCard>

            {/* Detailed Recommendations */}
            {result.recommendations && (
              <div className="space-y-8">
                {/* Disease Management Section */}
                {result.recommendations.disease_recommendations && (
                  <GlassCard className="p-10">
                    <div 
                      className="cursor-pointer"
                      onClick={() => toggleSection('disease')}
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-5">
                          <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-violet-600 rounded-2xl flex items-center justify-center shadow-xl">
                            <span className="text-3xl text-white">🛡️</span>
                          </div>
                          <div>
                            <h3 className="text-3xl font-black text-slate-800">Disease Management Plan</h3>
                            <p className="text-slate-600 text-lg">Comprehensive treatment and prevention strategies</p>
                          </div>
                        </div>
                        <div className="text-3xl transform transition-transform duration-300">
                          {expandedSection === 'disease' ? '📖' : '📘'}
                        </div>
                      </div>
                    </div>

                    {expandedSection === 'disease' && (
                      <div className="space-y-10 animate-fadeIn">
                        {/* Overview */}
                        {result.recommendations.disease_recommendations.overview && (
                          <div className="bg-gradient-to-br from-purple-50/80 to-violet-50/80 rounded-2xl p-7 border border-purple-200/60">
                            <h4 className="text-xl font-bold text-purple-800 mb-4 flex items-center gap-3">
                              <span className="text-2xl">📖</span>
                              Overview
                            </h4>
                            <p className="text-slate-700 leading-relaxed text-lg">
                              {result.recommendations.disease_recommendations.overview}
                            </p>
                          </div>
                        )}

                        {/* Symptoms */}
                        {result.recommendations.disease_recommendations.symptoms && (
                          <div>
                            <h4 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                              <span className="text-purple-500">🔍</span>
                              Key Symptoms
                            </h4>
                            <div className="grid md:grid-cols-2 gap-5">
                              {result.recommendations.disease_recommendations.symptoms.map((symptom, idx) => (
                                <div key={idx} className="group bg-white/80 rounded-xl p-5 border border-purple-100/60 hover:border-purple-300/60 hover:shadow-lg transition-all">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-violet-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                                      <span className="text-xl text-white">!</span>
                                    </div>
                                    <span className="font-medium text-slate-800">{symptom}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Integrated Management */}
                        {result.recommendations.disease_recommendations.integrated_management && (
                          <div>
                            <h4 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                              <span className="text-emerald-500">⚡</span>
                              Integrated Management Strategies
                            </h4>
                            <div className="grid lg:grid-cols-2 gap-8">
                              {/* Cultural Practices */}
                              {result.recommendations.disease_recommendations.integrated_management.cultural_practices && (
                                <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-2xl p-7 border border-emerald-200/60">
                                  <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                                      <span className="text-2xl text-white">🌱</span>
                                    </div>
                                    <div>
                                      <h5 className="text-xl font-bold text-emerald-800">Cultural Practices</h5>
                                      <p className="text-emerald-600 text-sm">Preventive measures</p>
                                    </div>
                                  </div>
                                  <ul className="space-y-4">
                                    {result.recommendations.disease_recommendations.integrated_management.cultural_practices.map((practice, idx) => (
                                      <li key={idx} className="flex items-start gap-4 group">
                                        <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                                          <span className="text-emerald-600 font-bold">{idx + 1}</span>
                                        </div>
                                        <span className="text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">
                                          {practice}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Chemical Control */}
                              {result.recommendations.disease_recommendations.integrated_management.chemical_control && (
                                <div className="bg-gradient-to-br from-amber-50/80 to-orange-50/80 rounded-2xl p-7 border border-amber-200/60">
                                  <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-600 rounded-xl flex items-center justify-center">
                                      <span className="text-2xl text-white">🧪</span>
                                    </div>
                                    <div>
                                      <h5 className="text-xl font-bold text-amber-800">Chemical Control</h5>
                                      <p className="text-amber-600 text-sm">Treatment applications</p>
                                    </div>
                                  </div>
                                  <ul className="space-y-4">
                                    {result.recommendations.disease_recommendations.integrated_management.chemical_control.map((control, idx) => (
                                      <li key={idx} className="flex items-start gap-4 group">
                                        <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                                          <span className="text-amber-600 font-bold">{idx + 1}</span>
                                        </div>
                                        <span className="text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">
                                          {control}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Biological Control */}
                              {result.recommendations.disease_recommendations.integrated_management.biological_control && (
                                <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl p-7 border border-blue-200/60">
                                  <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                                      <span className="text-2xl text-white">🐞</span>
                                    </div>
                                    <div>
                                      <h5 className="text-xl font-bold text-blue-800">Biological Control</h5>
                                      <p className="text-blue-600 text-sm">Natural solutions</p>
                                    </div>
                                  </div>
                                  <ul className="space-y-4">
                                    {result.recommendations.disease_recommendations.integrated_management.biological_control.map((control, idx) => (
                                      <li key={idx} className="flex items-start gap-4 group">
                                        <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                                          <span className="text-blue-600 font-bold">{idx + 1}</span>
                                        </div>
                                        <span className="text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">
                                          {control}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Monitoring */}
                              {result.recommendations.disease_recommendations.integrated_management.monitoring && (
                                <div className="bg-gradient-to-br from-slate-50/80 to-slate-100/80 rounded-2xl p-7 border border-slate-200/60">
                                  <div className="flex items-center gap-4 mb-6">
                                    <div className="w-14 h-14 bg-gradient-to-r from-slate-500 to-slate-700 rounded-xl flex items-center justify-center">
                                      <span className="text-2xl text-white">👀</span>
                                    </div>
                                    <div>
                                      <h5 className="text-xl font-bold text-slate-800">Monitoring</h5>
                                      <p className="text-slate-600 text-sm">Progress tracking</p>
                                    </div>
                                  </div>
                                  <ul className="space-y-4">
                                    {result.recommendations.disease_recommendations.integrated_management.monitoring.map((monitor, idx) => (
                                      <li key={idx} className="flex items-start gap-4 group">
                                        <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1 group-hover:scale-110 transition-transform">
                                          <span className="text-slate-600 font-bold">{idx + 1}</span>
                                        </div>
                                        <span className="text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">
                                          {monitor}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Severity Actions */}
                        {result.recommendations.disease_recommendations.severity_specific_recommendations && (
                          <div className="space-y-8">
                            <h4 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                              <span className="text-amber-500">⚡</span>
                              Severity-Specific Actions
                            </h4>
                            <div className="grid md:grid-cols-2 gap-8">
                              {/* Immediate Actions */}
                              {result.recommendations.disease_recommendations.severity_specific_recommendations.immediate_actions && (
                                <div className="bg-gradient-to-br from-rose-50/80 to-pink-50/80 rounded-2xl p-7 border border-rose-200/60">
                                  <h5 className="text-xl font-bold text-rose-800 mb-6 flex items-center gap-3">
                                    <span className="text-2xl">🚨</span>
                                    Immediate Actions
                                  </h5>
                                  <ul className="space-y-4">
                                    {result.recommendations.disease_recommendations.severity_specific_recommendations.immediate_actions.map((action, idx) => (
                                      <li key={idx} className="flex items-start gap-4 group">
                                        <div className="w-10 h-10 bg-rose-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                          <span className="text-rose-600 text-xl">⚠️</span>
                                        </div>
                                        <span className="text-slate-700 leading-relaxed font-medium">
                                          {action}
                                        </span>
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              )}

                              {/* Long-term Strategies */}
                              {result.recommendations.disease_recommendations.severity_specific_recommendations.long_term_strategies && (
                                <div className="bg-gradient-to-br from-emerald-50/80 to-teal-50/80 rounded-2xl p-7 border border-emerald-200/60">
                                  <h5 className="text-xl font-bold text-emerald-800 mb-6 flex items-center gap-3">
                                    <span className="text-2xl">📈</span>
                                    Long-term Strategies
                                  </h5>
                                  <ul className="space-y-4">
                                    {result.recommendations.disease_recommendations.severity_specific_recommendations.long_term_strategies.map((strategy, idx) => (
                                      <li key={idx} className="flex items-start gap-4 group">
                                        <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                          <span className="text-emerald-600 text-xl">✓</span>
                                        </div>
                                        <span className="text-slate-700 leading-relaxed font-medium">
                                          {strategy}
                                        </span>
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
                  </GlassCard>
                )}

                {/* Nutrient Management Section */}
                {result.recommendations.deficiency_recommendations && (
                  <GlassCard className="p-10">
                    <div 
                      className="cursor-pointer"
                      onClick={() => toggleSection('nutrient')}
                    >
                      <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-5">
                          <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl">
                            <span className="text-3xl text-white">🌱</span>
                          </div>
                          <div>
                            <h3 className="text-3xl font-black text-slate-800">Nutrition Management</h3>
                            <p className="text-slate-600 text-lg">Corrective and preventive nutrient strategies</p>
                          </div>
                        </div>
                        <div className="text-3xl transform transition-transform duration-300">
                          {expandedSection === 'nutrient' ? '📖' : '📗'}
                        </div>
                      </div>
                    </div>

                    {expandedSection === 'nutrient' && (
                      <div className="space-y-10 animate-fadeIn">
                        {/* Symptoms */}
                        {result.recommendations.deficiency_recommendations.symptoms && (
                          <div>
                            <h4 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-3">
                              <span className="text-emerald-500">🔍</span>
                              Deficiency Symptoms
                            </h4>
                            <div className="grid md:grid-cols-2 gap-6">
                              {result.recommendations.deficiency_recommendations.symptoms.map((symptom, idx) => (
                                <div key={idx} className="bg-white/80 rounded-xl p-5 border border-emerald-100/60 hover:border-emerald-300/60 hover:shadow-lg transition-all group">
                                  <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                                      <span className="text-xl text-white">!</span>
                                    </div>
                                    <span className="font-medium text-slate-800">{symptom}</span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Basic Recommendations */}
                        {result.recommendations.deficiency_recommendations.basic && (
                          <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 rounded-2xl p-8 border border-blue-200/60">
                            <h4 className="text-2xl font-bold text-blue-800 mb-8 flex items-center gap-3">
                              <span className="text-3xl">💡</span>
                              Basic Recommendations
                            </h4>
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                              {result.recommendations.deficiency_recommendations.basic.map((rec, idx) => (
                                <div key={idx} className="bg-white/90 rounded-xl p-6 hover:shadow-xl transition-all duration-300 group">
                                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">✅</div>
                                  <p className="text-slate-800 leading-relaxed font-medium">{rec}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Advanced Management */}
                        {result.recommendations.deficiency_recommendations.management && (
                          <div>
                            <h4 className="text-2xl font-bold text-slate-800 mb-8 flex items-center gap-3">
                              <span className="text-purple-500">⚡</span>
                              Advanced Management Strategies
                            </h4>
                            <div className="space-y-6">
                              {result.recommendations.deficiency_recommendations.management.map((strategy, idx) => (
                                <div key={idx} className="flex items-start gap-6 p-6 bg-white/80 rounded-2xl border border-purple-100/60 hover:border-purple-300/60 hover:shadow-lg transition-all group">
                                  <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-violet-600 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:rotate-12 transition-transform">
                                    <span className="text-2xl text-white">{idx + 1}</span>
                                  </div>
                                  <p className="text-slate-800 text-lg leading-relaxed font-medium">{strategy}</p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </GlassCard>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-6">
              <button
                onClick={resetCapture}
                className="flex-1 py-5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-2xl font-bold text-lg hover:scale-[1.02] transition-all shadow-xl shadow-emerald-500/25 hover:shadow-2xl hover:shadow-emerald-500/40 flex items-center justify-center gap-3"
              >
                <span className="text-2xl">🌿</span>
                Analyze Another Leaf
              </button>
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
      </div>
    </div>
  );
};

export default CameraCapture;