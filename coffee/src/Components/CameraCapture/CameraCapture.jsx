import React, { useState, useRef, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const BACKEND_URL = import.meta.env.NODE_ENV === 'production' ? '' : 'http://127.0.0.1:8000';

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
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfDownloadStatus, setPdfDownloadStatus] = useState(null);
  const [cameraAvailable, setCameraAvailable] = useState(true);

  const pdfExportRef = useRef(null);

  // Check camera availability
  const checkCameraAvailability = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        return false;
      }
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      setCameraAvailable(videoDevices.length > 0);
      return videoDevices.length > 0;
    } catch (error) {
      console.error('Error checking camera availability:', error);
      setCameraAvailable(false);
      return false;
    }
  };

  // Export functions
  const exportAsJSON = () => {
    if (!result) return;
    const dataStr = JSON.stringify(result, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `leaf-analysis-${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const exportAsPDF = async () => {
    if (!result) return;

    setPdfGenerating(true);
    setPdfDownloadStatus(null);

    try {
      // Create a simple, clean HTML content for PDF
      const deficiencyConfidence = result.deficiency_prediction ? Math.round((result.deficiency_prediction.confidence || 0) * 100) : 0;
      const diseaseConfidence = result.disease_prediction ? Math.round((result.disease_prediction.confidence || 0) * 100) : 0;

      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Leaf Analysis Report</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              color: #333;
              line-height: 1.6;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #4CAF50;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .header h1 {
              color: #2E7D32;
              margin: 0;
              font-size: 28px;
            }
            .header p {
              color: #666;
              margin: 10px 0 0 0;
            }
            .section {
              margin-bottom: 30px;
              padding: 20px;
              border: 1px solid #ddd;
              border-radius: 8px;
              background: #f9f9f9;
            }
            .section h2 {
              color: #2E7D32;
              margin: 0 0 15px 0;
              font-size: 20px;
              border-bottom: 1px solid #4CAF50;
              padding-bottom: 5px;
            }
            .confidence {
              background: white;
              padding: 15px;
              border-radius: 5px;
              margin: 10px 0;
              border-left: 4px solid #2196F3;
            }
            .recommendation {
              background: #E8F5E8;
              padding: 15px;
              border-radius: 5px;
              margin: 10px 0;
              border-left: 4px solid #4CAF50;
            }
            .list-item {
              margin: 8px 0;
              padding-left: 20px;
            }
            .list-item:before {
              content: "•";
              color: #4CAF50;
              font-weight: bold;
              margin-left: -20px;
              margin-right: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌿 Leaf Analysis Report</h1>
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>

          ${result.deficiency_prediction ? `
          <div class="section">
            <h2>🧪 Nutrient Deficiency Analysis</h2>
            <div class="confidence">
              <strong>Result:</strong> ${result.deficiency_prediction.class}<br>
              <strong>Confidence:</strong> ${deficiencyConfidence}%
            </div>
            ${result.deficiency_prediction.explanation ? `
              <div class="recommendation">
                <strong>Explanation:</strong><br>
                ${result.deficiency_prediction.explanation}
              </div>
            ` : ''}
            ${result.deficiency_prediction.recommendation ? `
              <div class="recommendation">
                <strong>Recommendation:</strong><br>
                ${result.deficiency_prediction.recommendation}
              </div>
            ` : ''}
          </div>
          ` : ''}

          ${result.disease_prediction ? `
          <div class="section">
            <h2>🔬 Disease Detection Analysis</h2>
            <div class="confidence">
              <strong>Result:</strong> ${result.disease_prediction.class}<br>
              <strong>Confidence:</strong> ${diseaseConfidence}%
            </div>
            ${result.disease_prediction.explanation ? `
              <div class="recommendation">
                <strong>Explanation:</strong><br>
                ${result.disease_prediction.explanation}
              </div>
            ` : ''}
            ${result.disease_prediction.recommendation ? `
              <div class="recommendation">
                <strong>Recommendation:</strong><br>
                ${result.disease_prediction.recommendation}
              </div>
            ` : ''}
          </div>
          ` : ''}

          ${result.recommendations?.disease_recommendations ? `
          <div class="section">
            <h2>🛡️ Disease Management Recommendations</h2>

            ${result.recommendations.disease_recommendations.overview ? `
              <div class="recommendation">
                <strong>Overview:</strong><br>
                ${result.recommendations.disease_recommendations.overview}
              </div>
            ` : ''}

            ${result.recommendations.disease_recommendations.symptoms ? `
              <div class="recommendation">
                <strong>Symptoms:</strong>
                ${result.recommendations.disease_recommendations.symptoms.map(symptom => `<div class="list-item">${symptom}</div>`).join('')}
              </div>
            ` : ''}

            ${result.recommendations.disease_recommendations.integrated_management?.cultural_practices ? `
              <div class="recommendation">
                <strong>Cultural Practices:</strong>
                ${result.recommendations.disease_recommendations.integrated_management.cultural_practices.map(practice => `<div class="list-item">${practice}</div>`).join('')}
              </div>
            ` : ''}

            ${result.recommendations.disease_recommendations.integrated_management?.chemical_control ? `
              <div class="recommendation">
                <strong>Chemical Control:</strong>
                ${result.recommendations.disease_recommendations.integrated_management.chemical_control.map(control => `<div class="list-item">${control}</div>`).join('')}
              </div>
            ` : ''}
          </div>
          ` : ''}

          ${result.recommendations?.deficiency_recommendations ? `
          <div class="section">
            <h2>🌱 Nutrition Management Recommendations</h2>

            ${result.recommendations.deficiency_recommendations.basic ? `
              <div class="recommendation">
                <strong>Basic Recommendations:</strong>
                ${result.recommendations.deficiency_recommendations.basic.map(rec => `<div class="list-item">${rec}</div>`).join('')}
              </div>
            ` : ''}

            ${result.recommendations.deficiency_recommendations.management ? `
              <div class="recommendation">
                <strong>Management:</strong>
                ${result.recommendations.deficiency_recommendations.management.map(manage => `<div class="list-item">${manage}</div>`).join('')}
              </div>
            ` : ''}
          </div>
          ` : ''}

          <div class="footer">
            <p>Generated by Leaf Analysis Studio | AI-Powered Plant Health Assessment</p>
            <p>For professional agricultural advice, consult with certified experts.</p>
          </div>
        </body>
        </html>
      `;

      // Create a temporary element to hold the HTML content
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = pdfContent;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '-9999px';
      tempDiv.style.width = '800px';
      document.body.appendChild(tempDiv);

      // Use html2canvas with simpler options
      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempDiv.scrollHeight
      });

      // Remove temporary element
      document.body.removeChild(tempDiv);

      // Create PDF with jsPDF
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      // Save the PDF
      pdf.save(`leaf-analysis-report-${new Date().toISOString().split('T')[0]}.pdf`);

      setPdfDownloadStatus('success');

    } catch (err) {
      console.error('PDF generation error:', err);
      setPdfDownloadStatus('failed');

      // Fallback: try a simpler approach
      try {
        // Create a basic text-based PDF as fallback
        const { jsPDF } = await import('jspdf');
        const pdf = new jsPDF();

        pdf.setFontSize(20);
        pdf.text('Leaf Analysis Report', 20, 30);

        pdf.setFontSize(12);
        pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 50);

        let yPosition = 70;

        if (result.deficiency_prediction) {
          pdf.setFontSize(16);
          pdf.text('Nutrient Deficiency Analysis', 20, yPosition);
          yPosition += 20;

          pdf.setFontSize(12);
          pdf.text(`Result: ${result.deficiency_prediction.class}`, 20, yPosition);
          yPosition += 15;
          pdf.text(`Confidence: ${Math.round((result.deficiency_prediction.confidence || 0) * 100)}%`, 20, yPosition);
          yPosition += 20;
        }

        if (result.disease_prediction) {
          pdf.setFontSize(16);
          pdf.text('Disease Detection Analysis', 20, yPosition);
          yPosition += 20;

          pdf.setFontSize(12);
          pdf.text(`Result: ${result.disease_prediction.class}`, 20, yPosition);
          yPosition += 15;
          pdf.text(`Confidence: ${Math.round((result.disease_prediction.confidence || 0) * 100)}%`, 20, yPosition);
          yPosition += 20;
        }

        pdf.save(`leaf-analysis-report-${new Date().toISOString().split('T')[0]}.pdf`);
        setPdfDownloadStatus('success');
      } catch (fallbackErr) {
        console.error('Fallback PDF generation also failed:', fallbackErr);
        alert('PDF generation failed. Please try the JSON export instead.');
      }
    } finally {
      setPdfGenerating(false);
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
    checkCameraAvailability();
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

  // Enhanced camera error handling
  const openCameraWithBasicConstraints = async () => {
    try {
      const basicConstraints = { video: true };
      const mediaStream = await navigator.mediaDevices.getUserMedia(basicConstraints);
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
        setCameraActive(true);
        setCameraLoading(false);
      }
    } catch {
      setError('Cannot access camera with any configuration. Please use gallery upload instead.');
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
      // Stop any existing stream first
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
        setStream(null);
      }

      // Enhanced constraints for better mobile compatibility
      const constraints = {
        video: {
          facingMode: 'environment',
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 },
          frameRate: { ideal: 30, max: 60 }
        }
      };

      console.log('Requesting camera access with constraints:', constraints);
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted, stream tracks:', mediaStream.getTracks().length);

      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;

        // Wait for video to be ready before setting active
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => {
            reject(new Error('Video loading timeout'));
          }, 10000); // 10 second timeout

          videoRef.current.onloadedmetadata = () => {
            clearTimeout(timeout);
            console.log('Video metadata loaded, dimensions:', videoRef.current.videoWidth, 'x', videoRef.current.videoHeight);
            resolve();
          };

          videoRef.current.onerror = () => {
            clearTimeout(timeout);
            reject(new Error('Video loading error'));
          };
        });

        // Now try to play the video
        try {
          await videoRef.current.play();
          console.log('Camera preview started successfully');
          setCameraActive(true);
          setCameraLoading(false);
        } catch (playError) {
          console.error('Video play error:', playError);
          setCameraLoading(false);
          setError('Failed to start camera preview. The camera might be in use by another application.');
          // Clean up stream on play failure
          if (mediaStream) {
            mediaStream.getTracks().forEach(track => track.stop());
            setStream(null);
          }
        }
      } else {
        setCameraLoading(false);
        setError('Video element not available');
      }
    } catch (err) {
      console.error('Camera access error:', err);
      setCameraLoading(false);

      // Comprehensive error handling
      switch(err.name) {
        case 'NotAllowedError':
        case 'PermissionDeniedError':
          setError('Camera access was denied. Please allow camera permissions in your browser settings and try again.');
          break;
        case 'NotFoundError':
        case 'DevicesNotFoundError':
          setError('No camera found on this device. Please check if your camera is connected and try again.');
          break;
        case 'NotReadableError':
        case 'TrackStartError':
          setError('Camera is already in use by another application. Please close other apps using the camera and try again.');
          break;
        case 'OverconstrainedError':
        case 'ConstraintNotSatisfiedError':
          setError('Camera does not support the required features. Trying with basic constraints...');
          // Fallback to basic constraints
          setTimeout(() => openCameraWithBasicConstraints(), 100);
          break;
        case 'TypeError':
          setError('Invalid camera configuration. Please refresh the page and try again.');
          break;
        default:
          setError(`Camera access failed: ${err.message || 'Please try again or use gallery upload.'}`);
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
    setPdfDownloadStatus(null);
    
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
        stream.getTracks().forEach(track => {
          track.stop();
          track.enabled = false;
        });
        setStream(null);
      }
    };
  }, [stream]);

  // Modern Glass Card Component
  const GlassCard = ({ children, className = '', hover = true, variant = 'default' }) => {
    const variants = {
      default: 'bg-white/90 backdrop-blur-xl border-white/60 shadow-slate-900/10',
      primary: 'bg-gradient-to-br from-slate-50/95 to-white/90 backdrop-blur-xl border-slate-200/60 shadow-slate-900/15',
      accent: 'bg-gradient-to-br from-emerald-50/95 via-slate-50/90 to-white/95 backdrop-blur-xl border-emerald-200/60 shadow-emerald-900/10'
    };

    return (
      <div className={`
        rounded-3xl border
        shadow-2xl
        transition-all duration-500 ease-out
        ${variants[variant]}
        ${hover ? 'hover:shadow-2xl hover:shadow-slate-900/20 hover:scale-[1.02] hover:-translate-y-1' : ''}
        ${className}
      `}>
        {children}
      </div>
    );
  };

  // Confidence Radio Component with modern design
  const ConfidenceRadio = ({ confidence, label, color }) => {
    const percentage = Math.round(confidence * 100);
    const getConfidenceLevel = (percent) => {
      if (percent >= 80) return 'High';
      if (percent >= 60) return 'Medium';
      if (percent >= 40) return 'Low';
      return 'Very Low';
    };

    const getColorClasses = (baseColor) => {
      const colors = {
        blue: 'bg-blue-500 border-blue-500 text-blue-600',
        rose: 'bg-rose-500 border-rose-500 text-rose-600',
        emerald: 'bg-emerald-500 border-emerald-500 text-emerald-600',
        amber: 'bg-amber-500 border-amber-500 text-amber-600'
      };
      return colors[baseColor] || colors.blue;
    };

    const colorClass = getColorClasses(color);

    return (
      <div className="flex items-center justify-between p-6 bg-gradient-to-r from-slate-50/80 to-white/80 rounded-2xl border border-slate-200/60 backdrop-blur-sm transition-all duration-300 hover:border-slate-300/80">
        <div className="flex items-center gap-5">
          <div className={`w-5 h-5 rounded-full border-4 ${colorClass.split(' ')[0]} ${colorClass.split(' ')[1]} relative`}>
            <div 
              className="absolute inset-0 rounded-full bg-current opacity-20 animate-pulse"
              style={{ transform: `scale(${percentage / 100})` }}
            ></div>
          </div>
          <div>
            <div className="font-semibold text-slate-800 text-lg">{label}</div>
            <div className="text-sm text-slate-600 font-medium">{getConfidenceLevel(percentage)} confidence</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-bold text-slate-800 text-xl mb-2">{percentage}%</div>
          <div className="w-28 bg-slate-200/80 rounded-full h-2.5 backdrop-blur-sm">
            <div 
              className={`h-2.5 rounded-full ${colorClass.split(' ')[0]} transition-all duration-1000 ease-out`}
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </div>
    );
  };

  // Modern Recommendation Section
  const RecommendationSection = ({ title, icon, children, color = 'blue' }) => {
    const gradientClasses = {
      blue: 'from-blue-50/80 via-blue-100/60 to-indigo-50/80 border-blue-200/60',
      purple: 'from-purple-50/80 via-purple-100/60 to-violet-50/80 border-purple-200/60',
      emerald: 'from-emerald-50/80 via-emerald-100/60 to-green-50/80 border-emerald-200/60',
      rose: 'from-rose-50/80 via-rose-100/60 to-pink-50/80 border-rose-200/60'
    };

    return (
      <GlassCard className={`bg-gradient-to-br ${gradientClasses[color]} p-8`}>
        <h3 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-4">
          <span className="text-3xl">{icon}</span>
          {title}
        </h3>
        {children}
      </GlassCard>
    );
  };

  // Modern List Item Component
  const ListItem = ({ children, icon = "•", color = "blue" }) => {
    const iconColors = {
      blue: 'text-blue-500',
      purple: 'text-purple-500',
      emerald: 'text-emerald-500',
      rose: 'text-rose-500'
    };

    return (
      <div className="flex items-start gap-4 py-3 group hover:bg-white/50 rounded-xl transition-all duration-300">
        <span className={`text-lg font-bold ${iconColors[color]} mt-0.5 flex-shrink-0 group-hover:scale-110 transition-transform`}>
          {icon}
        </span>
        <span className="text-slate-700 leading-relaxed group-hover:text-slate-900 transition-colors">
          {children}
        </span>
      </div>
    );
  };

  // Modern Button Component
  const ModernButton = ({ 
    children, 
    onClick, 
    variant = 'primary', 
    disabled = false, 
    loading = false,
    className = '',
    icon = null 
  }) => {
    const baseClasses = `
      font-semibold py-4 px-8 rounded-2xl 
      transition-all duration-300 transform 
      backdrop-blur-sm border
      disabled:opacity-50 disabled:cursor-not-allowed
      disabled:transform-none
      ${loading ? 'cursor-wait' : ''}
    `;

    const variants = {
      primary: `
        bg-gradient-to-r from-emerald-500 to-teal-600 
        hover:from-emerald-600 hover:to-teal-700 
        text-white shadow-2xl shadow-emerald-500/25
        hover:shadow-2xl hover:shadow-emerald-500/40
        border-emerald-400/30
        hover:scale-105
      `,
      secondary: `
        bg-gradient-to-r from-blue-500 to-indigo-600 
        hover:from-blue-600 hover:to-indigo-700 
        text-white shadow-2xl shadow-blue-500/25
        hover:shadow-2xl hover:shadow-blue-500/40
        border-blue-400/30
        hover:scale-105
      `,
      danger: `
        bg-gradient-to-r from-rose-500 to-pink-600 
        hover:from-rose-600 hover:to-pink-700 
        text-white shadow-2xl shadow-rose-500/25
        hover:shadow-2xl hover:shadow-rose-500/40
        border-rose-400/30
        hover:scale-105
      `,
      ghost: `
        bg-white/20 hover:bg-white/30 
        text-slate-700 border-slate-300/50
        hover:scale-105
      `
    };

    const variantClass = variant === 'primary' ? 'cta-button' : variant === 'ghost' ? 'cta-ghost' : '';

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`${baseClasses} ${variants[variant]} ${variantClass} ${className} flex items-center justify-center gap-3`}
      >
        {loading && (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
        )}
        {icon && !loading && <span className="text-xl">{icon}</span>}
        {children}
      </button>
    );
  };

  return (
    <div ref={componentRef} data-camera-section className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      {/* Enhanced Header */}
      <GlassCard className="p-10 mb-10 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-blue-400/5 to-purple-400/5"></div>
        <div className="relative z-10">
            <div className="flex items-center justify-center gap-5 mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-500/30 animate-pulse">
              <span className="text-3xl text-white">🌿</span>
            </div>
            <h1 className="text-3xl font-black bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
              Leaf Analysis Studio
            </h1>
          </div>
          <p className="text-slate-600 text-base max-w-3xl mx-auto leading-relaxed font-medium">
            AI leaf health & disease detection
          </p>
        </div>
      </GlassCard>

      {/* Camera Loading State */}
      {cameraLoading && (
        <GlassCard className="p-12 text-center">
          <div className="flex flex-col items-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-emerald-200 rounded-full animate-pulse"></div>
              <div className="w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-800 mb-3">Initializing camera</h3>
              <p className="text-slate-600 text-base">Accessing camera...</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Real Camera View */}
      {cameraActive && (
        <div className="space-y-8">
          <GlassCard className="p-8">
            <h3 className="text-xl font-bold text-slate-800 mb-6 text-center flex items-center justify-center gap-3">
              <span className="text-2xl">📷</span>
              Camera preview
            </h3>
            <div className="flex justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-w-full h-auto max-h-96 rounded-2xl shadow-2xl bg-black border-4 border-white/50 media-preview"
                style={{ transform: 'scaleX(-1)', objectFit: 'cover' }}
                role="img"
                aria-label="Live camera preview of leaf"
              />
            </div>
            <div className="text-center mt-6">
              <p className="text-slate-600 text-sm font-medium bg-white/50 rounded-xl py-2 px-4 inline-block backdrop-blur-sm">
                Keep leaf centered and well-lit
              </p>
            </div>
          </GlassCard>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center controls-bar">
            <ModernButton
              onClick={capturePhoto}
              variant="primary"
              icon="📸"
              className="px-8 py-3 text-sm"
            >
              Capture
            </ModernButton>
            <ModernButton
              onClick={stopCamera}
              variant="danger"
              icon="❌"
              className="px-6 py-3 text-sm"
            >
              Cancel
            </ModernButton>
          </div>
        </div>
      )}

      {/* Enhanced Capture Options - Split into Three Aesthetic Sections */}
      {!preview && !loading && !cameraActive && !cameraLoading && (
        <div className="space-y-16">
          {/* Section 1: Capture Guidelines with Interactive Tooltips */}
          <GlassCard variant="primary" className="p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-400/5 via-orange-400/5 to-yellow-400/5"></div>
            <div className="relative z-10">
              <div className="flex items-center justify-center gap-6 mb-10">
                <div className="w-20 h-20 bg-gradient-to-r from-amber-400 to-orange-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-amber-500/40 animate-pulse">
                  <span className="text-4xl text-white">💡</span>
                </div>
                  <div className="text-center">
                    <h3 className="text-2xl font-black text-slate-800 mb-3">
                      Capture guidelines
                    </h3>
                    <p className="text-slate-600 text-sm font-medium">Quick tips for best results</p>
                  </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                  {
                    icon: '☀️',
                    text: 'Optimal Lighting',
                    desc: 'Natural daylight, avoid direct sunlight',
                    details: 'Position your leaf in bright, indirect light. Direct sunlight can create harsh shadows and glare that interfere with AI analysis. Early morning or late afternoon light works best.',
                    color: 'amber'
                  },
                  {
                    icon: '🎯',
                    text: 'Perfect Framing',
                    desc: 'Center leaf, fill 70-80% of frame',
                    details: 'Position the leaf so it occupies most of the frame but leaves some space around the edges. This helps the AI focus on the leaf while providing context for analysis.',
                    color: 'emerald'
                  },
                  {
                    icon: '📏',
                    text: 'Ideal Distance',
                    desc: '6-12 inches from camera lens',
                    details: 'Too close and details blur, too far and the leaf appears too small. The sweet spot ensures crisp details while capturing the entire leaf structure.',
                    color: 'blue'
                  },
                  {
                    icon: '🤚',
                    text: 'Steady Hands',
                    desc: 'Minimize camera shake and movement',
                    details: 'Use both hands to hold your device steady. Rest your elbows on a stable surface if possible. Even slight movement can blur critical leaf details.',
                    color: 'purple'
                  },
                  {
                    icon: '🌿',
                    text: 'Clean Background',
                    desc: 'Solid color, minimal distractions',
                    details: 'A plain background helps the AI distinguish the leaf from surroundings. Avoid busy patterns, other plants, or cluttered environments.',
                    color: 'teal'
                  },
                  {
                    icon: '📱',
                    text: 'High Resolution',
                    desc: 'Maximum camera quality settings',
                    details: 'Higher resolution provides more detail for accurate analysis. Ensure your camera app is set to the highest quality and resolution available.',
                    color: 'rose'
                  }
                ].map((item, index) => (
                  <div key={index} className="group relative">
                    <div className="flex items-start gap-5 p-8 rounded-3xl bg-gradient-to-br from-white/70 to-white/50 backdrop-blur-sm transition-all duration-500 hover:from-white/90 hover:to-white/70 hover:scale-105 hover:shadow-2xl hover:shadow-slate-900/20 border border-slate-200/60 hover:border-slate-300/80 cursor-pointer transform hover:-translate-y-2">
                      <div className={`w-14 h-14 bg-gradient-to-r from-${item.color}-400 to-${item.color}-500 rounded-2xl flex items-center justify-center shadow-xl shadow-${item.color}-500/30 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300`}>
                        <span className="text-2xl text-white group-hover:scale-110 transition-transform">{item.icon}</span>
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-slate-800 text-lg mb-2 group-hover:text-slate-900 transition-colors">{item.text}</div>
                        <div className="text-slate-600 text-sm leading-snug group-hover:text-slate-700 transition-colors">{item.desc}</div>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <span className="text-slate-400 text-sm">Click for details</span>
                      </div>
                    </div>

                    {/* Expanded Tooltip/Details */}
                    <div className="absolute top-full left-0 right-0 mt-4 opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 pointer-events-none group-hover:pointer-events-auto z-20">
                      <div className="bg-white/95 backdrop-blur-xl rounded-2xl p-6 shadow-2xl border border-slate-200/60">
                        <div className="flex items-start gap-4">
                          <span className="text-3xl">{item.icon}</span>
                          <div>
                            <div className="font-bold text-slate-800 text-lg mb-2">{item.text}</div>
                            <div className="text-slate-600 leading-relaxed">{item.details}</div>
                          </div>
                        </div>
                        <div className="absolute -top-2 left-8 w-4 h-4 bg-white/95 border-l border-t border-slate-200/60 transform rotate-45"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassCard>

          {/* Section 2: Capture Methods with Enhanced Features */}
          <GlassCard variant="accent" className="p-12 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 via-teal-400/5 to-cyan-400/5"></div>
            <div className="relative z-10">
              <div className="text-center mb-12">
                <h3 className="text-2xl font-black text-slate-800 mb-4">
                  Choose capture method
                </h3>
                <p className="text-slate-600 text-sm font-medium max-w-2xl mx-auto">Pick camera or gallery</p>
              </div>

              {/* Device Compatibility Status */}
              <div className="flex justify-center mb-10">
                <div className="flex items-center gap-6 bg-white/80 backdrop-blur-sm rounded-2xl px-8 py-4 border border-slate-200/60">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${cameraAvailable ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                    <span className="text-slate-700 font-medium">Camera: {cameraAvailable ? 'Available' : 'Unavailable'}</span>
                  </div>
                  <div className="w-px h-6 bg-slate-300"></div>
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span className="text-slate-700 font-medium">Gallery: Available</span>
                  </div>
                  <div className="w-px h-6 bg-slate-300"></div>
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${isHttps || window.location.hostname === 'localhost' ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`}></div>
                    <span className="text-slate-700 font-medium">HTTPS: {isHttps || window.location.hostname === 'localhost' ? 'Secure' : 'Insecure'}</span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-10 max-w-5xl mx-auto">
                <div className="group">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-emerald-500/40 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-4xl text-white">📷</span>
                    </div>
                    <ModernButton
                      onClick={openCamera}
                      variant="primary"
                      icon="📷"
                      className="w-full text-sm py-4 px-6 mb-4"
                      disabled={!cameraAvailable}
                    >
                      <div className="font-black">Live capture</div>
                    </ModernButton>
                    <div className="bg-emerald-50/80 rounded-2xl p-6 border border-emerald-200/60 backdrop-blur-sm">
                      <div className="text-emerald-800 font-semibold mb-3">✨ Best For:</div>
                      <ul className="text-emerald-700 text-sm space-y-2">
                        <li>• Fresh leaf samples</li>
                        <li>• Immediate analysis needs</li>
                        <li>• Controlled lighting conditions</li>
                        <li>• High-quality real-time capture</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="group">
                  <div className="text-center mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl flex items-center justify-center shadow-2xl shadow-blue-500/40 mx-auto mb-6 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-4xl text-white">🖼️</span>
                    </div>
                    <ModernButton
                      onClick={openGallery}
                      variant="secondary"
                      icon="🖼️"
                      className="w-full text-sm py-4 px-6 mb-4"
                    >
                      <div className="font-black">Gallery</div>
                    </ModernButton>
                    <div className="bg-blue-50/80 rounded-2xl p-6 border border-blue-200/60 backdrop-blur-sm">
                      <div className="text-blue-800 font-semibold mb-3">📁 Perfect For:</div>
                      <ul className="text-blue-700 text-sm space-y-2">
                        <li>• Previously captured samples</li>
                        <li>• Batch processing needs</li>
                        <li>• Historical comparisons</li>
                        <li>• Offline accessibility</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {!cameraAvailable && (
                <div className="bg-gradient-to-r from-amber-50/80 to-orange-50/80 border border-amber-200/60 rounded-3xl p-8 text-center mt-10 backdrop-blur-sm max-w-2xl mx-auto">
                  <div className="w-16 h-16 bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-amber-500/30">
                    <span className="text-3xl text-white">📱</span>
                  </div>
                  <h4 className="text-amber-800 text-2xl font-bold mb-4">Camera Access Limited</h4>
                  <p className="text-amber-700 text-lg leading-relaxed mb-6">
                    Your device camera is currently unavailable. This could be due to browser permissions, hardware limitations, or security settings.
                  </p>
                  <div className="bg-white/60 rounded-2xl p-6 border border-amber-200/40">
                    <div className="text-amber-800 font-semibold mb-3">🔧 Quick Fixes:</div>
                    <ul className="text-amber-700 text-sm space-y-2 text-left">
                      <li>• Check camera permissions in browser settings</li>
                      <li>• Ensure no other apps are using the camera</li>
                      <li>• Try refreshing the page</li>
                      <li>• Use gallery upload as an alternative</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </GlassCard>

          {/* Section 3: Pro Tips & Advanced Options */}
          <GlassCard className="p-12 bg-gradient-to-br from-violet-50/95 via-purple-50/90 to-indigo-50/95 border-violet-200/60">
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-gradient-to-r from-violet-500 to-purple-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-violet-500/40 mx-auto mb-6">
                <span className="text-4xl text-white">🚀</span>
              </div>
              <h3 className="text-4xl font-black text-slate-800 mb-4 bg-gradient-to-r from-violet-600 to-purple-600 bg-clip-text text-transparent">
                Pro Tips & Advanced Features
              </h3>
              <p className="text-slate-600 text-xl font-medium max-w-3xl mx-auto">Unlock the full potential of leaf analysis with expert techniques</p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <div className="bg-white/80 rounded-3xl p-8 border border-violet-200/60 backdrop-blur-sm hover:bg-white/90 hover:scale-105 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-to-r from-violet-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/30 mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">🔍</span>
                </div>
                <h4 className="font-bold text-slate-800 text-xl mb-4">Multiple Angles</h4>
                <p className="text-slate-600 leading-relaxed mb-4">Capture both sides of the leaf for comprehensive analysis. Different angles can reveal hidden symptoms and provide more accurate results.</p>
                <div className="text-violet-600 font-medium text-sm">Advanced Technique</div>
              </div>

              <div className="bg-white/80 rounded-3xl p-8 border border-violet-200/60 backdrop-blur-sm hover:bg-white/90 hover:scale-105 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">📊</span>
                </div>
                <h4 className="font-bold text-slate-800 text-xl mb-4">Batch Processing</h4>
                <p className="text-slate-600 leading-relaxed mb-4">Analyze multiple leaves at once for field studies or large-scale assessments. Perfect for agricultural research and monitoring.</p>
                <div className="text-emerald-600 font-medium text-sm">Research Feature</div>
              </div>

              <div className="bg-white/80 rounded-3xl p-8 border border-violet-200/60 backdrop-blur-sm hover:bg-white/90 hover:scale-105 transition-all duration-300 group">
                <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 group-hover:scale-110 transition-transform">
                  <span className="text-2xl text-white">💾</span>
                </div>
                <h4 className="font-bold text-slate-800 text-xl mb-4">Export & Share</h4>
                <p className="text-slate-600 leading-relaxed mb-4">Save detailed reports as PDF or JSON. Share findings with colleagues or integrate with other agricultural management systems.</p>
                <div className="text-blue-600 font-medium text-sm">Professional Tool</div>
              </div>
            </div>

            {/* Quick Stats/Progress Indicator */}
            <div className="mt-12 bg-white/60 rounded-3xl p-8 border border-slate-200/60 backdrop-blur-sm">
              <div className="text-center mb-6">
                <h4 className="text-2xl font-bold text-slate-800 mb-2">Your Analysis Readiness</h4>
                <p className="text-slate-600">How prepared are you for optimal leaf analysis?</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mx-auto mb-3">
                    <span className="text-2xl text-white">✅</span>
                  </div>
                  <div className="font-bold text-slate-800 text-lg">100%</div>
                  <div className="text-slate-600 text-sm">Guidelines Read</div>
                </div>
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${cameraAvailable ? 'from-emerald-400 to-teal-500' : 'from-amber-400 to-orange-500'} rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mx-auto mb-3`}>
                    <span className="text-2xl text-white">{cameraAvailable ? '📷' : '⚠️'}</span>
                  </div>
                  <div className="font-bold text-slate-800 text-lg">{cameraAvailable ? 'Ready' : 'Limited'}</div>
                  <div className="text-slate-600 text-sm">Camera Access</div>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 mx-auto mb-3">
                    <span className="text-2xl text-white">🖼️</span>
                  </div>
                  <div className="font-bold text-slate-800 text-lg">Ready</div>
                  <div className="text-slate-600 text-sm">Gallery Access</div>
                </div>
                <div className="text-center">
                  <div className={`w-16 h-16 bg-gradient-to-r ${isHttps || window.location.hostname === 'localhost' ? 'from-emerald-400 to-teal-500' : 'from-amber-400 to-orange-500'} rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/30 mx-auto mb-3`}>
                    <span className="text-2xl text-white">{isHttps || window.location.hostname === 'localhost' ? '🔒' : '🔓'}</span>
                  </div>
                  <div className="font-bold text-slate-800 text-lg">{isHttps || window.location.hostname === 'localhost' ? 'Secure' : 'Check'}</div>
                  <div className="text-slate-600 text-sm">Connection</div>
                </div>
              </div>
            </div>
          </GlassCard>
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

      {/* Enhanced Preview Section */}
      {preview && !cameraActive && (
        <GlassCard className="p-8 mb-8">
          <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center">Captured Image</h3>
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={preview}
                alt="Captured leaf"
                className={`max-w-full h-auto max-h-96 rounded-2xl shadow-2xl cursor-pointer transition-all duration-500 ${
                  imageZoomed ? 'scale-150 cursor-zoom-out' : 'hover:scale-105 cursor-zoom-in'
                }`}
                onClick={toggleZoom}
              />
              <div className="absolute bottom-4 left-4 bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                {imageZoomed ? 'Click to zoom out' : 'Click to zoom in'}
              </div>
            </div>
          </div>
          {!loading && (
            <div className="flex gap-4 justify-center mt-8">
              <ModernButton 
                onClick={resetCapture} 
                variant="ghost"
                icon="🔄"
              >
                Capture New Photo
              </ModernButton>
            </div>
          )}
        </GlassCard>
      )}

      {/* Enhanced Loading State */}
      {loading && (
        <GlassCard className="p-12 text-center">
          <div className="flex flex-col items-center space-y-8">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-emerald-200 rounded-full animate-pulse"></div>
              <div className="w-24 h-24 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 bg-emerald-500 rounded-full animate-ping"></div>
              </div>
            </div>
            <div>
              <h3 className="text-3xl font-bold text-slate-800 mb-3">Analyzing Image</h3>
              <p className="text-slate-600 text-lg mb-6">AI is processing your leaf sample...</p>
              <div className="w-80 mx-auto">
                <div className="w-full bg-slate-200/80 rounded-full h-3 backdrop-blur-sm">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-1000 ease-out shadow-lg shadow-blue-500/30"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-slate-500 mt-3 font-medium">{uploadProgress}% complete</p>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Enhanced Error State */}
      {error && (
        <GlassCard className="p-10 text-center max-w-md mx-auto">
          <div className="w-20 h-20 bg-gradient-to-r from-rose-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-rose-500/30">
            <span className="text-3xl text-white">⚠️</span>
          </div>
          <h3 className="text-2xl font-bold text-slate-800 mb-3">Camera Error</h3>
          <p className="text-slate-600 mb-8 leading-relaxed">{error}</p>
          <div className="flex gap-4 justify-center">
            <ModernButton onClick={openCamera} variant="primary" icon="🔄">
              Try Again
            </ModernButton>
            <ModernButton onClick={openGallery} variant="secondary" icon="🖼️">
              Use Gallery
            </ModernButton>
          </div>
        </GlassCard>
      )}

      {/* Enhanced Results Display with PDF Export Reference */}
      {result && !error && (
        <div ref={pdfExportRef} data-pdf-export className="space-y-8">
          {/* Overview Card */}
          <GlassCard className="p-10">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-10 gap-6">
              <div className="flex-1">
                <h2 className="text-4xl font-black text-slate-800 mb-3">Analysis Results</h2>
                <p className="text-slate-600 text-lg max-w-2xl">Comprehensive health assessment of your leaf sample with AI-powered insights</p>
              </div>
              <div className="flex flex-col gap-4">
                <div className="flex gap-4 flex-wrap">
                  <ModernButton
                    onClick={exportAsJSON}
                    variant="ghost"
                    icon="📄"
                    className="text-base py-3 px-6"
                  >
                    Export JSON
                  </ModernButton>
                  <ModernButton
                    onClick={exportAsPDF}
                    disabled={pdfGenerating}
                    loading={pdfGenerating}
                    variant="secondary"
                    icon="📊"
                    className="text-base py-3 px-6"
                  >
                    {pdfGenerating ? 'Generating...' : 'PDF Report'}
                  </ModernButton>
                </div>

                {/* Enhanced PDF Status Messages */}
                {pdfDownloadStatus && (
                  <div className={`p-4 rounded-xl border backdrop-blur-sm flex items-center gap-3 ${
                    pdfDownloadStatus === 'success'
                      ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50/80 border-rose-200 text-rose-800'
                  }`}>
                    {pdfDownloadStatus === 'success' ? (
                      <>
                        <span className="text-xl">✅</span>
                        <div>
                          <div className="font-semibold">PDF downloaded successfully!</div>
                          <div className="text-sm opacity-80">Check your downloads folder</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <span className="text-xl">❌</span>
                        <div>
                          <div className="font-semibold">PDF generation failed</div>
                          <div className="text-sm opacity-80">Try JSON export instead</div>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Enhanced Confidence Levels */}
            <div className="space-y-5 mb-10">
              {result.deficiency_prediction && (
                <ConfidenceRadio 
                  confidence={result.deficiency_prediction.confidence || 0}
                  label="Nutrient Deficiency Analysis"
                  color="blue"
                />
              )}
              {result.disease_prediction && (
                <ConfidenceRadio 
                  confidence={result.disease_prediction.confidence || 0}
                  label="Disease Detection Analysis"
                  color="rose"
                />
              )}
            </div>

            {/* Enhanced Results Overview */}
            <div className="grid md:grid-cols-2 gap-8 mb-10">
              {result.deficiency_prediction && (
                <div className="bg-gradient-to-br from-blue-50/80 to-indigo-50/80 p-7 rounded-2xl border border-blue-200/60 backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-xl text-white">🧪</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">Nutrient Analysis</h4>
                      <p className="text-slate-600 text-sm">Deficiency Detection</p>
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-xl p-5 mb-5 backdrop-blur-sm">
                    <div className="text-xl font-black text-slate-800 mb-3">{result.deficiency_prediction.class}</div>
                    {result.deficiency_prediction.explanation && (
                      <p className="text-slate-700 leading-relaxed">{result.deficiency_prediction.explanation}</p>
                    )}
                  </div>
                  {result.deficiency_prediction.recommendation && (
                    <div className="bg-blue-100/80 rounded-xl p-5 border border-blue-200/60 backdrop-blur-sm">
                      <div className="font-semibold text-blue-800 mb-2 text-lg">🎯 Recommendation</div>
                      <p className="text-blue-700 leading-relaxed">{result.deficiency_prediction.recommendation}</p>
                    </div>
                  )}
                </div>
              )}

              {result.disease_prediction && (
                <div className="bg-gradient-to-br from-rose-50/80 to-pink-50/80 p-7 rounded-2xl border border-rose-200/60 backdrop-blur-sm">
                  <div className="flex items-center gap-4 mb-5">
                    <div className="w-14 h-14 bg-gradient-to-r from-rose-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
                      <span className="text-xl text-white">🔬</span>
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-800 text-lg">Disease Detection</h4>
                      <p className="text-slate-600 text-sm">Pathogen Analysis</p>
                    </div>
                  </div>
                  <div className="bg-white/80 rounded-xl p-5 mb-5 backdrop-blur-sm">
                    <div className="text-xl font-black text-slate-800 mb-3">{result.disease_prediction.class}</div>
                    {result.disease_prediction.explanation && (
                      <p className="text-slate-700 leading-relaxed">{result.disease_prediction.explanation}</p>
                    )}
                  </div>
                  {result.disease_prediction.recommendation && (
                    <div className="bg-rose-100/80 rounded-xl p-5 border border-rose-200/60 backdrop-blur-sm">
                      <div className="font-semibold text-rose-800 mb-2 text-lg">🎯 Recommendation</div>
                      <p className="text-rose-700 leading-relaxed">{result.disease_prediction.recommendation}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </GlassCard>

          {/* Enhanced Detailed Recommendations */}
          {(result.recommendations?.disease_recommendations || result.recommendations?.deficiency_recommendations) && (
            <div className="space-y-8">
              {/* Disease Recommendations */}
              {result.recommendations.disease_recommendations && (
                <RecommendationSection title="Disease Management Plan" icon="🛡️" color="purple">
                  {/* Overview */}
                  {result.recommendations.disease_recommendations.overview && (
                    <div className="bg-white/80 rounded-xl p-6 mb-8 border border-purple-200/60 backdrop-blur-sm">
                      <h4 className="font-bold text-purple-800 mb-4 text-lg">📖 Overview</h4>
                      <p className="text-slate-700 leading-relaxed">{result.recommendations.disease_recommendations.overview}</p>
                    </div>
                  )}

                  {/* Symptoms */}
                  {result.recommendations.disease_recommendations.symptoms && (
                    <div className="mb-8">
                      <h4 className="font-bold text-slate-800 mb-5 text-xl flex items-center gap-3">
                        <span className="text-purple-500">📋</span>
                        Symptoms
                      </h4>
                      <div className="bg-white/80 rounded-xl p-6 border border-purple-100/60 backdrop-blur-sm">
                        {result.recommendations.disease_recommendations.symptoms.map((symptom, index) => (
                          <ListItem key={index} icon="🔍" color="purple">
                            {symptom}
                          </ListItem>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Integrated Management */}
                  {result.recommendations.disease_recommendations.integrated_management && (
                    <div className="space-y-8">
                      <h4 className="font-bold text-slate-800 mb-6 text-xl flex items-center gap-3">
                        <span className="text-purple-500">⚡</span>
                        Integrated Management Strategies
                      </h4>

                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Cultural Practices */}
                        {result.recommendations.disease_recommendations.integrated_management.cultural_practices && (
                          <div className="bg-white/80 rounded-xl p-6 border border-emerald-200/60 backdrop-blur-sm">
                            <h5 className="font-semibold text-emerald-800 mb-4 flex items-center gap-3 text-lg">
                              <span>🌱</span>
                              Cultural Practices
                            </h5>
                            {result.recommendations.disease_recommendations.integrated_management.cultural_practices.map((practice, index) => (
                              <ListItem key={index} color="emerald">{practice}</ListItem>
                            ))}
                          </div>
                        )}

                        {/* Chemical Control */}
                        {result.recommendations.disease_recommendations.integrated_management.chemical_control && (
                          <div className="bg-white/80 rounded-xl p-6 border border-orange-200/60 backdrop-blur-sm">
                            <h5 className="font-semibold text-orange-800 mb-4 flex items-center gap-3 text-lg">
                              <span>🧪</span>
                              Chemical Control
                            </h5>
                            {result.recommendations.disease_recommendations.integrated_management.chemical_control.map((control, index) => (
                              <ListItem key={index} color="amber">{control}</ListItem>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Biological Control */}
                      {result.recommendations.disease_recommendations.integrated_management.biological_control && (
                        <div className="bg-white/80 rounded-xl p-6 border border-blue-200/60 backdrop-blur-sm">
                          <h5 className="font-semibold text-blue-800 mb-4 flex items-center gap-3 text-lg">
                            <span>🐞</span>
                            Biological Control
                          </h5>
                          {result.recommendations.disease_recommendations.integrated_management.biological_control.map((control, index) => (
                            <ListItem key={index} color="blue">{control}</ListItem>
                          ))}
                        </div>
                      )}

                      {/* Monitoring */}
                      {result.recommendations.disease_recommendations.integrated_management.monitoring && (
                        <div className="bg-white/80 rounded-xl p-6 border border-indigo-200/60 backdrop-blur-sm">
                          <h5 className="font-semibold text-indigo-800 mb-4 flex items-center gap-3 text-lg">
                            <span>👀</span>
                            Monitoring
                          </h5>
                          {result.recommendations.disease_recommendations.integrated_management.monitoring.map((monitor, index) => (
                            <ListItem key={index} color="purple">{monitor}</ListItem>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Severity Specific Recommendations */}
                  {result.recommendations.disease_recommendations.severity_specific_recommendations && (
                    <div className="bg-white/80 rounded-xl p-7 border border-amber-200/60 backdrop-blur-sm mt-8">
                      <h4 className="font-bold text-amber-800 mb-6 text-xl flex items-center gap-3">
                        <span>⚡</span>
                        Severity-Specific Actions
                      </h4>
                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="bg-amber-50/80 rounded-xl p-4">
                          <div className="font-semibold text-slate-700 text-sm mb-2">Spray Frequency</div>
                          <div className="text-slate-800 font-bold text-lg">{result.recommendations.disease_recommendations.severity_specific_recommendations.spray_frequency}</div>
                        </div>
                        <div className="bg-amber-50/80 rounded-xl p-4">
                          <div className="font-semibold text-slate-700 text-sm mb-2">Intervention Level</div>
                          <div className="text-slate-800 font-bold text-lg">{result.recommendations.disease_recommendations.severity_specific_recommendations.intervention_level}</div>
                        </div>
                      </div>

                      {/* Immediate Actions */}
                      {result.recommendations.disease_recommendations.severity_specific_recommendations.immediate_actions && (
                        <div className="mb-6">
                          <h5 className="font-semibold text-rose-700 mb-4 text-lg flex items-center gap-3">
                            <span>🚨</span>
                            Immediate Actions
                          </h5>
                          <div className="bg-rose-50/80 rounded-xl p-5">
                            {result.recommendations.disease_recommendations.severity_specific_recommendations.immediate_actions.map((action, index) => (
                              <ListItem key={index} icon="⚠️" color="rose">
                                {action}
                              </ListItem>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Long-term Strategies */}
                      {result.recommendations.disease_recommendations.severity_specific_recommendations.long_term_strategies && (
                        <div>
                          <h5 className="font-semibold text-emerald-700 mb-4 text-lg flex items-center gap-3">
                            <span>📈</span>
                            Long-term Strategies
                          </h5>
                          <div className="bg-emerald-50/80 rounded-xl p-5">
                            {result.recommendations.disease_recommendations.severity_specific_recommendations.long_term_strategies.map((strategy, index) => (
                              <ListItem key={index} icon="📊" color="emerald">
                                {strategy}
                              </ListItem>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Economic Considerations */}
                  {result.recommendations.disease_recommendations.economic_considerations && (
                    <div className="bg-white/80 rounded-xl p-7 border border-emerald-200/60 backdrop-blur-sm mt-8">
                      <h4 className="font-bold text-emerald-800 mb-6 text-xl flex items-center gap-3">
                        <span>💰</span>
                        Economic Considerations
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mb-6">
                        <div className="text-center bg-emerald-50/80 rounded-xl p-5">
                          <div className="text-2xl font-black text-emerald-600">${result.recommendations.disease_recommendations.economic_considerations.management_cost_usd_per_ha}</div>
                          <div className="text-sm text-slate-600 font-medium mt-2">Cost/ha</div>
                        </div>
                        <div className="text-center bg-rose-50/80 rounded-xl p-5">
                          <div className="text-2xl font-black text-rose-600">{result.recommendations.disease_recommendations.economic_considerations.potential_yield_loss_percent}%</div>
                          <div className="text-sm text-slate-600 font-medium mt-2">Yield Loss</div>
                        </div>
                        <div className="text-center bg-blue-50/80 rounded-xl p-5">
                          <div className="text-2xl font-black text-blue-600">{result.recommendations.disease_recommendations.economic_considerations.return_on_investment}</div>
                          <div className="text-sm text-slate-600 font-medium mt-2">ROI</div>
                        </div>
                        <div className="text-center bg-amber-50/80 rounded-xl p-5">
                          <div className="text-2xl font-black text-amber-600">{result.recommendations.disease_recommendations.economic_considerations.economic_threshold}</div>
                          <div className="text-sm text-slate-600 font-medium mt-2">Threshold</div>
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
                    <div className="mb-8">
                      <h4 className="font-bold text-slate-800 mb-5 text-xl">Symptoms</h4>
                      <div className="bg-white/80 rounded-xl p-6 border border-emerald-100/60 backdrop-blur-sm">
                        {result.recommendations.deficiency_recommendations.symptoms.map((symptom, index) => (
                          <ListItem key={index} icon="🔍" color="emerald">
                            {symptom}
                          </ListItem>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Basic Recommendations */}
                  {result.recommendations.deficiency_recommendations.basic && (
                    <div className="mb-8">
                      <h4 className="font-bold text-slate-800 mb-5 text-xl">Basic Recommendations</h4>
                      <div className="bg-white/80 rounded-xl p-6 border border-blue-100/60 backdrop-blur-sm">
                        {result.recommendations.deficiency_recommendations.basic.map((rec, index) => (
                          <ListItem key={index} icon="💡" color="blue">
                            {rec}
                          </ListItem>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Advanced Management */}
                  {result.recommendations.deficiency_recommendations.management && (
                    <div>
                      <h4 className="font-bold text-slate-800 mb-5 text-xl">Advanced Management</h4>
                      <div className="bg-white/80 rounded-xl p-6 border border-purple-100/60 backdrop-blur-sm">
                        {result.recommendations.deficiency_recommendations.management.map((manage, index) => (
                          <ListItem key={index} icon="⚡" color="purple">
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

          {/* Enhanced Action Button */}
          <div className="text-center">
            <ModernButton
              onClick={resetCapture}
              variant="primary"
              icon="🔄"
              className="text-lg py-5 px-12"
            >
              Analyze Another Leaf
            </ModernButton>
          </div>
        </div>
      )}
    </div>
  );
});

CameraCapture.displayName = 'CameraCapture';

export default CameraCapture;