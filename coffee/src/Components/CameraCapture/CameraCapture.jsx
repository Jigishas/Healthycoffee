import React, { useState, useRef, useEffect } from 'react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '../ui/accordion';
import html2pdf from 'html2pdf.js';

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
  const [pdfGenerating, setPdfGenerating] = useState(false);
  const [pdfDownloadStatus, setPdfDownloadStatus] = useState(null);
  const [cameraAvailable, setCameraAvailable] = useState(true);

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
      // Get confidence levels
      const deficiencyConfidence = result.deficiency_prediction ? Math.round((result.deficiency_prediction.confidence || 0) * 100) : 0;
      const diseaseConfidence = result.disease_prediction ? Math.round((result.disease_prediction.confidence || 0) * 100) : 0;

      // Create PDF content with ultra-modern styling
      const pdfContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Leaf Analysis Report</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            
            body {
              font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
              max-width: 900px;
              margin: 0 auto;
              padding: 40px;
              color: #1a202c;
              line-height: 1.7;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              min-height: 100vh;
            }
            
            .container {
              background: rgba(255, 255, 255, 0.95);
              backdrop-filter: blur(20px);
              border-radius: 24px;
              padding: 50px;
              box-shadow: 
                0 25px 50px -12px rgba(0, 0, 0, 0.25),
                inset 0 1px 0 rgba(255, 255, 255, 0.1);
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .header {
              text-align: center;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
              padding: 50px 40px;
              border-radius: 20px;
              margin-bottom: 50px;
              position: relative;
              overflow: hidden;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
            }
            
            .header h1 {
              margin: 0;
              font-size: 42px;
              font-weight: 700;
              letter-spacing: -0.5px;
              position: relative;
              text-shadow: 0 4px 8px rgba(0,0,0,0.3);
            }
            
            .header p {
              margin: 15px 0 0 0;
              font-size: 18px;
              opacity: 0.95;
              font-weight: 400;
            }
            
            .section {
              margin-bottom: 40px;
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
              padding: 40px;
              border-radius: 20px;
              box-shadow: 
                0 10px 25px -5px rgba(0, 0, 0, 0.1),
                0 4px 6px -2px rgba(0, 0, 0, 0.05);
              border: 1px solid rgba(255, 255, 255, 0.3);
              position: relative;
              transition: all 0.3s ease;
            }
            
            .section:hover {
              transform: translateY(-5px);
              box-shadow: 
                0 20px 40px -10px rgba(0, 0, 0, 0.15),
                0 8px 12px -4px rgba(0, 0, 0, 0.1);
            }
            
            .section h2 {
              color: #2d3748;
              font-size: 28px;
              font-weight: 700;
              margin: 0 0 25px 0;
              display: flex;
              align-items: center;
              gap: 15px;
              letter-spacing: -0.3px;
            }
            
            .confidence-meter {
              background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
              border-radius: 16px;
              padding: 25px;
              margin: 25px 0;
              border: 2px solid #e2e8f0;
              position: relative;
              overflow: hidden;
            }
            
            .confidence-meter::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #667eea, #764ba2);
            }
            
            .confidence-level {
              background: linear-gradient(90deg, #fc8181, #f6ad55, #68d391);
              height: 12px;
              border-radius: 10px;
              margin: 20px 0;
              position: relative;
              box-shadow: 
                inset 0 2px 4px rgba(0,0,0,0.1),
                0 2px 4px rgba(0,0,0,0.1);
            }
            
            .confidence-marker {
              position: absolute;
              top: -8px;
              width: 24px;
              height: 24px;
              background: #2d3748;
              border-radius: 50%;
              transform: translateX(-50%);
              box-shadow: 
                0 4px 12px rgba(0,0,0,0.3),
                0 0 0 4px rgba(255,255,255,0.8);
              border: 2px solid #ffffff;
            }
            
            .recommendation-card {
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              border-radius: 16px;
              padding: 25px;
              margin: 20px 0;
              border-left: 6px solid #3b82f6;
              box-shadow: 
                0 8px 20px rgba(59, 130, 246, 0.15),
                inset 0 1px 0 rgba(255, 255, 255, 0.6);
              position: relative;
              overflow: hidden;
            }
            
            .recommendation-card::before {
              content: '';
              position: absolute;
              top: 0;
              right: 0;
              width: 80px;
              height: 80px;
              background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, transparent 50%);
              border-radius: 0 0 0 80px;
            }
            
            .recommendation-card h4 {
              margin: 0 0 15px 0;
              color: #1e40af;
              font-size: 20px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 10px;
            }
            
            .status-badge {
              display: inline-flex;
              align-items: center;
              gap: 10px;
              padding: 12px 24px;
              border-radius: 50px;
              color: white;
              font-weight: 600;
              font-size: 15px;
              margin: 10px 0;
              box-shadow: 
                0 6px 20px rgba(0,0,0,0.2),
                0 2px 4px rgba(0,0,0,0.1);
              backdrop-filter: blur(10px);
              border: 1px solid rgba(255, 255, 255, 0.2);
            }
            
            .healthy { 
              background: linear-gradient(135deg, #10b981, #059669);
            }
            
            .moderate { 
              background: linear-gradient(135deg, #f59e0b, #d97706);
            }
            
            .critical { 
              background: linear-gradient(135deg, #ef4444, #dc2626);
            }
            
            .grid-2 {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 30px;
              margin: 25px 0;
            }
            
            .management-card {
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
              border-radius: 16px;
              padding: 25px;
              border: 2px solid #e2e8f0;
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
            }
            
            .management-card:hover {
              border-color: #3b82f6;
              box-shadow: 
                0 12px 30px rgba(59, 130, 246, 0.2),
                0 4px 8px rgba(59, 130, 246, 0.1);
              transform: translateY(-3px);
            }
            
            .management-card h5 {
              margin: 0 0 20px 0;
              color: #1e40af;
              font-size: 18px;
              font-weight: 600;
              display: flex;
              align-items: center;
              gap: 12px;
            }
            
            .list-item {
              display: flex;
              align-items: flex-start;
              gap: 15px;
              padding: 12px 0;
              color: #4a5568;
              border-bottom: 1px solid rgba(0, 0, 0, 0.05);
              transition: all 0.2s ease;
            }
            
            .list-item:hover {
              background: rgba(255, 255, 255, 0.5);
              border-radius: 8px;
              padding: 12px;
              margin: 0 -12px;
            }
            
            .list-item:last-child {
              border-bottom: none;
            }
            
            .list-item-icon {
              color: #3b82f6;
              font-weight: bold;
              flex-shrink: 0;
              margin-top: 2px;
              font-size: 16px;
            }
            
            .economic-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
              gap: 25px;
              margin: 25px 0;
            }
            
            .economic-item {
              text-align: center;
              background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
              padding: 25px 20px;
              border-radius: 16px;
              border: 2px solid #e2e8f0;
              transition: all 0.3s ease;
              position: relative;
              overflow: hidden;
            }
            
            .economic-item::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #10b981, #3b82f6);
            }
            
            .economic-item:hover {
              border-color: #10b981;
              box-shadow: 
                0 12px 30px rgba(16, 185, 129, 0.2),
                0 4px 8px rgba(16, 185, 129, 0.1);
              transform: translateY(-3px);
            }
            
            .economic-value {
              font-size: 28px;
              font-weight: 800;
              color: #065f46;
              margin-bottom: 8px;
              letter-spacing: -0.5px;
            }
            
            .economic-label {
              font-size: 13px;
              color: #6b7280;
              text-transform: uppercase;
              letter-spacing: 1px;
              font-weight: 600;
            }
            
            .footer {
              text-align: center;
              margin-top: 60px;
              padding-top: 40px;
              border-top: 2px solid #e2e8f0;
              color: #6b7280;
              font-size: 14px;
            }
            
            .raw-response {
              background: #1a202c;
              color: #e2e8f0;
              padding: 30px;
              border-radius: 16px;
              font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
              font-size: 13px;
              margin: 25px 0;
              white-space: pre-wrap;
              overflow-x: auto;
              border: 1px solid #4a5568;
              line-height: 1.6;
            }
            
            .floating-shape {
              position: absolute;
              border-radius: 50%;
              background: linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
              animation: float 6s ease-in-out infinite;
            }
            
            .shape-1 {
              width: 120px;
              height: 120px;
              top: -30px;
              right: -30px;
              animation-delay: 0s;
            }
            
            .shape-2 {
              width: 80px;
              height: 80px;
              bottom: -20px;
              left: -20px;
              animation-delay: 2s;
            }
            
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg); }
              50% { transform: translateY(-20px) rotate(180deg); }
            }
            
            @media print {
              body {
                padding: 20px;
                background: white;
              }
              .container {
                box-shadow: none;
                border: 1px solid #e2e8f0;
              }
              .section {
                box-shadow: none;
                border: 1px solid #e2e8f0;
                page-break-inside: avoid;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="floating-shape shape-1"></div>
              <div class="floating-shape shape-2"></div>
              <h1>🌿 Leaf Analysis Report</h1>
              <p>AI-Powered Plant Health Assessment</p>
              <p style="margin-top: 10px; opacity: 0.9;"><strong>Generated:</strong> ${new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })} at ${new Date().toLocaleTimeString()}</p>
            </div>

            <!-- Raw API Response -->
            <div class="section">
              <h2>📊 Raw Analysis Data</h2>
              <div class="raw-response">${JSON.stringify(result, null, 2)}</div>
            </div>

            ${result.deficiency_prediction ? `
            <div class="section">
              <h2>🧪 Nutrient Deficiency Analysis</h2>
              <div class="status-badge ${result.deficiency_prediction.class.toLowerCase().includes('healthy') ? 'healthy' : result.deficiency_prediction.class.toLowerCase().includes('mild') ? 'moderate' : 'critical'}">
                ${result.deficiency_prediction.class}
              </div>
              <div class="confidence-meter">
                <strong style="font-size: 16px;">Confidence Level: ${deficiencyConfidence}%</strong>
                <div class="confidence-level">
                  <div class="confidence-marker" style="left: ${deficiencyConfidence}%;"></div>
                </div>
              </div>
              ${result.deficiency_prediction.explanation ? `
                <div class="recommendation-card">
                  <h4>💡 Explanation</h4>
                  <p>${result.deficiency_prediction.explanation}</p>
                </div>
              ` : ''}
              ${result.deficiency_prediction.recommendation ? `
                <div class="recommendation-card">
                  <h4>🎯 Recommendation</h4>
                  <p>${result.deficiency_prediction.recommendation}</p>
                </div>
              ` : ''}
            </div>
            ` : ''}

            ${result.disease_prediction ? `
            <div class="section">
              <h2>🔬 Disease Detection Analysis</h2>
              <div class="status-badge ${result.disease_prediction.class.toLowerCase().includes('healthy') ? 'healthy' : result.disease_prediction.class.toLowerCase().includes('mild') ? 'moderate' : 'critical'}">
                ${result.disease_prediction.class}
              </div>
              <div class="confidence-meter">
                <strong style="font-size: 16px;">Confidence Level: ${diseaseConfidence}%</strong>
                <div class="confidence-level">
                  <div class="confidence-marker" style="left: ${diseaseConfidence}%;"></div>
                </div>
              </div>
              ${result.disease_prediction.explanation ? `
                <div class="recommendation-card">
                  <h4>💡 Explanation</h4>
                  <p>${result.disease_prediction.explanation}</p>
                </div>
              ` : ''}
              ${result.disease_prediction.recommendation ? `
                <div class="recommendation-card">
                  <h4>🎯 Recommendation</h4>
                  <p>${result.disease_prediction.recommendation}</p>
                </div>
              ` : ''}
            </div>
            ` : ''}

            ${result.recommendations?.disease_recommendations ? `
            <div class="section">
              <h2>🛡️ Disease Management Plan</h2>

              ${result.recommendations.disease_recommendations.overview ? `
              <div class="recommendation-card">
                <h4>📖 Overview</h4>
                <p>${result.recommendations.disease_recommendations.overview}</p>
              </div>
              ` : ''}

              ${result.recommendations.disease_recommendations.symptoms ? `
              <div class="recommendation-card">
                <h4>🔍 Symptoms</h4>
                ${result.recommendations.disease_recommendations.symptoms.map(symptom => `
                  <div class="list-item">
                    <span class="list-item-icon">•</span>
                    <span>${symptom}</span>
                  </div>
                `).join('')}
              </div>
              ` : ''}

              ${result.recommendations.disease_recommendations.integrated_management ? `
              <div class="grid-2">
                ${result.recommendations.disease_recommendations.integrated_management.cultural_practices ? `
                <div class="management-card">
                  <h5>🌱 Cultural Practices</h5>
                  ${result.recommendations.disease_recommendations.integrated_management.cultural_practices.map(practice => `
                    <div class="list-item">
                      <span class="list-item-icon">•</span>
                      <span>${practice}</span>
                    </div>
                  `).join('')}
                </div>
                ` : ''}

                ${result.recommendations.disease_recommendations.integrated_management.chemical_control ? `
                <div class="management-card">
                  <h5>🧪 Chemical Control</h5>
                  ${result.recommendations.disease_recommendations.integrated_management.chemical_control.map(control => `
                    <div class="list-item">
                      <span class="list-item-icon">•</span>
                      <span>${control}</span>
                    </div>
                  `).join('')}
                </div>
                ` : ''}
              </div>

              ${result.recommendations.disease_recommendations.integrated_management.biological_control ? `
              <div class="management-card">
                <h5>🐞 Biological Control</h5>
                ${result.recommendations.disease_recommendations.integrated_management.biological_control.map(control => `
                  <div class="list-item">
                    <span class="list-item-icon">•</span>
                    <span>${control}</span>
                  </div>
                `).join('')}
              </div>
              ` : ''}

              ${result.recommendations.disease_recommendations.integrated_management.monitoring ? `
              <div class="management-card">
                <h5>👀 Monitoring</h5>
                ${result.recommendations.disease_recommendations.integrated_management.monitoring.map(monitor => `
                  <div class="list-item">
                    <span class="list-item-icon">•</span>
                    <span>${monitor}</span>
                  </div>
                `).join('')}
              </div>
              ` : ''}
              ` : ''}

              ${result.recommendations.disease_recommendations.severity_specific_recommendations ? `
              <div class="recommendation-card">
                <h4>⚡ Severity-Specific Actions</h4>
                <div class="grid-2">
                  <div><strong>Spray Frequency:</strong> ${result.recommendations.disease_recommendations.severity_specific_recommendations.spray_frequency}</div>
                  <div><strong>Intervention Level:</strong> ${result.recommendations.disease_recommendations.severity_specific_recommendations.intervention_level}</div>
                </div>

                ${result.recommendations.disease_recommendations.severity_specific_recommendations.immediate_actions ? `
                <h5 style="color: #dc2626; margin-top: 20px; font-size: 16px;">🚨 Immediate Actions</h5>
                ${result.recommendations.disease_recommendations.severity_specific_recommendations.immediate_actions.map(action => `
                  <div class="list-item">
                    <span class="list-item-icon">⚠️</span>
                    <span>${action}</span>
                  </div>
                `).join('')}
                ` : ''}

                ${result.recommendations.disease_recommendations.severity_specific_recommendations.long_term_strategies ? `
                <h5 style="color: #059669; margin-top: 20px; font-size: 16px;">📈 Long-term Strategies</h5>
                ${result.recommendations.disease_recommendations.severity_specific_recommendations.long_term_strategies.map(strategy => `
                  <div class="list-item">
                    <span class="list-item-icon">📊</span>
                    <span>${strategy}</span>
                  </div>
                `).join('')}
                ` : ''}
              </div>
              ` : ''}

              ${result.recommendations.disease_recommendations.economic_considerations ? `
              <div class="recommendation-card">
                <h4>💰 Economic Considerations</h4>
                <div class="economic-grid">
                  <div class="economic-item">
                    <div class="economic-value">$${result.recommendations.disease_recommendations.economic_considerations.management_cost_usd_per_ha}</div>
                    <div class="economic-label">Cost/ha</div>
                  </div>
                  <div class="economic-item">
                    <div class="economic-value">${result.recommendations.disease_recommendations.economic_considerations.potential_yield_loss_percent}%</div>
                    <div class="economic-label">Yield Loss</div>
                  </div>
                  <div class="economic-item">
                    <div class="economic-value">${result.recommendations.disease_recommendations.economic_considerations.return_on_investment}</div>
                    <div class="economic-label">ROI</div>
                  </div>
                  <div class="economic-item">
                    <div class="economic-value">${result.recommendations.disease_recommendations.economic_considerations.economic_threshold}</div>
                    <div class="economic-label">Threshold</div>
                  </div>
                </div>
              </div>
              ` : ''}
            </div>
            ` : ''}

            ${result.recommendations?.deficiency_recommendations ? `
            <div class="section">
              <h2>🌱 Nutrition Management</h2>

              ${result.recommendations.deficiency_recommendations.symptoms ? `
              <div class="recommendation-card">
                <h4>🔍 Symptoms</h4>
                ${result.recommendations.deficiency_recommendations.symptoms.map(symptom => `
                  <div class="list-item">
                    <span class="list-item-icon">•</span>
                    <span>${symptom}</span>
                  </div>
                `).join('')}
              </div>
              ` : ''}

              ${result.recommendations.deficiency_recommendations.basic ? `
              <div class="recommendation-card">
                <h4>💡 Basic Recommendations</h4>
                ${result.recommendations.deficiency_recommendations.basic.map(rec => `
                  <div class="list-item">
                    <span class="list-item-icon">•</span>
                    <span>${rec}</span>
                  </div>
                `).join('')}
              </div>
              ` : ''}

              ${result.recommendations.deficiency_recommendations.management ? `
              <div class="recommendation-card">
                <h4>⚡ Advanced Management</h4>
                ${result.recommendations.deficiency_recommendations.management.map(manage => `
                  <div class="list-item">
                    <span class="list-item-icon">•</span>
                    <span>${manage}</span>
                  </div>
                `).join('')}
              </div>
              ` : ''}
            </div>
            ` : ''}

            <div class="footer">
              <p style="margin-bottom: 10px; font-size: 15px; font-weight: 500;">Generated by Leaf Analysis Studio | AI-Powered Plant Health Assessment</p>
              <p style="font-size: 13px; opacity: 0.8;">For professional agricultural advice, consult with certified experts.</p>
            </div>
          </div>
        </body>
        </html>
      `;

      // Create a temporary element to hold the HTML content
      const tempElement = document.createElement('div');
      tempElement.innerHTML = pdfContent;
      tempElement.style.position = 'absolute';
      tempElement.style.left = '-9999px';
      tempElement.style.top = '-9999px';
      tempElement.style.zIndex = '-1';
      document.body.appendChild(tempElement);

      // Configure html2pdf options for ultra-high quality
      const options = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `leaf-analysis-report-${new Date().toISOString().split('T')[0]}.pdf`,
        image: { 
          type: 'jpeg', 
          quality: 0.98 
        },
        html2canvas: {
          scale: 3,
          useCORS: true,
          allowTaint: false,
          backgroundColor: '#ffffff',
          logging: false,
          removeContainer: true,
          onclone: function(clonedDoc) {
            // Ensure all content is properly rendered
            const elements = clonedDoc.querySelectorAll('.section, .recommendation-card, .management-card');
            elements.forEach(el => {
              el.style.opacity = '1';
              el.style.transform = 'translateY(0)';
            });
          }
        },
        jsPDF: {
          unit: 'mm',
          format: 'a4',
          orientation: 'portrait',
          compress: true,
          hotfixes: ['px_scaling']
        },
        pagebreak: {
          mode: ['css', 'legacy'],
          before: '.page-break-before',
          after: '.page-break-after',
          avoid: ['img', '.recommendation-card']
        }
      };

      // Generate PDF with progress tracking
      await html2pdf().set(options).from(tempElement).save();

      // Clean up
      document.body.removeChild(tempElement);

      setPdfDownloadStatus('success');
      setPdfGenerating(false);

    } catch (err) {
      console.error('PDF generation error:', err);
      setPdfDownloadStatus('failed');
      setPdfGenerating(false);
      
      if (err.message.includes('security') || err.message.includes('tainted')) {
        alert('PDF generation failed due to security restrictions. Please try the JSON export instead.');
      } else {
        alert('PDF generation failed. The report might be too complex. Please try the JSON export or simplify the content.');
      }
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

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        
        // Wait for video to be ready
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().then(() => {
            setCameraActive(true);
            setCameraLoading(false);
          }).catch(playError => {
            console.error('Video play error:', playError);
            setCameraLoading(false);
            setError('Failed to start camera preview. The camera might be in use by another application.');
          });
        };
        
        videoRef.current.onerror = () => {
          setCameraLoading(false);
          setError('Camera hardware error occurred. Please try again.');
        };
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
  const GlassCard = ({ children, className = '', hover = true }) => (
    <div className={`
      bg-white/80 backdrop-blur-xl 
      rounded-3xl border border-white/50 
      shadow-2xl shadow-blue-500/10
      transition-all duration-500
      ${hover ? 'hover:shadow-2xl hover:shadow-purple-500/20 hover:scale-105' : ''}
      ${className}
    `}>
      {children}
    </div>
  );

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

    return (
      <button
        onClick={onClick}
        disabled={disabled || loading}
        className={`${baseClasses} ${variants[variant]} ${className} flex items-center justify-center gap-3`}
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
            <h1 className="text-5xl font-black bg-gradient-to-r from-slate-800 via-slate-700 to-slate-600 bg-clip-text text-transparent">
              Leaf Analysis Studio
            </h1>
          </div>
          <p className="text-slate-600 text-xl max-w-3xl mx-auto leading-relaxed font-medium">
            Advanced AI-powered analysis for comprehensive plant health assessment and precision disease detection
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
              <h3 className="text-3xl font-bold text-slate-800 mb-3">Initializing Camera</h3>
              <p className="text-slate-600 text-lg">Accessing your device camera...</p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Real Camera View */}
      {cameraActive && (
        <div className="space-y-8">
          <GlassCard className="p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-6 text-center flex items-center justify-center gap-3">
              <span className="text-3xl">📷</span>
              Camera Preview - Point at Leaf
            </h3>
            <div className="flex justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="max-w-full h-auto max-h-96 rounded-2xl shadow-2xl bg-black border-4 border-white/50"
                style={{ transform: 'scaleX(-1)' }}
              />
            </div>
            <div className="text-center mt-6">
              <p className="text-slate-600 text-base font-medium bg-white/50 rounded-xl py-3 px-6 inline-block backdrop-blur-sm">
                Ensure the leaf is well-lit and centered in the frame for best results
              </p>
            </div>
          </GlassCard>

          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
            <ModernButton
              onClick={capturePhoto}
              variant="primary"
              icon="📸"
            >
              Capture Photo
            </ModernButton>
            <ModernButton
              onClick={stopCamera}
              variant="danger"
              icon="❌"
            >
              Cancel Camera
            </ModernButton>
          </div>
        </div>
      )}

      {/* Capture Options */}
      {!preview && !loading && !cameraActive && !cameraLoading && (
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Enhanced Instructions */}
          <GlassCard className="p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-xl text-white">💡</span>
              </div>
              <h3 className="text-2xl font-bold text-slate-800">Capture Guidelines</h3>
            </div>
            <div className="space-y-4">
              {[
                { icon: '☀️', text: 'Good natural lighting', desc: 'Avoid shadows and direct sunlight' },
                { icon: '🎯', text: 'Center the leaf in frame', desc: 'Fill 70-80% of the frame with the leaf' },
                { icon: '📏', text: '6-12 inches distance', desc: 'Maintain optimal focus distance' },
                { icon: '🤚', text: 'Keep camera steady', desc: 'Use both hands or a stable surface' },
                { icon: '🌿', text: 'Clear background preferred', desc: 'Solid color background works best' },
                { icon: '📱', text: 'High resolution image', desc: 'Use maximum camera resolution' }
              ].map((item, index) => (
                <div key={index} className="flex items-start gap-4 p-4 rounded-xl bg-white/50 backdrop-blur-sm transition-all hover:bg-white/80 group">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{item.icon}</span>
                  <div>
                    <div className="font-semibold text-slate-800 text-lg">{item.text}</div>
                    <div className="text-slate-600 text-sm">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          {/* Enhanced Method Selection */}
          <GlassCard className="p-8">
            <h3 className="text-2xl font-bold text-slate-800 mb-8 text-center">Select Capture Method</h3>
            <div className="space-y-6">
              <ModernButton
                onClick={openCamera}
                variant="primary"
                icon="📷"
                className="w-full text-lg py-5"
                disabled={!cameraAvailable}
              >
                <div className="text-left flex-1">
                  <div className="font-bold">Open Camera</div>
                  <div className="text-sm opacity-90 font-normal">Take photo directly</div>
                </div>
              </ModernButton>
              
              <ModernButton
                onClick={openGallery}
                variant="secondary"
                icon="🖼️"
                className="w-full text-lg py-5"
              >
                <div className="text-left flex-1">
                  <div className="font-bold">From Gallery</div>
                  <div className="text-sm opacity-90 font-normal">Select existing photo</div>
                </div>
              </ModernButton>

              {!cameraAvailable && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
                  <p className="text-amber-800 text-sm font-medium">
                    📱 Camera not available. Please use gallery upload or check camera permissions.
                  </p>
                </div>
              )}
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

      {/* Enhanced Results Display */}
      {result && !error && (
        <div className="space-y-8">
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