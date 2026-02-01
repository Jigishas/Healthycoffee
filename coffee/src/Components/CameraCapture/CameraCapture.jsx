import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Camera, Upload, X, RotateCw, Download, 
  Leaf, AlertCircle, CheckCircle, Loader2,
  Image as ImageIcon, ScanLine, FileText,
  ChevronRight, Shield, Zap, ThermometerSun
} from 'lucide-react';
import { 
  Box, Typography, Grid, Container, Chip,
  Alert, LinearProgress, IconButton
} from '@mui/material';
import { jsPDF } from 'jspdf';

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
  const [facingMode, setFacingMode] = useState('environment');
  const reportRef = useRef(null);
  const fileCaptureRef = useRef(null);

  // Step-by-step guide for proper leaf capture
  const captureSteps = [
    { icon: <Leaf />, text: "Select healthy leaf", tip: "Choose mature, representative leaf" },
    { icon: <Camera />, text: "Clear background", tip: "Use solid color or soil background" },
    { icon: <Shield />, text: "Good lighting", tip: "Natural daylight, no shadows" },
    { icon: <ThermometerSun />, text: "Close-up shot", tip: "Focus on entire leaf surface" }
  ];

  // Initialize camera and backend status checker
  const checkBackendStatus = useCallback(async () => {
    setBackendStatus('checking');
    try {
      const response = await fetch(`${uploadUrl}/health`, { timeout: 5000 });
      if (response.ok) {
        setBackendStatus('online');
      } else {
        setBackendStatus('offline');
      }
    } catch (err) {
      console.error('Backend health check failed', err);
      setBackendStatus('offline');
    }
  }, [uploadUrl]);

  useEffect(() => {
    checkBackendStatus();
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [checkBackendStatus, stream]);

  const startCamera = async (newFacingMode) => {
    setError(null);
    const fm = newFacingMode || facingMode;
    setFacingMode(fm);
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: fm,
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setMode('camera');
    } catch (err) {
      console.error('Camera start failed', err);
      setError('Camera access denied. Please check permissions.');
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

  const toggleFacingMode = async () => {
    const newFacing = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(newFacing);
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    // restart camera if currently showing
    if (mode === 'camera') {
      setTimeout(() => startCamera(newFacing), 200);
    }
  }; 

  const capturePhoto = () => {
    if (!videoRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Draw video frame
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Get image data URL
    const imageData = canvas.toDataURL('image/jpeg');
    setPreview(imageData);
    stopCamera();
    // Auto-analyze captured photo
    analyzeImage(imageData);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('Image too large (max 10MB)');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      setPreview(e.target.result);
      // Store file for upload
      fileInputRef.current.file = file;
      // Auto-analyze selected image
      analyzeImage(e.target.result);
    };
    reader.readAsDataURL(file);
    event.target.value = ''; // Reset input
  };

  const analyzeImage = async (imageDataParam) => {
    const imageToUse = imageDataParam || preview;
    if (!imageToUse) return;

    setMode('loading');
    setError(null);
    setUploadProgress(0);

    try {
      // Simulate upload progress
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
      const response = await fetch(imageToUse);
      const blob = await response.blob();

      // Create form data
      const formData = new FormData();
      formData.append('image', blob, 'leaf-image.jpg');

      // Upload to backend - use the correct /api/upload-image endpoint
      console.log('Uploading to:', `${uploadUrl}/api/upload-image`);
      const uploadResponse = await fetch(`${uploadUrl}/api/upload-image`, {
        method: 'POST',
        body: formData,
        headers: {
          'Accept': 'application/json'
        }
      });

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (!uploadResponse.ok) {
        const errorData = await uploadResponse.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(errorData.error || `HTTP ${uploadResponse.status}: Analysis failed`);
      }

      const data = await uploadResponse.json();
      console.log('Analysis results:', data);
      setResult(data);
      setMode('result');
      if (onResult) onResult(data);

    } catch (err) {
      console.error('Analysis error:', err);
      setError(`Failed to analyze image: ${err.message}`);
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

  const downloadPdf = async () => {
    if (!reportRef.current) return;
    try {
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let y = 40;

      // Header with formal styling
      pdf.setFillColor(34, 197, 94); // Emerald green
      pdf.rect(0, 0, pageWidth, 80, 'F');

      // Title
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(255, 255, 255);
      pdf.text('Coffee Leaf Analysis Report', 40, 35);

      // Subtitle
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Detailed AI-Powered Agricultural Assessment', 40, 55);

      // Report metadata
      pdf.setFontSize(10);
      pdf.setTextColor(255, 255, 255);
      const currentDate = new Date().toLocaleDateString();
      const currentTime = new Date().toLocaleTimeString();
      pdf.text(`Generated: ${currentDate} at ${currentTime}`, 40, 70);

      y = 100;

      // Add image
      if (preview) {
        try {
          if (y > pageHeight - 200) {
            pdf.addPage();
            y = 40;
          }
          const imgWidth = 180;
          const imgHeight = 135;
          pdf.addImage(preview, 'JPEG', 40, y, imgWidth, imgHeight);
          pdf.setFontSize(10);
          pdf.setFont('helvetica', 'italic');
          pdf.text('Analyzed Leaf Sample', 40, y + imgHeight + 10);
          y += imgHeight + 30;
        } catch (imgErr) {
          console.warn('Could not add image to PDF:', imgErr);
          y += 20;
        }
      }

      // DETAILED ANALYSIS SECTIONS
      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('DETAILED ANALYSIS & RECOMMENDATIONS', 40, y);
      y += 25;

      // Analysis Overview
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Analysis Overview', 40, y);
      y += 20;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');

      // Disease Analysis Details
      if (result.disease_prediction) {
        pdf.setFont('helvetica', 'bold');
        pdf.text('Disease Analysis:', 40, y);
        pdf.setFont('helvetica', 'normal');
        y += 15;

        if (result.disease_prediction.class) {
          pdf.text(`Class: ${result.disease_prediction.class}`, 50, y);
          y += 15;
        }

        if (result.disease_prediction.class_index) {
          pdf.text(`Class Index: ${result.disease_prediction.class_index}`, 50, y);
          y += 15;
        }

        if (result.disease_prediction.confidence) {
          pdf.text(`Confidence: ${result.disease_prediction.confidence}`, 50, y);
          y += 15;
        }

        if (result.disease_prediction.description) {
          const diseaseDescLines = pdf.splitTextToSize(`Description: ${result.disease_prediction.description}`, pageWidth - 80);
          pdf.text(diseaseDescLines, 50, y);
          y += diseaseDescLines.length * 12 + 10;
        }

        if (result.disease_prediction.explanation && result.disease_prediction.explanation !== "No explanation available for this condition.") {
          const diseaseExpLines = pdf.splitTextToSize(`Explanation: ${result.disease_prediction.explanation}`, pageWidth - 80);
          pdf.text(diseaseExpLines, 50, y);
          y += diseaseExpLines.length * 12 + 10;
        }

        if (result.disease_prediction.recommendation) {
          pdf.text(`Initial Recommendation: ${result.disease_prediction.recommendation}`, 50, y);
          y += 15;
        }

        pdf.text(`Inference Time: ${result.disease_prediction.inference_time}s`, 50, y);
        y += 20;
      }

      // Nutrient Analysis Details
      if (result.deficiency_prediction) {
        if (y > pageHeight - 100) {
          pdf.addPage();
          y = 40;
        }

        pdf.setFont('helvetica', 'bold');
        pdf.text('Nutrient Analysis:', 40, y);
        pdf.setFont('helvetica', 'normal');
        y += 15;

        if (result.deficiency_prediction.class) {
          pdf.text(`Class: ${result.deficiency_prediction.class}`, 50, y);
          y += 15;
        }

        if (result.deficiency_prediction.class_index) {
          pdf.text(`Class Index: ${result.deficiency_prediction.class_index}`, 50, y);
          y += 15;
        }

        if (result.deficiency_prediction.confidence) {
          pdf.text(`Confidence: ${result.deficiency_prediction.confidence}`, 50, y);
          y += 15;
        }

        if (result.deficiency_prediction.description) {
          const nutrientDescLines = pdf.splitTextToSize(`Description: ${result.deficiency_prediction.description}`, pageWidth - 80);
          pdf.text(nutrientDescLines, 50, y);
          y += nutrientDescLines.length * 12 + 10;
        }

        if (result.deficiency_prediction.explanation && result.deficiency_prediction.explanation !== "No explanation available for this condition.") {
          const nutrientExpLines = pdf.splitTextToSize(`Explanation: ${result.deficiency_prediction.explanation}`, pageWidth - 80);
          pdf.text(nutrientExpLines, 50, y);
          y += nutrientExpLines.length * 12 + 10;
        }

        if (result.deficiency_prediction.recommendation) {
          pdf.text(`Initial Recommendation: ${result.deficiency_prediction.recommendation}`, 50, y);
          y += 15;
        }

        pdf.text(`Inference Time: ${result.deficiency_prediction.inference_time}s`, 50, y);
        y += 25;
      }

      // Technical Analysis
      if (y > pageHeight - 60) {
        pdf.addPage();
        y = 40;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Technical Analysis', 40, y);
      y += 20;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'normal');
      pdf.text(`Model Version: ${result.model_version}`, 40, y);
      y += 15;
      pdf.text(`Total Processing Time: ${result.processing_time}s`, 40, y);
      y += 15;
      pdf.text(`Analysis Status: ${result.status}`, 40, y);
      y += 25;

      // Disease Management Recommendations
      if (result.disease_recommendations) {
        if (y > pageHeight - 100) {
          pdf.addPage();
          y = 40;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('1. DISEASE MANAGEMENT RECOMMENDATIONS', 40, y);
        y += 20;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        if (result.disease_recommendations.disease_name) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Disease Name:', 40, y);
          pdf.setFont('helvetica', 'normal');
          y += 15;
          pdf.text(result.disease_recommendations.disease_name, 50, y);
          y += 15;
        }

        if (result.disease_recommendations.current_severity) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Current Severity:', 40, y);
          pdf.setFont('helvetica', 'normal');
          y += 15;
          pdf.text(result.disease_recommendations.current_severity, 50, y);
          y += 15;
        }

        if (result.disease_recommendations.overview) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Overview:', 40, y);
          pdf.setFont('helvetica', 'normal');
          y += 15;
          const overviewLines = pdf.splitTextToSize(result.disease_recommendations.overview, pageWidth - 80);
          pdf.text(overviewLines, 50, y);
          y += overviewLines.length * 12 + 10;
        }

        if (result.disease_recommendations.symptoms && result.disease_recommendations.symptoms.length > 0) {
          if (y > pageHeight - 100) {
            pdf.addPage();
            y = 40;
          }
          pdf.setFont('helvetica', 'bold');
          pdf.text('Symptoms:', 40, y);
          pdf.setFont('helvetica', 'normal');
          y += 15;
          result.disease_recommendations.symptoms.forEach((symptom) => {
            if (y > pageHeight - 40) {
              pdf.addPage();
              y = 40;
            }
            pdf.text(`• ${symptom}`, 50, y);
            y += 12;
          });
          y += 10;
        }

        if (result.disease_recommendations.integrated_management) {
          if (y > pageHeight - 100) {
            pdf.addPage();
            y = 40;
          }
          pdf.setFont('helvetica', 'bold');
          pdf.text('Integrated Management:', 40, y);
          pdf.setFont('helvetica', 'normal');
          y += 15;

          const mgmt = result.disease_recommendations.integrated_management;
          if (mgmt.cultural_practices) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('Cultural Practices:', 50, y);
            pdf.setFont('helvetica', 'normal');
            y += 12;
            mgmt.cultural_practices.slice(0, 3).forEach((practice) => {
              if (y > pageHeight - 40) {
                pdf.addPage();
                y = 40;
              }
              pdf.text(`• ${practice}`, 60, y);
              y += 10;
            });
          }

          if (mgmt.chemical_control) {
            if (y > pageHeight - 60) {
              pdf.addPage();
              y = 40;
            }
            pdf.setFont('helvetica', 'bold');
            pdf.text('Chemical Control:', 50, y);
            pdf.setFont('helvetica', 'normal');
            y += 12;
            mgmt.chemical_control.slice(0, 3).forEach((control) => {
              if (y > pageHeight - 40) {
                pdf.addPage();
                y = 40;
              }
              pdf.text(`• ${control}`, 60, y);
              y += 10;
            });
          }

          if (mgmt.biological_control) {
            if (y > pageHeight - 60) {
              pdf.addPage();
              y = 40;
            }
            pdf.setFont('helvetica', 'bold');
            pdf.text('Biological Control:', 50, y);
            pdf.setFont('helvetica', 'normal');
            y += 12;
            mgmt.biological_control.slice(0, 3).forEach((control) => {
              if (y > pageHeight - 40) {
                pdf.addPage();
                y = 40;
              }
              pdf.text(`• ${control}`, 60, y);
              y += 10;
            });
          }
        }

        if (result.disease_recommendations.severity_specific_recommendations) {
          if (y > pageHeight - 100) {
            pdf.addPage();
            y = 40;
          }
          pdf.setFont('helvetica', 'bold');
          pdf.text('Severity-Specific Recommendations:', 40, y);
          pdf.setFont('helvetica', 'normal');
          y += 15;
          const severity = result.disease_recommendations.severity_specific_recommendations;

          if (severity.immediate_actions && severity.immediate_actions.length > 0) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('Immediate Actions:', 50, y);
            pdf.setFont('helvetica', 'normal');
            y += 12;
            severity.immediate_actions.forEach((action) => {
              if (y > pageHeight - 40) {
                pdf.addPage();
                y = 40;
              }
              pdf.text(`• ${action}`, 60, y);
              y += 10;
            });
            y += 5;
          }

          if (severity.long_term_strategies && severity.long_term_strategies.length > 0) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('Long Term Strategies:', 50, y);
            pdf.setFont('helvetica', 'normal');
            y += 12;
            severity.long_term_strategies.forEach((strategy) => {
              if (y > pageHeight - 40) {
                pdf.addPage();
                y = 40;
              }
              pdf.text(`• ${strategy}`, 60, y);
              y += 10;
            });
            y += 5;
          }

          if (severity.spray_frequency) {
            pdf.text(`Spray Frequency: ${severity.spray_frequency}`, 50, y);
            y += 12;
          }
          if (severity.intervention_level) {
            pdf.text(`Intervention Level: ${severity.intervention_level}`, 50, y);
            y += 20;
          }
        }

        if (result.disease_recommendations.emergency_measures) {
          if (y > pageHeight - 100) {
            pdf.addPage();
            y = 40;
          }
          pdf.setFont('helvetica', 'bold');
          pdf.text('Emergency Measures:', 40, y);
          pdf.setFont('helvetica', 'normal');
          y += 15;

          const emergency = result.disease_recommendations.emergency_measures;
          if (emergency.high_infection && emergency.high_infection.length > 0) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('High Infection:', 50, y);
            pdf.setFont('helvetica', 'normal');
            y += 12;
            emergency.high_infection.forEach((measure) => {
              if (y > pageHeight - 40) {
                pdf.addPage();
                y = 40;
              }
              pdf.text(`• ${measure}`, 60, y);
              y += 10;
            });
            y += 5;
          }

          if (emergency.preventive_protocol && emergency.preventive_protocol.length > 0) {
            pdf.setFont('helvetica', 'bold');
            pdf.text('Preventive Protocol:', 50, y);
            pdf.setFont('helvetica', 'normal');
            y += 12;
            emergency.preventive_protocol.forEach((protocol) => {
              if (y > pageHeight - 40) {
                pdf.addPage();
                y = 40;
              }
              pdf.text(`• ${protocol}`, 60, y);
              y += 10;
            });
            y += 10;
          }
        }

        if (result.disease_recommendations.monitoring_schedule) {
          if (y > pageHeight - 80) {
            pdf.addPage();
            y = 40;
          }
          pdf.setFont('helvetica', 'bold');
          pdf.text('Monitoring Schedule:', 40, y);
          pdf.setFont('helvetica', 'normal');
          y += 15;

          const monitoring = result.disease_recommendations.monitoring_schedule;
          if (monitoring.inspection_frequency) {
            pdf.text(`Inspection Frequency: ${monitoring.inspection_frequency}`, 50, y);
            y += 12;
          }
          if (monitoring.weather_monitoring) {
            pdf.text(`Weather Monitoring: ${monitoring.weather_monitoring}`, 50, y);
            y += 20;
          }
        }

        if (result.disease_recommendations.resistant_varieties && result.disease_recommendations.resistant_varieties.length > 0) {
          if (y > pageHeight - 100) {
            pdf.addPage();
            y = 40;
          }
          pdf.setFont('helvetica', 'bold');
          pdf.text('Resistant Varieties:', 40, y);
          pdf.setFont('helvetica', 'normal');
          y += 15;

          result.disease_recommendations.resistant_varieties.forEach((variety) => {
            if (y > pageHeight - 60) {
              pdf.addPage();
              y = 40;
            }
            pdf.setFont('helvetica', 'bold');
            pdf.text(`${variety.name}:`, 50, y);
            pdf.setFont('helvetica', 'normal');
            y += 12;
            pdf.text(`Resistance Level: ${variety.resistance_level}`, 60, y);
            y += 10;
            pdf.text(`Adaptation: ${variety.adaptation}`, 60, y);
            y += 10;
            if (variety.characteristics) {
              pdf.text(`Characteristics: ${variety.characteristics}`, 60, y);
              y += 10;
            }
            y += 5;
          });
        }

        if (result.disease_recommendations.coffee_specific_recommendations) {
          if (y > pageHeight - 100) {
            pdf.addPage();
            y = 40;
          }
          pdf.setFont('helvetica', 'bold');
          pdf.text('Coffee-Specific Recommendations:', 40, y);
          pdf.setFont('helvetica', 'normal');
          y += 15;

          const coffeeRecs = result.disease_recommendations.coffee_specific_recommendations;
          if (coffeeRecs.harvest_timing) {
            pdf.text(`Harvest Timing: ${coffeeRecs.harvest_timing}`, 50, y);
            y += 12;
          }
          if (coffeeRecs.shade_management) {
            pdf.text(`Shade Management: ${coffeeRecs.shade_management}`, 50, y);
            y += 12;
          }
                          if (coffeeRecs.compost_application) {
            pdf.text(`Compost Application: ${coffeeRecs.compost_application}`, 50, y);
            y += 12;
          }
          if (coffeeRecs.economic_approach) {
            pdf.text(`Economic Approach: ${coffeeRecs.economic_approach}`, 50, y);
            y += 12;
          }
          if (coffeeRecs.intervention_level) {
            pdf.text(`Intervention Level: ${coffeeRecs.intervention_level}`, 50, y);
            y += 12;
          }
          if (coffeeRecs.wound_protection) {
            pdf.text(`Wound Protection: ${coffeeRecs.wound_protection}`, 50, y);
            y += 12;
          }
          if (coffeeRecs.storage_practices) {
            pdf.text(`Storage Practices: ${coffeeRecs.storage_practices}`, 50, y);
            y += 12;
          }
          if (coffeeRecs.processing_impact) {
            pdf.text(`Processing Impact: ${coffeeRecs.processing_impact}`, 50, y);
            y += 20;
          }
        }
      }

      // 2. Nutrient Deficiency Management
      if (result.deficiency_recommendations) {
        if (y > pageHeight - 100) {
          pdf.addPage();
          y = 40;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('2. NUTRIENT DEFICIENCY MANAGEMENT', 40, y);
        y += 20;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        if (result.deficiency_recommendations.basic && result.deficiency_recommendations.basic.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Basic Management:', 40, y);
          pdf.setFont('helvetica', 'normal');
          y += 15;
          result.deficiency_recommendations.basic.forEach((rec) => {
            if (y > pageHeight - 40) {
              pdf.addPage();
              y = 40;
            }
            pdf.text(`• ${rec}`, 50, y);
            y += 12;
          });
          y += 10;
        }

        if (result.deficiency_recommendations.symptoms && result.deficiency_recommendations.symptoms.length > 0) {
          if (y > pageHeight - 80) {
            pdf.addPage();
            y = 40;
          }
          pdf.setFont('helvetica', 'bold');
          pdf.text('Symptoms:', 40, y);
          pdf.setFont('helvetica', 'normal');
          y += 15;
          result.deficiency_recommendations.symptoms.forEach((symptom) => {
            if (y > pageHeight - 40) {
              pdf.addPage();
              y = 40;
            }
            pdf.text(`• ${symptom}`, 50, y);
            y += 12;
          });
          y += 10;
        }

        if (result.deficiency_recommendations.management && result.deficiency_recommendations.management.length > 0) {
          if (y > pageHeight - 80) {
            pdf.addPage();
            y = 40;
          }
          pdf.setFont('helvetica', 'bold');
          pdf.text('Management Strategies:', 40, y);
          pdf.setFont('helvetica', 'normal');
          y += 15;
          result.deficiency_recommendations.management.forEach((strategy) => {
            if (y > pageHeight - 40) {
              pdf.addPage();
              y = 40;
            }
            pdf.text(`• ${strategy}`, 50, y);
            y += 12;
          });
          y += 10;
        }
      }

      // Products and Varieties
      if ((result.products && result.products.length > 0) || (result.varieties && result.varieties.length > 0)) {
        if (y > pageHeight - 100) {
          pdf.addPage();
          y = 40;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Recommended Products & Varieties', 40, y);
        y += 20;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        if (result.products && result.products.length > 0) {
          pdf.text('Recommended Products:', 40, y);
          y += 15;
          result.products.forEach((product) => {
            if (y > pageHeight - 40) {
              pdf.addPage();
              y = 40;
            }
            pdf.text(`• ${product}`, 50, y);
            y += 12;
          });
          y += 10;
        }

        if (result.varieties && result.varieties.length > 0) {
          if (y > pageHeight - 80) {
            pdf.addPage();
            y = 40;
          }
          pdf.text('Resistant Varieties:', 40, y);
          y += 15;
          result.varieties.forEach((variety) => {
            if (y > pageHeight - 40) {
              pdf.addPage();
              y = 40;
            }
            const varietyLines = pdf.splitTextToSize(`• ${variety}`, pageWidth - 90);
            pdf.text(varietyLines, 50, y);
            y += varietyLines.length * 10 + 5;
          });
        }
      }

      // Coffee-Specific Practices
      if (result.disease_recommendations?.coffee_specific_recommendations?.coffee_specific_practices) {
        if (y > pageHeight - 100) {
          pdf.addPage();
          y = 40;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Coffee Cultivation Best Practices', 40, y);
        y += 20;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        result.disease_recommendations.coffee_specific_recommendations.coffee_specific_practices.forEach((practice) => {
          if (y > pageHeight - 40) {
            pdf.addPage();
            y = 40;
          }
          const practiceLines = pdf.splitTextToSize(`• ${practice}`, pageWidth - 90);
          pdf.text(practiceLines, 50, y);
          y += practiceLines.length * 10 + 5;
        });
      }

      // Quality Impact
      if (result.disease_recommendations?.coffee_specific_recommendations?.quality_impact) {
        if (y > pageHeight - 80) {
          pdf.addPage();
          y = 40;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Quality & Market Impact', 40, y);
        y += 20;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        const qualityImpact = result.disease_recommendations.coffee_specific_recommendations.quality_impact;
        if (qualityImpact.cup_quality) {
          pdf.text(`Cup Quality Impact: ${qualityImpact.cup_quality}`, 40, y);
          y += 15;
        }
        if (qualityImpact.market_price) {
          pdf.text(`Market Price Impact: ${qualityImpact.market_price}`, 40, y);
          y += 15;
        }
        if (qualityImpact.certification) {
          pdf.text(`Certification Impact: ${qualityImpact.certification}`, 40, y);
          y += 15;
        }
      }

      // Economic Considerations
      if (result.disease_recommendations?.economic_considerations) {
        if (y > pageHeight - 100) {
          pdf.addPage();
          y = 40;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Economic Analysis', 40, y);
        y += 20;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        const economic = result.disease_recommendations.economic_considerations;
        if (economic.management_cost_usd_per_ha) {
          pdf.text(`Management Cost: $${economic.management_cost_usd_per_ha}/ha`, 40, y);
          y += 15;
        }
        if (economic.potential_yield_loss_percent) {
          pdf.text(`Potential Yield Loss: ${economic.potential_yield_loss_percent}%`, 40, y);
          y += 15;
        }
        if (economic.return_on_investment) {
          pdf.text(`Return on Investment: ${economic.return_on_investment}`, 40, y);
          y += 15;
        }
        if (economic.economic_threshold) {
          pdf.text(`Economic Threshold: ${economic.economic_threshold}`, 40, y);
          y += 15;
        }
        if (economic.cost_effective_strategies && economic.cost_effective_strategies.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('Cost-Effective Strategies:', 40, y);
          pdf.setFont('helvetica', 'normal');
          y += 12;
          economic.cost_effective_strategies.forEach((strategy) => {
            if (y > pageHeight - 40) {
              pdf.addPage();
              y = 40;
            }
            pdf.text(`• ${strategy}`, 50, y);
            y += 10;
          });
          y += 5;
        }
      }

      // Farm-Specific Adaptations
      if (result.disease_recommendations?.farm_specific_adaptations) {
        if (y > pageHeight - 80) {
          pdf.addPage();
          y = 40;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Farm-Specific Adaptations', 40, y);
        y += 20;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        const farmAdapt = result.disease_recommendations.farm_specific_adaptations;
        if (farmAdapt.general_recommendations && farmAdapt.general_recommendations.length > 0) {
          pdf.setFont('helvetica', 'bold');
          pdf.text('General Recommendations:', 40, y);
          pdf.setFont('helvetica', 'normal');
          y += 12;
          farmAdapt.general_recommendations.forEach((rec) => {
            if (y > pageHeight - 40) {
              pdf.addPage();
              y = 40;
            }
            pdf.text(`• ${rec}`, 50, y);
            y += 10;
          });
          y += 10;
        }
      }

      // Quality Impact
      if (result.disease_recommendations?.coffee_specific_recommendations?.quality_impact) {
        if (y > pageHeight - 80) {
          pdf.addPage();
          y = 40;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Quality & Market Impact', 40, y);
        y += 20;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        const qualityImpact = result.disease_recommendations.coffee_specific_recommendations.quality_impact;
        if (qualityImpact.cup_quality) {
          pdf.text(`Cup Quality Impact: ${qualityImpact.cup_quality}`, 40, y);
          y += 15;
        }
        if (qualityImpact.market_price) {
          pdf.text(`Market Price Impact: ${qualityImpact.market_price}`, 40, y);
          y += 15;
        }
        if (qualityImpact.certification) {
          pdf.text(`Certification Impact: ${qualityImpact.certification}`, 40, y);
          y += 15;
        }
      }

      // Sustainability Considerations
      if (result.disease_recommendations?.coffee_specific_recommendations?.sustainability_considerations) {
        if (y > pageHeight - 100) {
          pdf.addPage();
          y = 40;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Sustainability Considerations', 40, y);
        y += 20;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        result.disease_recommendations.coffee_specific_recommendations.sustainability_considerations.forEach((consideration) => {
          if (y > pageHeight - 40) {
            pdf.addPage();
            y = 40;
          }
          const considerationLines = pdf.splitTextToSize(`• ${consideration}`, pageWidth - 90);
          pdf.text(considerationLines, 50, y);
          y += considerationLines.length * 10 + 5;
        });
      }

      // Coffee-Specific Practices
      if (result.disease_recommendations?.coffee_specific_recommendations?.coffee_specific_practices) {
        if (y > pageHeight - 100) {
          pdf.addPage();
          y = 40;
        }

        pdf.setFontSize(14);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Coffee Cultivation Best Practices', 40, y);
        y += 20;

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'normal');

        result.disease_recommendations.coffee_specific_recommendations.coffee_specific_practices.forEach((practice) => {
          if (y > pageHeight - 40) {
            pdf.addPage();
            y = 40;
          }
          const practiceLines = pdf.splitTextToSize(`• ${practice}`, pageWidth - 90);
          pdf.text(practiceLines, 50, y);
          y += practiceLines.length * 10 + 5;
        });
      }

      pdf.save(`coffee-leaf-analysis-${Date.now()}.pdf`);
    } catch (err) {
      console.error('PDF generation failed', err);
      setError('Failed to generate PDF report');
    }
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4, px: { xs: 2, sm: 3 } }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="p-3 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl shadow-lg">
            <ScanLine className="w-8 h-8 text-white" />
          </div>
          <Typography 
            variant="h4" 
            className="font-black"
            sx={{ color: 'grey.900' }}
          >
            AI Leaf Analysis
          </Typography>
        </div>
        
        <Typography variant="body1" className="text-grey-600 max-w-2xl mx-auto">
          Capture or upload leaf images for instant disease and nutrient analysis
        </Typography>
      </motion.div>

      {/* Main Content Grid */}
      <Grid container spacing={4}>
        {/* Left Column - Capture Guide */}
        <Grid item xs={12} md={4}>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <Box className="sticky top-4">
              {/* Capture Guide */}
              <Box className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-3xl p-6 border border-emerald-200 mb-6">
                <Typography variant="h6" className="font-bold text-emerald-800 mb-4 flex items-center gap-2">
                  <Leaf className="w-5 h-5" />
                  Capture Tips
                </Typography>
                <div className="space-y-4">
                  {captureSteps.map((step, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start gap-3 p-3 bg-white/80 rounded-xl"
                    >
                      <div className="p-2 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-lg">
                        {step.icon}
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
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          // Try to start camera first, fallback to file input
                          if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                            startCamera();
                          } else {
                            fileInputRef.current?.click();
                          }
                        }}
                        className="w-full group"
                      >
                        <Box className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-2 border-emerald-200 rounded-2xl p-8 text-center hover:border-emerald-300 hover:shadow-lg transition-all duration-300">
                          <div className="relative inline-flex mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-emerald-400 to-emerald-500 rounded-full blur-lg opacity-30 group-hover:opacity-50" />
                            <div className="relative p-4 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full">
                              <Camera className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <Typography variant="h6" className="font-bold text-emerald-800 mb-2">
                            Use Camera
                          </Typography>
                          <Typography variant="body2" className="text-grey-600">
                            Real-time capture or select from gallery
                          </Typography>
                        </Box>
                      </motion.button>
                    </Grid>

                    {/* Upload Option */}
                    <Grid item xs={12} md={6}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => fileInputRef.current?.click()}
                        className="w-full group"
                      >
                        <Box className="bg-gradient-to-br from-blue-50 to-blue-100 border-2 border-blue-200 rounded-2xl p-8 text-center hover:border-blue-300 hover:shadow-lg transition-all duration-300">
                          <div className="relative inline-flex mb-4">
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-500 rounded-full blur-lg opacity-30 group-hover:opacity-50" />
                            <div className="relative p-4 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full">
                              <Upload className="w-8 h-8 text-white" />
                            </div>
                          </div>
                          <Typography variant="h6" className="font-bold text-blue-800 mb-2">
                            Upload Image
                          </Typography>
                          <Typography variant="body2" className="text-grey-600">
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
                    className="hidden"
                  />

                  {/* Device camera input (mobile) */}
                  <input
                    type="file"
                    ref={fileCaptureRef}
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
                <Box className="bg-black rounded-3xl overflow-hidden shadow-2xl">
                  {/* Camera Feed */}
                  <div className="relative aspect-video">
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
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-64 h-64 border-2 border-white/50 rounded-2xl" />
                      </div>
                      
                      {/* Controls */}
                      <div className="absolute bottom-8 left-0 right-0 flex justify-center items-center gap-6">
                        <IconButton
                          onClick={stopCamera}
                          className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                        >
                          <X className="w-6 h-6" />
                        </IconButton>
                        
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={capturePhoto}
                          className="relative"
                        >
                          <div className="w-20 h-20 bg-white rounded-full p-1">
                            <div className="w-full h-full bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-full" />
                          </div>
                        </motion.button>
                        
                        <IconButton
                          onClick={toggleFacingMode}
                          className="bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm"
                        >
                          <RotateCw className="w-6 h-6" />
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
                <Box className="bg-white rounded-3xl shadow-xl border border-grey-200 overflow-hidden">
                  {/* Preview Image */}
                  <div className="relative">
                    <img
                      src={preview}
                      alt="Leaf preview"
                      className="w-full h-96 object-contain bg-grey-50"
                    />
                    <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      Preview
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <Box className="p-6">
                    <Grid container spacing={3}>
                      <Grid item xs={12} md={6}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => analyzeImage()}
                          disabled={backendStatus !== 'online'}
                          className={`w-full flex items-center justify-center gap-3 px-6 py-4 rounded-xl font-semibold ${
                            backendStatus === 'online'
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-lg'
                              : 'bg-grey-100 text-grey-400 cursor-not-allowed'
                          }`}
                        >
                          <Zap className="w-5 h-5" />
                          {backendStatus === 'online' ? 'Analyze Now' : 'Service Offline'}
                        </motion.button>
                      </Grid>
                      <Grid item xs={12} md={6}>
                        <motion.button
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={resetCapture}
                          className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-grey-300 text-grey-700 font-semibold rounded-xl hover:bg-grey-50"
                        >
                          <X className="w-5 h-5" />
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
                <Box className="bg-white rounded-3xl shadow-xl border border-grey-200 p-8 text-center">
                  {/* Animated Loader */}
                  <div className="relative w-24 h-24 mx-auto mb-6">
                    <div className="absolute inset-0 border-4 border-emerald-200 rounded-full animate-pulse" />
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                      className="absolute inset-4 border-4 border-emerald-500 border-t-transparent rounded-full"
                    />
                    <Leaf className="w-12 h-12 text-emerald-500 absolute inset-0 m-auto" />
                  </div>

                  <Typography variant="h5" className="font-bold text-grey-900 mb-2">
                    Analyzing Leaf
                  </Typography>
                  
                  <Typography variant="body2" className="text-grey-600 mb-6">
                    AI is examining disease patterns and nutrient levels
                  </Typography>

                  {/* Progress Bar */}
                  <Box className="max-w-md mx-auto">
                    <LinearProgress 
                      variant="determinate" 
                      value={uploadProgress}
                      sx={{ 
                        height: 8,
                        borderRadius: 4,
                        backgroundColor: 'rgb(209, 213, 219)',
                        '& .MuiLinearProgress-bar': {
                          backgroundColor: '#10b981',
                          borderRadius: 4
                        }
                      }}
                    />
                    <Typography variant="caption" className="text-grey-500 mt-2 block">
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
                <Box className="space-y-6" ref={reportRef}>
                  {/* Results Summary */}
                  <Box className="bg-white rounded-3xl shadow-xl border border-grey-200 p-6">
                    <div className="flex items-center justify-between mb-6">
                      <Typography variant="h5" className="font-bold text-grey-900">
                        Analysis Results
                      </Typography>
                      <Chip 
                        label="AI Powered"
                        className="bg-gradient-to-r from-emerald-100 to-emerald-200 text-emerald-800"
                        icon={<Zap className="w-4 h-4" />}
                      />
                    </div>

                    <div className="flex gap-4 items-center mb-4">
                      <img src={preview} alt="Sample" className="w-40 h-40 object-cover rounded-lg border" />
                      <div>
                        <Typography variant="subtitle1" className="text-grey-600">Captured Sample</Typography>
                        <Typography variant="caption" className="text-grey-500">This sample was analyzed</Typography>
                      </div>
                    </div>

                    <Grid container spacing={4}>
                      {/* Disease Detection */}
                      {result.disease_prediction && (
                        <Grid item xs={12} md={6}>
                          <Box className={`p-4 rounded-2xl border ${
                            result.disease_prediction.class === 'Healthy'
                              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
                              : 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200'
                          }`}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`p-2 rounded-lg ${
                                result.disease_prediction.class === 'Healthy'
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : 'bg-amber-100 text-amber-600'
                              }`}>
                                <Shield className="w-5 h-5" />
                              </div>
                              <Typography variant="h6" className="font-bold">
                                Disease Status
                              </Typography>
                            </div>
                            <Typography variant="h4" className={`font-black mb-2 ${
                              result.disease_prediction.class === 'Healthy'
                                ? 'text-emerald-700'
                                : 'text-amber-700'
                            }`}>
                              {result.disease_prediction.class}
                            </Typography>
                            <div className="flex items-center justify-between mb-2">
                              <Typography variant="body2" className="text-grey-600">
                                Confidence
                              </Typography>
                              <Typography variant="body2" className="font-semibold text-grey-800">
                                {Math.round(result.disease_prediction.confidence * 100)}%
                              </Typography>
                            </div>

                            {/* Show detailed disease prediction info */}
                            <Box className="mt-3 space-y-2">
                              {result.disease_prediction.class && (
                                <Box>
                                  <Typography variant="body2" className="font-semibold text-grey-700">Class:</Typography>
                                  <Typography variant="caption" className="text-grey-600">{result.disease_prediction.class}</Typography>
                                </Box>
                              )}

                              {result.disease_prediction.class_index && (
                                <Box>
                                  <Typography variant="body2" className="font-semibold text-grey-700">Class Index:</Typography>
                                  <Typography variant="caption" className="text-grey-600">{result.disease_prediction.class_index}</Typography>
                                </Box>
                              )}

                              {result.disease_prediction.confidence && (
                                <Box>
                                  <Typography variant="body2" className="font-semibold text-grey-700">Confidence:</Typography>
                                  <Typography variant="caption" className="text-grey-600">{result.disease_prediction.confidence}</Typography>
                                </Box>
                              )}

                              {result.disease_prediction.description && (
                                <Box>
                                  <Typography variant="body2" className="font-semibold text-grey-700">Description:</Typography>
                                  <Typography variant="caption" className="text-grey-600">{result.disease_prediction.description}</Typography>
                                </Box>
                              )}

                              {result.disease_prediction.explanation && result.disease_prediction.explanation !== "No explanation available for this condition." && (
                                <Box>
                                  <Typography variant="body2" className="font-semibold text-grey-700">Explanation:</Typography>
                                  <Typography variant="caption" className="text-grey-600">{result.disease_prediction.explanation}</Typography>
                                </Box>
                              )}

                              {result.disease_prediction.recommendation && (
                                <Box>
                                  <Typography variant="body2" className="font-semibold text-grey-700">Recommendation:</Typography>
                                  <Typography variant="caption" className="text-grey-600">{result.disease_prediction.recommendation}</Typography>
                                </Box>
                              )}

                              {result.disease_prediction.inference_time && (
                                <Box>
                                  <Typography variant="body2" className="font-semibold text-grey-700">Inference Time:</Typography>
                                  <Typography variant="caption" className="text-grey-600">{result.disease_prediction.inference_time}s</Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Grid>
                      )}

                      {/* Nutrient Analysis */}
                      {result.deficiency_prediction && (
                        <Grid item xs={12} md={6}>
                          <Box className={`p-4 rounded-2xl border ${
                            result.deficiency_prediction.class === 'Healthy'
                              ? 'bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200'
                              : 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200'
                          }`}>
                            <div className="flex items-center gap-3 mb-3">
                              <div className={`p-2 rounded-lg ${
                                result.deficiency_prediction.class === 'Healthy'
                                  ? 'bg-emerald-100 text-emerald-600'
                                  : 'bg-blue-100 text-blue-600'
                              }`}>
                                <Leaf className="w-5 h-5" />
                              </div>
                              <Typography variant="h6" className="font-bold">
                                Nutrient Status
                              </Typography>
                            </div>
                            <Typography variant="h4" className={`font-black mb-2 ${
                              result.deficiency_prediction.class === 'Healthy'
                                ? 'text-emerald-700'
                                : 'text-blue-700'
                            }`}>
                              {result.deficiency_prediction.class}
                            </Typography>
                            <div className="flex items-center justify-between mb-2">
                              <Typography variant="body2" className="text-grey-600">
                                Confidence
                              </Typography>
                              <Typography variant="body2" className="font-semibold text-grey-800">
                                {Math.round(result.deficiency_prediction.confidence * 100)}%
                              </Typography>
                            </div>

                            {/* Show detailed deficiency prediction info */}
                            <Box className="mt-3 space-y-2">
                              {result.deficiency_prediction.class && (
                                <Box>
                                  <Typography variant="body2" className="font-semibold text-grey-700">Class:</Typography>
                                  <Typography variant="caption" className="text-grey-600">{result.deficiency_prediction.class}</Typography>
                                </Box>
                              )}

                              {result.deficiency_prediction.class_index && (
                                <Box>
                                  <Typography variant="body2" className="font-semibold text-grey-700">Class Index:</Typography>
                                  <Typography variant="caption" className="text-grey-600">{result.deficiency_prediction.class_index}</Typography>
                                </Box>
                              )}

                              {result.deficiency_prediction.confidence && (
                                <Box>
                                  <Typography variant="body2" className="font-semibold text-grey-700">Confidence:</Typography>
                                  <Typography variant="caption" className="text-grey-600">{result.deficiency_prediction.confidence}</Typography>
                                </Box>
                              )}

                              {result.deficiency_prediction.description && (
                                <Box>
                                  <Typography variant="body2" className="font-semibold text-grey-700">Description:</Typography>
                                  <Typography variant="caption" className="text-grey-600">{result.deficiency_prediction.description}</Typography>
                                </Box>
                              )}

                              {result.deficiency_prediction.explanation && result.deficiency_prediction.explanation !== "No explanation available for this condition." && (
                                <Box>
                                  <Typography variant="body2" className="font-semibold text-grey-700">Explanation:</Typography>
                                  <Typography variant="caption" className="text-grey-600">{result.deficiency_prediction.explanation}</Typography>
                                </Box>
                              )}

                              {result.deficiency_prediction.recommendation && (
                                <Box>
                                  <Typography variant="body2" className="font-semibold text-grey-700">Recommendation:</Typography>
                                  <Typography variant="caption" className="text-grey-600">{result.deficiency_prediction.recommendation}</Typography>
                                </Box>
                              )}

                              {result.deficiency_prediction.inference_time && (
                                <Box>
                                  <Typography variant="body2" className="font-semibold text-grey-700">Inference Time:</Typography>
                                  <Typography variant="caption" className="text-grey-600">{result.deficiency_prediction.inference_time}s</Typography>
                                </Box>
                              )}
                            </Box>
                          </Box>
                        </Grid>
                      )}
                    </Grid>
                  </Box>

                  {/* Comprehensive Results Display */}
                  <Box className="space-y-6">
                    {/* Disease Recommendations */}
                    {result.disease_recommendations && (
                      <Box className="bg-white rounded-3xl shadow-xl border border-grey-200 p-6">
                        <Typography variant="h6" className="font-bold mb-4 text-emerald-800">Disease Management Recommendations</Typography>

                        <div className="space-y-4">
                          {result.disease_recommendations.disease_name && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold mb-2">Disease Name</Typography>
                              <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.disease_name}</Typography>
                            </Box>
                          )}

                          {result.disease_recommendations.current_severity && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold mb-2">Current Severity</Typography>
                              <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.current_severity}</Typography>
                            </Box>
                          )}

                          <Box>
                            <Typography variant="subtitle1" className="font-semibold mb-2">Overview</Typography>
                            <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.overview}</Typography>
                          </Box>

                          {result.disease_recommendations.symptoms && result.disease_recommendations.symptoms.length > 0 && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold mb-2">Symptoms</Typography>
                              <ul className="list-disc list-inside text-grey-600 text-sm">
                                {result.disease_recommendations.symptoms.map((symptom, idx) => (
                                  <li key={idx}>{symptom}</li>
                                ))}
                              </ul>
                            </Box>
                          )}

                          {result.disease_recommendations.integrated_management && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold mb-2">Integrated Management</Typography>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {result.disease_recommendations.integrated_management.cultural_practices && (
                                  <Box className="bg-emerald-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-emerald-800 mb-1">Cultural Practices</Typography>
                                    <ul className="list-disc list-inside text-grey-600 text-xs">
                                      {result.disease_recommendations.integrated_management.cultural_practices.slice(0, 3).map((practice, idx) => (
                                        <li key={idx}>{practice}</li>
                                      ))}
                                    </ul>
                                  </Box>
                                )}

                                {result.disease_recommendations.integrated_management.chemical_control && (
                                  <Box className="bg-blue-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-blue-800 mb-1">Chemical Control</Typography>
                                    <ul className="list-disc list-inside text-grey-600 text-xs">
                                      {result.disease_recommendations.integrated_management.chemical_control.slice(0, 3).map((control, idx) => (
                                        <li key={idx}>{control}</li>
                                      ))}
                                    </ul>
                                  </Box>
                                )}

                                {result.disease_recommendations.integrated_management.biological_control && (
                                  <Box className="bg-purple-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-purple-800 mb-1">Biological Control</Typography>
                                    <ul className="list-disc list-inside text-grey-600 text-xs">
                                      {result.disease_recommendations.integrated_management.biological_control.slice(0, 3).map((control, idx) => (
                                        <li key={idx}>{control}</li>
                                      ))}
                                    </ul>
                                  </Box>
                                )}
                              </div>
                            </Box>
                          )}

                          {result.disease_recommendations.severity_specific_recommendations && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold mb-2">Severity-Specific Recommendations</Typography>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.disease_recommendations.severity_specific_recommendations.immediate_actions && result.disease_recommendations.severity_specific_recommendations.immediate_actions.length > 0 && (
                                  <Box className="bg-red-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-red-800 mb-1">Immediate Actions</Typography>
                                    <ul className="list-disc list-inside text-grey-600 text-xs">
                                      {result.disease_recommendations.severity_specific_recommendations.immediate_actions.map((action, idx) => (
                                        <li key={idx}>{action}</li>
                                      ))}
                                    </ul>
                                  </Box>
                                )}
                                {result.disease_recommendations.severity_specific_recommendations.long_term_strategies && result.disease_recommendations.severity_specific_recommendations.long_term_strategies.length > 0 && (
                                  <Box className="bg-green-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-green-800 mb-1">Long Term Strategies</Typography>
                                    <ul className="list-disc list-inside text-grey-600 text-xs">
                                      {result.disease_recommendations.severity_specific_recommendations.long_term_strategies.map((strategy, idx) => (
                                        <li key={idx}>{strategy}</li>
                                      ))}
                                    </ul>
                                  </Box>
                                )}
                                {result.disease_recommendations.severity_specific_recommendations.spray_frequency && (
                                  <Box className="bg-amber-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-amber-800 mb-1">Spray Frequency</Typography>
                                    <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.severity_specific_recommendations.spray_frequency}</Typography>
                                  </Box>
                                )}
                                {result.disease_recommendations.severity_specific_recommendations.intervention_level && (
                                  <Box className="bg-red-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-red-800 mb-1">Intervention Level</Typography>
                                    <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.severity_specific_recommendations.intervention_level}</Typography>
                                  </Box>
                                )}
                              </div>
                            </Box>
                          )}

                          {result.disease_recommendations.emergency_measures && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold mb-2">Emergency Measures</Typography>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.disease_recommendations.emergency_measures.high_infection && (
                                  <Box className="bg-red-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-red-800 mb-1">High Infection</Typography>
                                    <ul className="list-disc list-inside text-grey-600 text-xs">
                                      {result.disease_recommendations.emergency_measures.high_infection.map((measure, idx) => (
                                        <li key={idx}>{measure}</li>
                                      ))}
                                    </ul>
                                  </Box>
                                )}
                                {result.disease_recommendations.emergency_measures.preventive_protocol && (
                                  <Box className="bg-blue-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-blue-800 mb-1">Preventive Protocol</Typography>
                                    <ul className="list-disc list-inside text-grey-600 text-xs">
                                      {result.disease_recommendations.emergency_measures.preventive_protocol.map((protocol, idx) => (
                                        <li key={idx}>{protocol}</li>
                                      ))}
                                    </ul>
                                  </Box>
                                )}
                              </div>
                            </Box>
                          )}

                          {result.disease_recommendations.monitoring_schedule && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold mb-2">Monitoring Schedule</Typography>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Box className="bg-purple-50 p-3 rounded-lg">
                                  <Typography variant="subtitle2" className="font-semibold text-purple-800 mb-1">Inspection Frequency</Typography>
                                  <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.monitoring_schedule.inspection_frequency}</Typography>
                                </Box>
                                <Box className="bg-indigo-50 p-3 rounded-lg">
                                  <Typography variant="subtitle2" className="font-semibold text-indigo-800 mb-1">Weather Monitoring</Typography>
                                  <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.monitoring_schedule.weather_monitoring}</Typography>
                                </Box>
                              </div>
                            </Box>
                          )}

                          {result.disease_recommendations.resistant_varieties && result.disease_recommendations.resistant_varieties.length > 0 && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold mb-2">Resistant Varieties</Typography>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.disease_recommendations.resistant_varieties.map((variety, idx) => (
                                  <Box key={idx} className="bg-green-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-green-800 mb-1">{variety.name}</Typography>
                                    <Typography variant="body2" className="text-grey-600 text-xs">Resistance: {variety.resistance_level}</Typography>
                                    <Typography variant="body2" className="text-grey-600 text-xs">Adaptation: {variety.adaptation}</Typography>
                                    {variety.characteristics && <Typography variant="body2" className="text-grey-600 text-xs">Characteristics: {variety.characteristics}</Typography>}
                                  </Box>
                                ))}
                              </div>
                            </Box>
                          )}

                          {result.disease_recommendations.coffee_specific_recommendations && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold mb-2">Coffee-Specific Recommendations</Typography>
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {result.disease_recommendations.coffee_specific_recommendations.harvest_timing && (
                                  <Box className="bg-green-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-green-800 mb-1">Harvest Timing</Typography>
                                    <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.coffee_specific_recommendations.harvest_timing}</Typography>
                                  </Box>
                                )}
                                {result.disease_recommendations.coffee_specific_recommendations.shade_management && (
                                  <Box className="bg-teal-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-teal-800 mb-1">Shade Management</Typography>
                                    <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.coffee_specific_recommendations.shade_management}</Typography>
                                  </Box>
                                )}
                                {result.disease_recommendations.coffee_specific_recommendations.pruning_strategy && (
                                  <Box className="bg-orange-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-orange-800 mb-1">Pruning Strategy</Typography>
                                    <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.coffee_specific_recommendations.pruning_strategy}</Typography>
                                  </Box>
                                )}
                                {result.disease_recommendations.coffee_specific_recommendations.irrigation_management && (
                                  <Box className="bg-blue-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-blue-800 mb-1">Irrigation Management</Typography>
                                    <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.coffee_specific_recommendations.irrigation_management}</Typography>
                                  </Box>
                                )}
                                {result.disease_recommendations.coffee_specific_recommendations.nutrient_balance && (
                                  <Box className="bg-purple-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-purple-800 mb-1">Nutrient Balance</Typography>
                                    <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.coffee_specific_recommendations.nutrient_balance}</Typography>
                                  </Box>
                                )}
                                {result.disease_recommendations.coffee_specific_recommendations.monitoring_frequency && (
                                  <Box className="bg-indigo-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-indigo-800 mb-1">Monitoring Frequency</Typography>
                                    <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.coffee_specific_recommendations.monitoring_frequency}</Typography>
                                  </Box>
                                )}
                                {result.disease_recommendations.coffee_specific_recommendations.compost_application && (
                                  <Box className="bg-lime-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-lime-800 mb-1">Compost Application</Typography>
                                    <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.coffee_specific_recommendations.compost_application}</Typography>
                                  </Box>
                                )}
                                {result.disease_recommendations.coffee_specific_recommendations.economic_approach && (
                                  <Box className="bg-yellow-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-yellow-800 mb-1">Economic Approach</Typography>
                                    <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.coffee_specific_recommendations.economic_approach}</Typography>
                                  </Box>
                                )}
                                {result.disease_recommendations.coffee_specific_recommendations.intervention_level && (
                                  <Box className="bg-red-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-red-800 mb-1">Intervention Level</Typography>
                                    <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.coffee_specific_recommendations.intervention_level}</Typography>
                                  </Box>
                                )}
                                {result.disease_recommendations.coffee_specific_recommendations.wound_protection && (
                                  <Box className="bg-pink-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-pink-800 mb-1">Wound Protection</Typography>
                                    <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.coffee_specific_recommendations.wound_protection}</Typography>
                                  </Box>
                                )}
                                {result.disease_recommendations.coffee_specific_recommendations.storage_practices && (
                                  <Box className="bg-cyan-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-cyan-800 mb-1">Storage Practices</Typography>
                                    <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.coffee_specific_recommendations.storage_practices}</Typography>
                                  </Box>
                                )}
                                {result.disease_recommendations.coffee_specific_recommendations.processing_impact && (
                                  <Box className="bg-amber-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-amber-800 mb-1">Processing Impact</Typography>
                                    <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.coffee_specific_recommendations.processing_impact}</Typography>
                                  </Box>
                                )}
                                {result.disease_recommendations.coffee_specific_recommendations.quality_impact && (
                                  <Box className="bg-rose-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-rose-800 mb-1">Quality Impact</Typography>
                                    {result.disease_recommendations.coffee_specific_recommendations.quality_impact.cup_quality && (
                                      <Typography variant="body2" className="text-grey-600 text-xs">Cup Quality: {result.disease_recommendations.coffee_specific_recommendations.quality_impact.cup_quality}</Typography>
                                    )}
                                    {result.disease_recommendations.coffee_specific_recommendations.quality_impact.market_price && (
                                      <Typography variant="body2" className="text-grey-600 text-xs">Market Price: {result.disease_recommendations.coffee_specific_recommendations.quality_impact.market_price}</Typography>
                                    )}
                                    {result.disease_recommendations.coffee_specific_recommendations.quality_impact.certification && (
                                      <Typography variant="body2" className="text-grey-600 text-xs">Certification: {result.disease_recommendations.coffee_specific_recommendations.quality_impact.certification}</Typography>
                                    )}
                                  </Box>
                                )}
                                {result.disease_recommendations.coffee_specific_recommendations.sustainability_considerations && result.disease_recommendations.coffee_specific_recommendations.sustainability_considerations.length > 0 && (
                                  <Box className="bg-emerald-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-emerald-800 mb-1">Sustainability Considerations</Typography>
                                    <ul className="list-disc list-inside text-grey-600 text-xs">
                                      {result.disease_recommendations.coffee_specific_recommendations.sustainability_considerations.map((consideration, idx) => (
                                        <li key={idx}>{consideration}</li>
                                      ))}
                                    </ul>
                                  </Box>
                                )}
                                {result.disease_recommendations.coffee_specific_recommendations.coffee_specific_practices && result.disease_recommendations.coffee_specific_recommendations.coffee_specific_practices.length > 0 && (
                                  <Box className="bg-violet-50 p-3 rounded-lg">
                                    <Typography variant="subtitle2" className="font-semibold text-violet-800 mb-1">Coffee-Specific Practices</Typography>
                                    <ul className="list-disc list-inside text-grey-600 text-xs">
                                      {result.disease_recommendations.coffee_specific_recommendations.coffee_specific_practices.map((practice, idx) => (
                                        <li key={idx}>{practice}</li>
                                      ))}
                                    </ul>
                                  </Box>
                                )}
                              </div>
                            </Box>
                          )}
                        </div>
                      </Box>
                    )}

                    {/* Deficiency Recommendations */}
                    {result.deficiency_recommendations && (
                      <Box className="bg-white rounded-3xl shadow-xl border border-grey-200 p-6">
                        <Typography variant="h6" className="font-bold mb-4 text-blue-800">Nutrient Deficiency Management</Typography>

                        <div className="space-y-4">
                          {result.deficiency_recommendations.basic && result.deficiency_recommendations.basic.length > 0 && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold mb-2">Basic Management</Typography>
                              <ul className="list-disc list-inside text-grey-600">
                                {result.deficiency_recommendations.basic.map((rec, idx) => (
                                  <li key={idx}>{rec}</li>
                                ))}
                              </ul>
                            </Box>
                          )}

                          {result.deficiency_recommendations.symptoms && result.deficiency_recommendations.symptoms.length > 0 && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold mb-2">Symptoms</Typography>
                              <ul className="list-disc list-inside text-grey-600 text-sm">
                                {result.deficiency_recommendations.symptoms.map((symptom, idx) => (
                                  <li key={idx}>{symptom}</li>
                                ))}
                              </ul>
                            </Box>
                          )}

                          {result.deficiency_recommendations.management && result.deficiency_recommendations.management.length > 0 && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold mb-2">Management Strategies</Typography>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {result.deficiency_recommendations.management.map((strategy, idx) => (
                                  <Box key={idx} className="bg-blue-50 p-3 rounded-lg">
                                    <Typography variant="body2" className="text-grey-600">{strategy}</Typography>
                                  </Box>
                                ))}
                              </div>
                            </Box>
                          )}
                        </div>
                      </Box>
                    )}

                    {/* Products and Varieties */}
                    {(result.products && result.products.length > 0) || (result.varieties && result.varieties.length > 0) && (
                      <Box className="bg-white rounded-3xl shadow-xl border border-grey-200 p-6">
                        <Typography variant="h6" className="font-bold mb-4 text-purple-800">Recommended Products & Varieties</Typography>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {result.products && result.products.length > 0 && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold mb-2">Recommended Products</Typography>
                              <ul className="list-disc list-inside text-grey-600">
                                {result.products.map((product, idx) => (
                                  <li key={idx}>{product}</li>
                                ))}
                              </ul>
                            </Box>
                          )}

                          {result.varieties && result.varieties.length > 0 && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold mb-2">Resistant Varieties</Typography>
                              <ul className="list-disc list-inside text-grey-600 text-sm">
                                {result.varieties.map((variety, idx) => (
                                  <li key={idx}>{variety}</li>
                                ))}
                              </ul>
                            </Box>
                          )}
                        </div>
                      </Box>
                    )}

                    {/* Coffee-Specific Practices */}
                    {result.disease_recommendations?.coffee_specific_recommendations?.coffee_specific_practices && (
                      <Box className="bg-white rounded-3xl shadow-xl border border-grey-200 p-6">
                        <Typography variant="h6" className="font-bold mb-4 text-green-800">Coffee Cultivation Best Practices</Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.disease_recommendations.coffee_specific_recommendations.coffee_specific_practices.map((practice, idx) => (
                            <Box key={idx} className="bg-green-50 p-3 rounded-lg">
                              <Typography variant="body2" className="text-grey-600">{practice}</Typography>
                            </Box>
                          ))}
                        </div>
                      </Box>
                    )}

                    {/* Quality Impact */}
                    {result.disease_recommendations?.coffee_specific_recommendations?.quality_impact && (
                      <Box className="bg-white rounded-3xl shadow-xl border border-grey-200 p-6">
                        <Typography variant="h6" className="font-bold mb-4 text-amber-800">Quality & Market Impact</Typography>
                        <div className="space-y-3">
                          {result.disease_recommendations.coffee_specific_recommendations.quality_impact.cup_quality && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold">Cup Quality Impact</Typography>
                              <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.coffee_specific_recommendations.quality_impact.cup_quality}</Typography>
                            </Box>
                          )}
                          {result.disease_recommendations.coffee_specific_recommendations.quality_impact.market_price && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold">Market Price Impact</Typography>
                              <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.coffee_specific_recommendations.quality_impact.market_price}</Typography>
                            </Box>
                          )}
                          {result.disease_recommendations.coffee_specific_recommendations.quality_impact.certification && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold">Certification Impact</Typography>
                              <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.coffee_specific_recommendations.quality_impact.certification}</Typography>
                            </Box>
                          )}
                        </div>
                      </Box>
                    )}

                    {/* Sustainability Considerations */}
                    {result.disease_recommendations?.coffee_specific_recommendations?.sustainability_considerations && (
                      <Box className="bg-white rounded-3xl shadow-xl border border-grey-200 p-6">
                        <Typography variant="h6" className="font-bold mb-4 text-teal-800">Sustainability Considerations</Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {result.disease_recommendations.coffee_specific_recommendations.sustainability_considerations.map((consideration, idx) => (
                            <Box key={idx} className="bg-teal-50 p-3 rounded-lg">
                              <Typography variant="body2" className="text-grey-600">{consideration}</Typography>
                            </Box>
                          ))}
                        </div>
                      </Box>
                    )}

                    {/* Processing Time and Model Info */}
                    {(result.processing_time || result.model_version) && (
                      <Box className="bg-white rounded-3xl shadow-xl border border-grey-200 p-6">
                        <Typography variant="h6" className="font-bold mb-4 text-grey-800">Analysis Details</Typography>
                        <div className="space-y-2">
                          {result.processing_time && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold">Processing Time</Typography>
                              <Typography variant="body2" className="text-grey-600">{result.processing_time}s</Typography>
                            </Box>
                          )}
                          {result.model_version && (
                            <Box>
                              <Typography variant="subtitle1" className="font-semibold">Model Version</Typography>
                              <Typography variant="body2" className="text-grey-600">{result.model_version}</Typography>
                            </Box>
                          )}
                        </div>
                      </Box>
                    )}

                    {/* Economic Considerations */}
                    {result.disease_recommendations?.economic_considerations && (
                      <Box className="bg-white rounded-3xl shadow-xl border border-grey-200 p-6">
                        <Typography variant="h6" className="font-bold mb-4 text-orange-800">Economic Analysis</Typography>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <Box className="bg-orange-50 p-3 rounded-lg">
                            <Typography variant="subtitle2" className="font-semibold text-orange-800 mb-1">Management Cost</Typography>
                            <Typography variant="body2" className="text-grey-600">${result.disease_recommendations.economic_considerations.management_cost_usd_per_ha}/ha</Typography>
                          </Box>
                          <Box className="bg-red-50 p-3 rounded-lg">
                            <Typography variant="subtitle2" className="font-semibold text-red-800 mb-1">Potential Yield Loss</Typography>
                            <Typography variant="body2" className="text-grey-600">{result.disease_recommendations.economic_considerations.potential_yield_loss_percent}%</Typography>
                          </Box>
                        </div>
                      </Box>
                    )}
                  </Box>

                  {/* Action Buttons */}
                  <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={resetCapture}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg"
                      >
                        <Leaf className="w-5 h-5" />
                        New Analysis
                      </motion.button>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={downloadPdf}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:shadow-lg"
                      >
                        <FileText className="w-5 h-5" />
                        PDF Report
                      </motion.button>
                    </Grid>
                    <Grid item xs={12} md={4}>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={retryAnalysis}
                        className="w-full flex items-center justify-center gap-3 px-6 py-4 border-2 border-grey-300 text-grey-700 font-semibold rounded-xl hover:bg-grey-50"
                      >
                        <RotateCw className="w-5 h-5" />
                        Retry Analysis
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
              className="mt-6"
            >
              <Alert 
                severity="error"
                onClose={() => setError(null)}
                className="rounded-2xl"
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