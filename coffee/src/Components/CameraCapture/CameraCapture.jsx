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
    
    try {
      // Create a new window for PDF content
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Please allow pop-ups to generate PDF');
        return;
      }

      // Get confidence levels
      const deficiencyConfidence = result.deficiency_prediction ? Math.round((result.deficiency_prediction.confidence || 0) * 100) : 0;
      const diseaseConfidence = result.disease_prediction ? Math.round((result.disease_prediction.confidence || 0) * 100) : 0;

      // Create PDF content
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Leaf Analysis Report</title>
          <style>
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px; 
              color: #333;
              line-height: 1.6;
            }
            .header { 
              text-align: center; 
              border-bottom: 3px solid #2ecc71; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .header h1 { 
              color: #2c3e50; 
              margin: 0; 
              font-size: 32px;
            }
            .header p { 
              color: #7f8c8d; 
              font-size: 16px;
            }
            .section { 
              margin-bottom: 30px; 
              background: #f8f9fa; 
              padding: 25px; 
              border-radius: 10px;
              border-left: 4px solid #3498db;
            }
            .section h2 { 
              color: #2c3e50; 
              border-bottom: 2px solid #ecf0f1; 
              padding-bottom: 10px; 
              margin-top: 0;
            }
            .confidence-meter {
              background: #ecf0f1;
              border-radius: 20px;
              padding: 15px;
              margin: 15px 0;
            }
            .confidence-level {
              background: linear-gradient(90deg, #e74c3c, #f39c12, #2ecc71);
              height: 8px;
              border-radius: 4px;
              margin: 10px 0;
              position: relative;
            }
            .confidence-marker {
              position: absolute;
              top: -4px;
              width: 16px;
              height: 16px;
              background: #2c3e50;
              border-radius: 50%;
              transform: translateX(-50%);
            }
            .recommendation-box {
              background: white;
              border-radius: 8px;
              padding: 15px;
              margin: 10px 0;
              border-left: 4px solid #3498db;
            }
            .status-badge {
              display: inline-block;
              padding: 8px 16px;
              border-radius: 20px;
              color: white;
              font-weight: bold;
              margin: 5px 0;
            }
            .healthy { background: #27ae60; }
            .moderate { background: #f39c12; }
            .critical { background: #e74c3c; }
            .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
            .footer { 
              text-align: center; 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 2px solid #ecf0f1; 
              color: #7f8c8d;
              font-size: 14px;
            }
            @media print {
              body { padding: 20px; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌿 Leaf Analysis Report</h1>
            <p>AI-Powered Plant Health Assessment</p>
            <p><strong>Generated:</strong> ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}</p>
          </div>

          ${result.deficiency_prediction ? `
          <div class="section">
            <h2>🧪 Nutrient Deficiency Analysis</h2>
            <div class="status-badge ${result.deficiency_prediction.class.toLowerCase().includes('healthy') ? 'healthy' : result.deficiency_prediction.class.toLowerCase().includes('mild') ? 'moderate' : 'critical'}">
              ${result.deficiency_prediction.class}
            </div>
            <div class="confidence-meter">
              <strong>Confidence Level: ${deficiencyConfidence}%</strong>
              <div class="confidence-level">
                <div class="confidence-marker" style="left: ${deficiencyConfidence}%;"></div>
              </div>
            </div>
            ${result.deficiency_prediction.explanation ? `<p><strong>Explanation:</strong> ${result.deficiency_prediction.explanation}</p>` : ''}
            ${result.deficiency_prediction.recommendation ? `<p><strong>Recommendation:</strong> ${result.deficiency_prediction.recommendation}</p>` : ''}
          </div>
          ` : ''}

          ${result.disease_prediction ? `
          <div class="section">
            <h2>🔬 Disease Detection Analysis</h2>
            <div class="status-badge ${result.disease_prediction.class.toLowerCase().includes('healthy') ? 'healthy' : result.disease_prediction.class.toLowerCase().includes('mild') ? 'moderate' : 'critical'}">
              ${result.disease_prediction.class}
            </div>
            <div class="confidence-meter">
              <strong>Confidence Level: ${diseaseConfidence}%</strong>
              <div class="confidence-level">
                <div class="confidence-marker" style="left: ${diseaseConfidence}%;"></div>
              </div>
            </div>
            ${result.disease_prediction.explanation ? `<p><strong>Explanation:</strong> ${result.disease_prediction.explanation}</p>` : ''}
            ${result.disease_prediction.recommendation ? `<p><strong>Recommendation:</strong> ${result.disease_prediction.recommendation}</p>` : ''}
          </div>
          ` : ''}

          ${result.recommendations?.disease_recommendations ? `
          <div class="section">
            <h2>🛡️ Disease Management Recommendations</h2>
            
            ${result.recommendations.disease_recommendations.overview ? `
            <div class="recommendation-box">
              <strong>Overview:</strong> ${result.recommendations.disease_recommendations.overview}
            </div>
            ` : ''}

            ${result.recommendations.disease_recommendations.symptoms ? `
            <h3>📋 Symptoms</h3>
            <ul>
              ${result.recommendations.disease_recommendations.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}
            </ul>
            ` : ''}

            ${result.recommendations.disease_recommendations.integrated_management ? `
            <div class="grid-2">
              ${result.recommendations.disease_recommendations.integrated_management.cultural_practices ? `
              <div>
                <h3>🌱 Cultural Practices</h3>
                <ul>
                  ${result.recommendations.disease_recommendations.integrated_management.cultural_practices.map(practice => `<li>${practice}</li>`).join('')}
                </ul>
              </div>
              ` : ''}

              ${result.recommendations.disease_recommendations.integrated_management.chemical_control ? `
              <div>
                <h3>🧪 Chemical Control</h3>
                <ul>
                  ${result.recommendations.disease_recommendations.integrated_management.chemical_control.map(control => `<li>${control}</li>`).join('')}
                </ul>
              </div>
              ` : ''}
            </div>

            ${result.recommendations.disease_recommendations.integrated_management.biological_control ? `
            <h3>🐞 Biological Control</h3>
            <ul>
              ${result.recommendations.disease_recommendations.integrated_management.biological_control.map(control => `<li>${control}</li>`).join('')}
            </ul>
            ` : ''}

            ${result.recommendations.disease_recommendations.integrated_management.monitoring ? `
            <h3>👀 Monitoring</h3>
            <ul>
              ${result.recommendations.disease_recommendations.integrated_management.monitoring.map(monitor => `<li>${monitor}</li>`).join('')}
            </ul>
            ` : ''}
            ` : ''}

            ${result.recommendations.disease_recommendations.severity_specific_recommendations ? `
            <h3>⚡ Severity-Specific Actions</h3>
            <p><strong>Spray Frequency:</strong> ${result.recommendations.disease_recommendations.severity_specific_recommendations.spray_frequency}</p>
            <p><strong>Intervention Level:</strong> ${result.recommendations.disease_recommendations.severity_specific_recommendations.intervention_level}</p>
            
            ${result.recommendations.disease_recommendations.severity_specific_recommendations.immediate_actions ? `
            <h4>Immediate Actions</h4>
            <ul>
              ${result.recommendations.disease_recommendations.severity_specific_recommendations.immediate_actions.map(action => `<li>${action}</li>`).join('')}
            </ul>
            ` : ''}

            ${result.recommendations.disease_recommendations.severity_specific_recommendations.long_term_strategies ? `
            <h4>Long-term Strategies</h4>
            <ul>
              ${result.recommendations.disease_recommendations.severity_specific_recommendations.long_term_strategies.map(strategy => `<li>${strategy}</li>`).join('')}
            </ul>
            ` : ''}
            ` : ''}

            ${result.recommendations.disease_recommendations.economic_considerations ? `
            <h3>💰 Economic Considerations</h3>
            <div class="grid-2">
              <div><strong>Management Cost:</strong> $${result.recommendations.disease_recommendations.economic_considerations.management_cost_usd_per_ha}/ha</div>
              <div><strong>Yield Loss:</strong> ${result.recommendations.disease_recommendations.economic_considerations.potential_yield_loss_percent}%</div>
              <div><strong>ROI:</strong> ${result.recommendations.disease_recommendations.economic_considerations.return_on_investment}</div>
              <div><strong>Economic Threshold:</strong> ${result.recommendations.disease_recommendations.economic_considerations.economic_threshold}</div>
            </div>
            ` : ''}
          </div>
          ` : ''}

          ${result.recommendations?.deficiency_recommendations ? `
          <div class="section">
            <h2>🌱 Nutrition Management</h2>
            
            ${result.recommendations.deficiency_recommendations.symptoms ? `
            <h3>📋 Symptoms</h3>
            <ul>
              ${result.recommendations.deficiency_recommendations.symptoms.map(symptom => `<li>${symptom}</li>`).join('')}
            </ul>
            ` : ''}

            ${result.recommendations.deficiency_recommendations.basic ? `
            <h3>💡 Basic Recommendations</h3>
            <ul>
              ${result.recommendations.deficiency_recommendations.basic.map(rec => `<li>${rec}</li>`).join('')}
            </ul>
            ` : ''}

            ${result.recommendations.deficiency_recommendations.management ? `
            <h3>⚡ Advanced Management</h3>
            <ul>
              ${result.recommendations.deficiency_recommendations.management.map(manage => `<li>${manage}</li>`).join('')}
            </ul>
            ` : ''}
          </div>
          ` : ''}

          <div class="footer">
            <p>Generated by Leaf Analysis Studio | AI-Powered Plant Health Assessment</p>
            <p>For professional agricultural advice, consult with certified experts.</p>
          </div>

          <div class="no-print" style="text-align: center; margin-top: 30px;">
            <button onclick="window.print()" style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 5px; cursor: pointer;">
              Print PDF
            </button>
          </div>
        </body>
        </html>
      `;

      printWindow.document.write(pdfContent);
      printWindow.document.close();
      
      // Auto-print after content loads
      printWindow.onload = function() {
        setTimeout(() => {
          printWindow.print();
          // Don't close immediately to allow user to see the print dialog
        }, 500);
      };

    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Error generating PDF. Please try again or use JSON export.');
    }
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
    setCameraActive(false);

    if (!isHttps && window.location.hostname !== 'localhost') {
      setCameraLoading(false);
      setError('Camera access requires HTTPS. Please ensure you are using a secure connection (https://) or localhost.');
      return;
    }

    try {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }

      const constraints = {
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'environment'
        }
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
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
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'captured-photo.jpg', { type: 'image/jpeg' });
          const imageUrl = URL.createObjectURL(file);
          setPreview(imageUrl);
          uploadToBackend(file);
          stopCamera();
        }
      }, 'image/jpeg', 0.9);
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

  // Confidence Radio Component
  const ConfidenceRadio = ({ confidence, label, color }) => {
    const percentage = Math.round(confidence * 100);
    const getConfidenceLevel = (percent) => {
      if (percent >= 80) return 'High';
      if (percent >= 60) return 'Medium';
      if (percent >= 40) return 'Low';
      return 'Very Low';
    };

    return (
      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-200">
        <div className="flex items-center gap-4">
          <div className={`w-4 h-4 rounded-full border-4 ${color} relative`}>
            <div 
              className="absolute inset-0 rounded-full bg-current opacity-20"
              style={{ transform: `scale(${percentage / 100})` }}
            ></div>
          </div>
          <div>
            <div className="font-semibold text-slate-800">{label}</div>
            <div className="text-sm text-slate-600">{getConfidenceLevel(percentage)} confidence</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-slate-800 text-lg">{percentage}%</div>
          <div className="w-24 bg-slate-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full ${color}`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  // Recommendation Section Component
  const RecommendationSection = ({ title, icon, children, color = 'blue' }) => (
    <div className={`bg-gradient-to-br from-${color}-50 to-${color}-100 p-6 rounded-xl border border-${color}-200`}>
      <h3 className="text-xl font-semibold text-slate-800 mb-4 flex items-center gap-3">
        <span className="text-2xl">{icon}</span>
        {title}
      </h3>
      {children}
    </div>
  );

  // List Item Component
  const ListItem = ({ children, icon = "•" }) => (
    <div className="flex items-start gap-3 py-2">
      <span className="text-slate-500 mt-1 flex-shrink-0">{icon}</span>
      <span className="text-slate-700">{children}</span>
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
              <h3 className="text-2xl font-semibold text-slate-800 mb-2">Opening Camera</h3>
              <p className="text-slate-600">Requesting camera access...</p>
            </div>
          </div>
        </Card>
      )}

      {/* Real Camera View */}
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
                style={{ transform: 'scaleX(-1)' }}
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
              <div className="w-64 mx-auto">
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-500 mt-2">{uploadProgress}% complete</p>
              </div>
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

      {/* Results Display */}
      {result && !error && (
        <div className="space-y-6">
          {/* Overview Card */}
          <Card className="p-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-800 mb-2">Analysis Results</h2>
                <p className="text-slate-600">Comprehensive health assessment of your leaf sample</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={exportAsJSON}
                  className="bg-slate-700 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <span>📄</span>
                  JSON
                </button>
                <button 
                  onClick={exportAsPDF}
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-5 py-2.5 rounded-xl transition-all duration-300 flex items-center gap-2"
                >
                  <span>📊</span>
                  PDF Report
                </button>
              </div>
            </div>

            {/* Confidence Levels */}
            <div className="space-y-4 mb-8">
              {result.deficiency_prediction && (
                <ConfidenceRadio 
                  confidence={result.deficiency_prediction.confidence || 0}
                  label="Nutrient Deficiency Analysis"
                  color="bg-blue-500 border-blue-500"
                />
              )}
              {result.disease_prediction && (
                <ConfidenceRadio 
                  confidence={result.disease_prediction.confidence || 0}
                  label="Disease Detection Analysis"
                  color="bg-rose-500 border-rose-500"
                />
              )}
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
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="text-lg font-bold text-slate-800 mb-2">{result.deficiency_prediction.class}</div>
                    {result.deficiency_prediction.explanation && (
                      <p className="text-slate-700 text-sm">{result.deficiency_prediction.explanation}</p>
                    )}
                  </div>
                  {result.deficiency_prediction.recommendation && (
                    <div className="bg-blue-100 rounded-lg p-4 border border-blue-200">
                      <div className="font-semibold text-blue-800 mb-1">Recommendation:</div>
                      <p className="text-blue-700 text-sm">{result.deficiency_prediction.recommendation}</p>
                    </div>
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
                  <div className="bg-white rounded-lg p-4 mb-4">
                    <div className="text-lg font-bold text-slate-800 mb-2">{result.disease_prediction.class}</div>
                    {result.disease_prediction.explanation && (
                      <p className="text-slate-700 text-sm">{result.disease_prediction.explanation}</p>
                    )}
                  </div>
                  {result.disease_prediction.recommendation && (
                    <div className="bg-rose-100 rounded-lg p-4 border border-rose-200">
                      <div className="font-semibold text-rose-800 mb-1">Recommendation:</div>
                      <p className="text-rose-700 text-sm">{result.disease_prediction.recommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>

          {/* Detailed Recommendations */}
          {(result.recommendations?.disease_recommendations || result.recommendations?.deficiency_recommendations) && (
            <div className="space-y-6">
              {/* Disease Recommendations */}
              {result.recommendations.disease_recommendations && (
                <RecommendationSection title="Disease Management Plan" icon="🛡️" color="purple">
                  {/* Overview */}
                  {result.recommendations.disease_recommendations.overview && (
                    <div className="bg-white rounded-lg p-4 mb-6 border border-purple-200">
                      <h4 className="font-semibold text-purple-800 mb-2">Overview</h4>
                      <p className="text-slate-700">{result.recommendations.disease_recommendations.overview}</p>
                    </div>
                  )}

                  {/* Symptoms */}
                  {result.recommendations.disease_recommendations.symptoms && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="text-purple-600">📋</span>
                        Symptoms
                      </h4>
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        {result.recommendations.disease_recommendations.symptoms.map((symptom, index) => (
                          <ListItem key={index} icon="🔍">
                            {symptom}
                          </ListItem>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Integrated Management */}
                  {result.recommendations.disease_recommendations.integrated_management && (
                    <div className="space-y-6">
                      <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
                        <span className="text-purple-600">⚡</span>
                        Integrated Management Strategies
                      </h4>

                      {/* Cultural Practices */}
                      {result.recommendations.disease_recommendations.integrated_management.cultural_practices && (
                        <div className="bg-white rounded-lg p-4 border border-green-200">
                          <h5 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                            <span>🌱</span>
                            Cultural Practices
                          </h5>
                          {result.recommendations.disease_recommendations.integrated_management.cultural_practices.map((practice, index) => (
                            <ListItem key={index}>{practice}</ListItem>
                          ))}
                        </div>
                      )}

                      {/* Chemical Control */}
                      {result.recommendations.disease_recommendations.integrated_management.chemical_control && (
                        <div className="bg-white rounded-lg p-4 border border-orange-200">
                          <h5 className="font-semibold text-orange-800 mb-3 flex items-center gap-2">
                            <span>🧪</span>
                            Chemical Control
                          </h5>
                          {result.recommendations.disease_recommendations.integrated_management.chemical_control.map((control, index) => (
                            <ListItem key={index}>{control}</ListItem>
                          ))}
                        </div>
                      )}

                      {/* Biological Control */}
                      {result.recommendations.disease_recommendations.integrated_management.biological_control && (
                        <div className="bg-white rounded-lg p-4 border border-blue-200">
                          <h5 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                            <span>🐞</span>
                            Biological Control
                          </h5>
                          {result.recommendations.disease_recommendations.integrated_management.biological_control.map((control, index) => (
                            <ListItem key={index}>{control}</ListItem>
                          ))}
                        </div>
                      )}

                      {/* Monitoring */}
                      {result.recommendations.disease_recommendations.integrated_management.monitoring && (
                        <div className="bg-white rounded-lg p-4 border border-indigo-200">
                          <h5 className="font-semibold text-indigo-800 mb-3 flex items-center gap-2">
                            <span>👀</span>
                            Monitoring
                          </h5>
                          {result.recommendations.disease_recommendations.integrated_management.monitoring.map((monitor, index) => (
                            <ListItem key={index}>{monitor}</ListItem>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Severity Specific Recommendations */}
                  {result.recommendations.disease_recommendations.severity_specific_recommendations && (
                    <div className="bg-white rounded-lg p-4 border border-amber-200 mt-6">
                      <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                        <span>⚡</span>
                        Severity-Specific Actions
                      </h4>
                      <div className="grid md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <div className="font-semibold text-slate-700">Spray Frequency</div>
                          <div className="text-slate-600">{result.recommendations.disease_recommendations.severity_specific_recommendations.spray_frequency}</div>
                        </div>
                        <div>
                          <div className="font-semibold text-slate-700">Intervention Level</div>
                          <div className="text-slate-600">{result.recommendations.disease_recommendations.severity_specific_recommendations.intervention_level}</div>
                        </div>
                      </div>

                      {/* Immediate Actions */}
                      {result.recommendations.disease_recommendations.severity_specific_recommendations.immediate_actions && (
                        <div className="mb-4">
                          <h5 className="font-semibold text-slate-700 mb-2">Immediate Actions</h5>
                          {result.recommendations.disease_recommendations.severity_specific_recommendations.immediate_actions.map((action, index) => (
                            <ListItem key={index} icon="🚨">{action}</ListItem>
                          ))}
                        </div>
                      )}

                      {/* Long-term Strategies */}
                      {result.recommendations.disease_recommendations.severity_specific_recommendations.long_term_strategies && (
                        <div>
                          <h5 className="font-semibold text-slate-700 mb-2">Long-term Strategies</h5>
                          {result.recommendations.disease_recommendations.severity_specific_recommendations.long_term_strategies.map((strategy, index) => (
                            <ListItem key={index} icon="📈">{strategy}</ListItem>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Economic Considerations */}
                  {result.recommendations.disease_recommendations.economic_considerations && (
                    <div className="bg-white rounded-lg p-4 border border-emerald-200 mt-6">
                      <h4 className="font-semibold text-emerald-800 mb-3 flex items-center gap-2">
                        <span>💰</span>
                        Economic Considerations
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-emerald-600">${result.recommendations.disease_recommendations.economic_considerations.management_cost_usd_per_ha}</div>
                          <div className="text-sm text-slate-600">Cost/ha</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-rose-600">{result.recommendations.disease_recommendations.economic_considerations.potential_yield_loss_percent}%</div>
                          <div className="text-sm text-slate-600">Yield Loss</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-blue-600">{result.recommendations.disease_recommendations.economic_considerations.return_on_investment}</div>
                          <div className="text-sm text-slate-600">ROI</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-amber-600">{result.recommendations.disease_recommendations.economic_considerations.economic_threshold}</div>
                          <div className="text-sm text-slate-600">Threshold</div>
                        </div>
                      </div>
                    </div>
                  )}
                </RecommendationSection>
              )}

              {/* Deficiency Recommendations */}
              {result.recommendations.deficiency_recommendations && (
                <RecommendationSection title="Nutrition Management" icon="🌱" color="emerald">
                  {/* Symptoms */}
                  {result.recommendations.deficiency_recommendations.symptoms && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-800 mb-3">Symptoms</h4>
                      <div className="bg-white rounded-lg p-4 border border-emerald-100">
                        {result.recommendations.deficiency_recommendations.symptoms.map((symptom, index) => (
                          <ListItem key={index} icon="🔍">
                            {symptom}
                          </ListItem>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Basic Recommendations */}
                  {result.recommendations.deficiency_recommendations.basic && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-slate-800 mb-3">Basic Recommendations</h4>
                      <div className="bg-white rounded-lg p-4 border border-blue-100">
                        {result.recommendations.deficiency_recommendations.basic.map((rec, index) => (
                          <ListItem key={index} icon="💡">
                            {rec}
                          </ListItem>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Advanced Management */}
                  {result.recommendations.deficiency_recommendations.management && (
                    <div>
                      <h4 className="font-semibold text-slate-800 mb-3">Advanced Management</h4>
                      <div className="bg-white rounded-lg p-4 border border-purple-100">
                        {result.recommendations.deficiency_recommendations.management.map((manage, index) => (
                          <ListItem key={index} icon="⚡">
                            {manage}
                          </ListItem>
                        ))}
                      </div>
                    </div>
                  )}
                </RecommendationSection>
              )}
            </div>
          )}

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