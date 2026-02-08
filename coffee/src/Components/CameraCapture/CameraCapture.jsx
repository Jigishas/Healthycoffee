import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion'; // eslint-disable-line no-unused-vars
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
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(`${uploadUrl}/health`, {
        signal: controller.signal,
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json().catch(() => ({}));
        setBackendStatus('online');
        console.log('Backend health check passed:', data);
      } else {
        setBackendStatus('offline');
        console.warn('Backend health check failed with status:', response.status);
      }
    } catch (err) {
      console.error('Backend health check failed:', err.message);
      if (err.name === 'AbortError') {
        setBackendStatus('offline');
        setError('Backend connection timeout. Please check your internet connection.');
      } else {
        setBackendStatus('offline');
      }
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

  // Connect video stream to video element when camera mode is active
  useEffect(() => {
    let isActive = true;
    let checkInterval = null;

    const connectVideo = async () => {
      if (!isActive || mode !== 'camera' || !stream) {
        return;
      }

      // Wait for video element to be available in DOM
      if (!videoRef.current) {
        console.log('Video element not yet in DOM, waiting...');
        return;
      }

      try {
        // Check if already connected to correct stream
        if (videoRef.current.srcObject === stream) {
          // Just ensure it's playing
          if (videoRef.current.paused) {
            await videoRef.current.play();
            console.log('Video resumed playing');
          }
          return;
        }

        // Set the stream
        console.log('Setting video srcObject...');
        videoRef.current.srcObject = stream;
        
        // Wait for metadata to load
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error('Video load timeout')), 5000);
          
          const handleLoaded = () => {
            clearTimeout(timeout);
            videoRef.current.removeEventListener('loadedmetadata', handleLoaded);
            resolve();
          };
          
          videoRef.current.addEventListener('loadedmetadata', handleLoaded);
        });

        // Now play
        await videoRef.current.play();
        console.log('Video playback started successfully');

      } catch (err) {
        console.error('Video connection error:', err);
        if (isActive) {
          setError('Camera failed to start. Please check permissions and try again.');
        }
      }
    };

    // Delay to allow AnimatePresence to render the video element
    const initialTimeout = setTimeout(() => {
      connectVideo();
      
      // Set up interval to keep trying until successful
      checkInterval = setInterval(() => {
        if (videoRef.current && videoRef.current.srcObject !== stream) {
          connectVideo();
        } else if (videoRef.current && videoRef.current.paused) {
          videoRef.current.play().catch(console.error);
        }
      }, 500);
    }, 300);

    return () => {
      isActive = false;
      clearTimeout(initialTimeout);
      if (checkInterval) clearInterval(checkInterval);
    };
  }, [mode, stream]);





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

      // Upload to backend - use the correct /api/v1/upload-image endpoint
      console.log('Uploading to:', `${uploadUrl}/api/v1/upload-image`);
      const uploadResponse = await fetch(`${uploadUrl}/api/v1/upload-image`, {
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
    if (!result) return;
    try {
      const pdf = new jsPDF({ unit: 'pt', format: 'a4' });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let y = 30;
      let pageNum = 1;

      // Helper function to add page numbers
      const addPageNumber = () => {
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Page ${pageNum}`, pageWidth - 50, pageHeight - 20);
        pageNum++;
      };

      // Professional Header with Branding
      pdf.setFillColor(34, 197, 94); // Emerald green
      pdf.rect(0, 0, pageWidth, 80, 'F');

      // Company Logo/Title
      pdf.setTextColor(255, 255, 255);
      pdf.setFontSize(24);
      pdf.setFont('helvetica', 'bold');
      pdf.text('HealthyCoffee AI', 30, 35);

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'normal');
      pdf.text('Advanced Crop Health Diagnostics', 30, 55);

      // Report Title
      pdf.setTextColor(0, 0, 0);
      pdf.setFontSize(20);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Comprehensive Crop Health Analysis Report', 30, 110);

      // Table of Contents
      y = 140;
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Table of Contents', 30, y);
      y += 20;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const tocItems = [
        '1. Executive Summary ............................. 2',
        '2. Analysis Overview ............................. 3',
        '3. Detailed Disease Analysis ..................... 4',
        '4. Nutrient Deficiency Analysis .................. 5',
        '5. Risk Assessment ............................... 6',
        '6. Management Recommendations .................... 7',
        '7. Implementation Timeline ....................... 8',
        '8. Economic Impact Analysis ...................... 9',
        '9. Quality & Market Considerations ............... 10',
        '10. Methodology & Quality Assurance ............. 11',
        '11. Contact Information .......................... 12'
      ];

      tocItems.forEach(item => {
        pdf.text(item, 30, y);
        y += 12;
      });

      addPageNumber();

      // New Page - Executive Summary
      pdf.addPage();
      y = 30;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('1. Executive Summary', 30, y);
      y += 25;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const diseaseStatus = result.disease_prediction?.class || 'Unknown';
      const deficiencyStatus = result.deficiency_prediction?.class || 'Unknown';
      const diseaseConfidence = Math.round((result.disease_prediction?.confidence || 0) * 100);
      const deficiencyConfidence = Math.round((result.deficiency_prediction?.confidence || 0) * 100);

      const summaryText = `This comprehensive diagnostic report presents the findings of an advanced AI-powered analysis of a coffee leaf sample submitted for health assessment. The analysis was conducted using state-of-the-art computer vision technology and machine learning algorithms trained on extensive agricultural datasets.

Key Findings:
• Disease Classification: ${diseaseStatus} (${diseaseConfidence}% confidence)
• Nutrient Status: ${deficiencyStatus} (${deficiencyConfidence}% confidence)
• Analysis Time: ${result.processing_time || 'N/A'} seconds
• AI Model Version: ${result.model_version || 'Optimized v1.0'}

The following report provides detailed analysis, risk assessment, and actionable recommendations for crop management and disease prevention.`;
      const splitSummary = pdf.splitTextToSize(summaryText, pageWidth - 60);
      pdf.text(splitSummary, 30, y);
      y += splitSummary.length * 13 + 20;

      // Analysis Overview
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Analysis Overview', 30, y);
      y += 20;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const overviewText = `This analysis utilized advanced deep learning techniques to examine the submitted coffee leaf sample. The AI system processed the image through multiple neural network layers to identify visual patterns associated with various disease states and nutrient deficiencies. The analysis included automated feature extraction, multi-class classification, and confidence scoring to provide reliable diagnostic results.`;
      const overviewSplit = pdf.splitTextToSize(overviewText, pageWidth - 60);
      pdf.text(overviewSplit, 30, y);

      addPageNumber();

      // New Page - Detailed Disease Analysis
      pdf.addPage();
      y = 30;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('2. Detailed Disease Analysis', 30, y);
      y += 25;

      if (result.disease_prediction) {
        // Disease Status Box
        pdf.setFillColor(240, 253, 244);
        pdf.rect(30, y - 5, pageWidth - 60, 100, 'F');
        pdf.setFillColor(34, 197, 94);
        pdf.rect(30, y - 5, pageWidth - 60, 100, 'S');

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Disease Detection Results', 40, y + 5);
        y += 20;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Primary Disease: ${result.disease_prediction.class}`, 40, y);
        y += 15;
        pdf.text(`Confidence Level: ${diseaseConfidence}%`, 40, y);
        y += 15;
        pdf.text(`Classification Index: ${result.disease_prediction.class_index || 'N/A'}`, 40, y);
        y += 15;
        pdf.text(`Processing Time: ${result.disease_prediction.inference_time || 'N/A'} seconds`, 40, y);
        y += 25;

        if (result.disease_prediction.explanation && result.disease_prediction.explanation !== "No explanation available for this condition.") {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Pathological Description:', 30, y);
          y += 15;
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          const explanationSplit = pdf.splitTextToSize(result.disease_prediction.explanation, pageWidth - 60);
          pdf.text(explanationSplit, 30, y);
          y += explanationSplit.length * 10 + 15;
        }

        // Disease Characteristics Table
        if (y > pageHeight - 150) {
          pdf.addPage();
          y = 30;
        }

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Disease Characteristics:', 30, y);
        y += 15;

        // Create table-like structure
        const tableData = [
          ['Characteristic', 'Status'],
          ['Infectivity', diseaseStatus === 'Healthy' ? 'None' : 'High'],
          ['Severity Level', diseaseConfidence > 80 ? 'Critical' : diseaseConfidence > 60 ? 'Moderate' : 'Low'],
          ['Spread Potential', diseaseStatus === 'Healthy' ? 'None' : 'High'],
          ['Treatment Urgency', diseaseStatus === 'Healthy' ? 'None' : 'Immediate']
        ];

        tableData.forEach((row, index) => {
          if (index === 0) {
            pdf.setFillColor(240, 240, 240);
            pdf.rect(30, y - 2, pageWidth - 60, 15, 'F');
            pdf.setFont('helvetica', 'bold');
          } else {
            pdf.setFont('helvetica', 'normal');
          }
          pdf.text(row[0], 40, y + 8);
          pdf.text(row[1], 200, y + 8);
          y += 15;
        });
      }

      addPageNumber();

      // New Page - Nutrient Deficiency Analysis
      pdf.addPage();
      y = 30;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('3. Nutrient Deficiency Analysis', 30, y);
      y += 25;

      if (result.deficiency_prediction) {
        // Nutrient Status Box
        pdf.setFillColor(240, 248, 255);
        pdf.rect(30, y - 5, pageWidth - 60, 100, 'F');
        pdf.setFillColor(59, 130, 246);
        pdf.rect(30, y - 5, pageWidth - 60, 100, 'S');

        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text('Nutrient Analysis Results', 40, y + 5);
        y += 20;

        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Primary Deficiency: ${result.deficiency_prediction.class}`, 40, y);
        y += 15;
        pdf.text(`Confidence Level: ${deficiencyConfidence}%`, 40, y);
        y += 15;
        pdf.text(`Classification Index: ${result.deficiency_prediction.class_index || 'N/A'}`, 40, y);
        y += 15;
        pdf.text(`Processing Time: ${result.deficiency_prediction.inference_time || 'N/A'} seconds`, 40, y);
        y += 25;

        if (result.deficiency_prediction.explanation && result.deficiency_prediction.explanation !== "No explanation available for this condition.") {
          pdf.setFontSize(12);
          pdf.setFont('helvetica', 'bold');
          pdf.text('Nutritional Assessment:', 30, y);
          y += 15;
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'normal');
          const explanationSplit = pdf.splitTextToSize(result.deficiency_prediction.explanation, pageWidth - 60);
          pdf.text(explanationSplit, 30, y);
          y += explanationSplit.length * 10 + 15;
        }
      }

      addPageNumber();

      // New Page - Risk Assessment
      pdf.addPage();
      y = 30;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('4. Risk Assessment', 30, y);
      y += 25;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const riskText = `Based on the AI analysis results, the following risk assessment has been prepared to help prioritize management interventions and resource allocation.`;

      const riskSplit = pdf.splitTextToSize(riskText, pageWidth - 60);
      pdf.text(riskSplit, 30, y);
      y += riskSplit.length * 13 + 20;

      // Risk Matrix
      const risks = [
        {
          category: 'Disease Spread Risk',
          level: diseaseStatus === 'Healthy' ? 'Low' : 'High',
          description: diseaseStatus === 'Healthy' ? 'No immediate disease transmission risk' : 'High potential for disease spread to adjacent plants'
        },
        {
          category: 'Yield Impact Risk',
          level: (diseaseConfidence > 70 || deficiencyConfidence > 70) ? 'High' : 'Medium',
          description: 'Potential reduction in photosynthetic capacity and fruit production'
        },
        {
          category: 'Economic Impact Risk',
          level: diseaseStatus === 'Healthy' && deficiencyStatus === 'Healthy' ? 'Low' : 'High',
          description: 'Cost implications for treatment, monitoring, and potential yield loss'
        },
        {
          category: 'Long-term Farm Health',
          level: 'Medium',
          description: 'Overall impact on soil health, plant vigor, and sustainable production'
        }
      ];

      risks.forEach(risk => {
        pdf.setFillColor(risk.level === 'High' ? 255 : risk.level === 'Medium' ? 255 : 240,
                        risk.level === 'High' ? 240 : risk.level === 'Medium' ? 255 : 255,
                        risk.level === 'High' ? 240 : risk.level === 'Medium' ? 240 : 240);
        pdf.rect(30, y - 5, pageWidth - 60, 50, 'F');
        pdf.rect(30, y - 5, pageWidth - 60, 50, 'S');

        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.text(`${risk.category}: ${risk.level} Risk`, 40, y + 8);
        y += 15;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        const descSplit = pdf.splitTextToSize(risk.description, pageWidth - 80);
        pdf.text(descSplit, 40, y);
        y += descSplit.length * 10 + 10;
      });

      addPageNumber();

      // New Page - Management Recommendations
      pdf.addPage();
      y = 30;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('5. Management Recommendations', 30, y);
      y += 25;

      // Immediate Actions
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Immediate Actions (0-7 days):', 30, y);
      y += 20;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const immediateActions = [
        'Isolate affected plants to prevent disease spread to healthy crops',
        'Remove and destroy severely infected plant material through burning or deep burial',
        'Improve air circulation by pruning dense canopy areas',
        'Adjust irrigation practices based on deficiency analysis results',
        'Apply appropriate organic or chemical treatments as recommended',
        'Establish quarantine zone around affected areas',
        'Monitor plant response to interventions with daily observations',
        'Document all treatments and observations for regulatory compliance'
      ];

      immediateActions.forEach(action => {
        pdf.text(`• ${action}`, 40, y);
        y += 12;
      });

      y += 20;

      // Short-term Actions
      if (y > pageHeight - 150) {
        pdf.addPage();
        y = 30;
      }

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Short-term Actions (1-4 weeks):', 30, y);
      y += 20;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      const shortTermActions = [
        'Implement integrated pest management (IPM) program',
        'Conduct comprehensive soil analysis for nutrient deficiencies',
        'Apply targeted fertilization based on deficiency diagnosis',
        'Install proper drainage systems to prevent waterlogging',
        'Introduce beneficial insects for natural pest control',
        'Establish regular scouting schedule for early detection',
        'Train farm workers on disease identification and prevention',
        'Set up weather monitoring stations for predictive management'
      ];

      shortTermActions.forEach(action => {
        pdf.text(`• ${action}`, 40, y);
        y += 12;
      });

      addPageNumber();

      // New Page - Implementation Timeline
      pdf.addPage();
      y = 30;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('6. Implementation Timeline', 30, y);
      y += 25;

      const timelineItems = [
        {
          phase: 'Phase 1: Emergency Response (Days 1-3)',
          actions: ['Isolate infected plants', 'Remove diseased material', 'Apply emergency treatments', 'Set up monitoring stations']
        },
        {
          phase: 'Phase 2: Assessment & Planning (Days 4-7)',
          actions: ['Complete soil testing', 'Develop treatment plan', 'Order necessary supplies', 'Train personnel']
        },
        {
          phase: 'Phase 3: Active Treatment (Weeks 2-4)',
          actions: ['Implement treatment protocols', 'Monitor treatment efficacy', 'Adjust treatments as needed', 'Document all activities']
        },
        {
          phase: 'Phase 4: Recovery & Prevention (Weeks 5-12)',
          actions: ['Implement preventive measures', 'Establish monitoring program', 'Plan for next growing season', 'Review and document lessons learned']
        },
        {
          phase: 'Phase 5: Long-term Management (Ongoing)',
          actions: ['Regular health monitoring', 'Preventive applications', 'Record keeping', 'Continuous improvement']
        }
      ];

      timelineItems.forEach(item => {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(item.phase, 30, y);
        y += 15;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        item.actions.forEach(action => {
          pdf.text(`• ${action}`, 40, y);
          y += 10;
        });
        y += 10;
      });

      addPageNumber();

      // New Page - Economic Impact Analysis
      pdf.addPage();
      y = 30;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('7. Economic Impact Analysis', 30, y);
      y += 25;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const economicText = `The following analysis provides estimated economic implications of the diagnosed conditions. These figures are based on industry averages and should be validated with local market conditions and actual treatment costs.`;

      const economicSplit = pdf.splitTextToSize(economicText, pageWidth - 60);
      pdf.text(economicSplit, 30, y);
      y += economicSplit.length * 13 + 20;

      // Cost Analysis Table
      const costData = [
        ['Cost Category', 'Estimated Cost (USD/ha)', 'Timeframe'],
        ['Disease Treatment', diseaseStatus === 'Healthy' ? '$0' : '$150-300', 'Immediate'],
        ['Nutrient Supplementation', deficiencyStatus === 'Healthy' ? '$0' : '$100-250', '1-2 weeks'],
        ['Labor for Monitoring', '$50-100', 'Ongoing'],
        ['Preventive Applications', '$75-150', 'Monthly'],
        ['Potential Yield Loss', diseaseStatus === 'Healthy' && deficiencyStatus === 'Healthy' ? '$0' : '$500-2000', 'Per season'],
        ['Total Estimated Impact', diseaseStatus === 'Healthy' && deficiencyStatus === 'Healthy' ? '$125-250' : '$875-2700', 'Per season']
      ];

      costData.forEach((row, index) => {
        if (index === 0) {
          pdf.setFillColor(240, 240, 240);
          pdf.rect(30, y - 2, pageWidth - 60, 15, 'F');
          pdf.setFont('helvetica', 'bold');
        } else {
          pdf.setFont('helvetica', 'normal');
        }
        pdf.text(row[0], 40, y + 8);
        pdf.text(row[1], 250, y + 8);
        pdf.text(row[2], 350, y + 8);
        y += 15;
      });

      y += 20;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'italic');
      pdf.text('* Costs are estimates based on industry averages. Actual costs may vary based on location, severity, and market conditions.', 30, y);

      addPageNumber();

      // New Page - Quality & Market Considerations
      pdf.addPage();
      y = 30;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('8. Quality & Market Considerations', 30, y);
      y += 25;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const qualityText = `Coffee quality is significantly impacted by plant health conditions. The following analysis examines potential effects on cup quality, market pricing, and certification requirements.`;

      const qualitySplit = pdf.splitTextToSize(qualityText, pageWidth - 60);
      pdf.text(qualitySplit, 30, y);
      y += qualitySplit.length * 13 + 20;

      // Quality Impact Assessment
      const qualityImpacts = [
        {
          aspect: 'Cup Quality Impact',
          assessment: diseaseStatus === 'Healthy' && deficiencyStatus === 'Healthy' ? 'No significant impact expected' : 'Potential reduction in cup quality and flavor profile',
          market_effect: 'Premium pricing may be affected if quality declines'
        },
        {
          aspect: 'Market Price Impact',
          assessment: 'Price reduction of 10-30% possible if disease/deficiency affects bean quality',
          market_effect: 'Lower grade classification may result in reduced market value'
        },
        {
          aspect: 'Certification Impact',
          assessment: 'Organic and specialty certifications may be at risk if chemical treatments are required',
          market_effect: 'Loss of premium certification could reduce market access and pricing'
        },
        {
          aspect: 'Export Market Access',
          assessment: 'Stringent international quality standards may be affected',
          market_effect: 'Potential barriers to premium export markets'
        }
      ];

      qualityImpacts.forEach(impact => {
        pdf.setFontSize(12);
        pdf.setFont('helvetica', 'bold');
        pdf.text(impact.aspect, 30, y);
        y += 15;

        pdf.setFontSize(9);
        pdf.setFont('helvetica', 'normal');
        pdf.text(`Assessment: ${impact.assessment}`, 40, y);
        y += 12;
        pdf.text(`Market Effect: ${impact.market_effect}`, 40, y);
        y += 20;
      });

      addPageNumber();

      // New Page - Methodology & Quality Assurance
      pdf.addPage();
      y = 30;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('9. Methodology & Quality Assurance', 30, y);
      y += 25;

      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('AI Analysis Methodology:', 30, y);
      y += 15;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const methodologyText = `This analysis was performed using state-of-the-art deep learning computer vision technology powered by EfficientNet-B0 neural networks. The AI system was trained on extensive datasets of coffee leaf images representing various disease states and nutrient deficiencies. The analysis process includes:

1. Image preprocessing and enhancement using advanced computer vision techniques
2. Feature extraction through multiple convolutional neural network layers
3. Multi-class classification for simultaneous disease and deficiency detection
4. Confidence scoring and uncertainty estimation for result reliability
5. Automated recommendation generation based on detected conditions and severity
6. Quality assurance checks to ensure result accuracy and consistency

The system achieves over 85% accuracy on validation datasets and provides confidence scores for each prediction.`;
      const methodologySplit = pdf.splitTextToSize(methodologyText, pageWidth - 60);
      pdf.text(methodologySplit, 30, y);
      y += methodologySplit.length * 10 + 20;

      // Quality Assurance
      pdf.setFontSize(12);
      pdf.setFont('helvetica', 'bold');
      pdf.text('Quality Assurance Standards:', 30, y);
      y += 15;

      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'normal');
      const qaText = `This report was generated by HealthyCoffee AI diagnostic system with automated quality checks:

• All AI classifications above 70% confidence are considered reliable
• Results below 70% confidence require field validation
• System accuracy validated on independent test datasets
• Regular model retraining ensures current disease patterns are recognized
• Human expert review available for complex cases
• All analysis results are timestamped and auditable

For optimal results, combine this AI analysis with field observations and professional agricultural consultation.`;
      const qaSplit = pdf.splitTextToSize(qaText, pageWidth - 60);
      pdf.text(qaSplit, 30, y);

      addPageNumber();

      // New Page - Contact Information (Complete this section)
      pdf.addPage();
      y = 30;

      pdf.setFontSize(16);
      pdf.setFont('helvetica', 'bold');
      pdf.text('10. Contact Information & Support', 30, y);
      y += 25;

      pdf.setFontSize(11);
      pdf.setFont('helvetica', 'normal');
      const contactText = `For technical support, additional analysis, or consultation services, please contact our team:`;
      const contactSplit = pdf.splitTextToSize(contactText, pageWidth - 60);
      pdf.text(contactSplit, 30, y);
      y += contactSplit.length * 13 + 20;

      // Contact Details
      const contactDetails = [
        { label: 'Technical Support:', value: 'support@healthycoffee.ai' },
        { label: 'Customer Service:', value: 'contact@healthycoffee.ai' },
        { label: 'Emergency Hotline:', value: '+254743121169' },
        { label: 'Website:', value: 'https://healthycoffee.vercel.app' },
        { label: 'Report Generated:', value: new Date().toLocaleDateString() },
        { label: 'Report ID:', value: `HC-${Date.now().toString().slice(-8)}` },
        { label: 'AI Model Version:', value: result.model_version || 'Optimized v1.0' },
        { label: 'Disclaimer:', value: 'This report is generated by an AI system and should be used as a guide. Always consult with a professional agronomist for critical decisions.' }
      ];

      contactDetails.forEach(detail => {
        pdf.setFont('helvetica', 'bold');
        pdf.text(detail.label, 30, y);
        pdf.setFont('helvetica', 'normal');
        pdf.text(detail.value, 150, y);
        y += 15;
      });

      addPageNumber();

      // Save the PDF
      pdf.save(`HealthyCoffee_Analysis_Report_${Date.now()}.pdf`);
    } catch (error) {
      console.error('PDF generation failed:', error);
      setError('Failed to generate PDF report. Please try again.');
    }
  };

  // Render the component
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
                        data-camera-button
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
                  <div className="relative aspect-video bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ 
                        minHeight: '300px',
                        backgroundColor: 'black',
                        display: 'block'
                      }}
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
