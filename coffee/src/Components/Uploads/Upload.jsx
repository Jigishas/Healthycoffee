 import React, { useState, useRef } from 'react';

const BACKEND_URL = 'https://healthycoffee.onrender.com';

const Upload = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files && e.target.files[0];
    setSelectedFile(file || null);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview('');
    }
    setStatus('');
    setResults(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setStatus('Please select an image to upload.');
      return;
    }

    setLoading(true);
    setStatus('Uploading...');

    const formData = new FormData();
    formData.append('image', selectedFile);
    if (description.trim()) formData.append('description', description.trim());

    try {
      const res = await fetch(`${BACKEND_URL}/api/upload-image`, {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        const text = await res.text().catch(() => '');
        console.error('Upload error response:', res.status, text);
        setStatus(`Upload failed: ${res.status} ${res.statusText}`);
        setLoading(false);
        return;
      }

      const json = await res.json().catch(() => null);
      if (json && (json.disease_prediction || json.deficiency_prediction)) {
        setResults(json);
        setStatus('Diagnosis completed.');
      } else if (json && json.model_response) {
        setStatus('Uploaded. Model returned a response.');
      } else {
        setStatus('Uploaded successfully.');
      }

      // cleanup UI
      setSelectedFile(null);
      setPreview('');
      setDescription('');
    } catch (err) {
      console.error('Network/upload error:', err);
      setStatus('Error uploading the photo. Check backend URL and CORS.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-2xl shadow-xl border border-slate-100">
      <h2 className="text-2xl md:text-3xl font-bold text-center mb-4 text-slate-800">Upload Your Leaf Image</h2>
      <p className="text-center text-sm text-slate-600 mb-6">Use a clear, well-lit photo of the leaf for best results.</p>

      <input
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        ref={fileInputRef}
        onChange={handleFileChange}
      />
      <div className="flex justify-center mb-6">
        <label htmlFor="file-input" className={`cta-button text-sm ${loading ? 'opacity-60 cursor-wait' : ''} inline-flex items-center gap-2`}>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
            <path d="M3 7a2 2 0 012-2h3l2 2h6a2 2 0 012 2v7a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
            <path d="M8 12l3 3 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round"/>
          </svg>
          <span>Choose image</span>
        </label>
        <input
          id="file-input"
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          ref={fileInputRef}
          onChange={handleFileChange}
          aria-label="Choose an image to upload"
        />
      </div>
  <h2 className="text-xl md:text-2xl font-bold text-center mb-3 text-slate-800">Upload leaf image</h2>
  <p className="text-center text-sm text-slate-600 mb-4">Use a clear, well-lit photo.</p>

      {preview && (
        <div className="space-y-6">
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="max-w-full h-auto max-h-80 rounded-xl shadow-lg border-2 border-blue-200"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent rounded-xl"></div>
            </div>
          </div>

          <textarea
            className="w-full p-3 border-2 border-blue-200 rounded-xl bg-white/80 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 resize-none shadow-lg text-sm"
            placeholder="Optional: short note"
            value={description}
            onChange={e => setDescription(e.target.value)}
            rows={3}
          />

          <div className="flex justify-center gap-4">
            <button
              className={`cta-button ${loading ? 'opacity-60 cursor-wait' : ''}`}
              onClick={handleUpload}
              disabled={loading}
              aria-live="polite"
            >
              <span className="text-lg">📤</span>
              {loading ? 'Sending...' : 'Analyze'}
            </button>
            <button
              className="cta-ghost"
              onClick={() => { setSelectedFile(null); setPreview(''); setStatus(''); setResults(null); }}
              disabled={loading}
            >
              Remove
            </button>
          </div>
        </div>
      )}

      {status && (
        <div className={`mt-6 p-4 rounded-xl text-center font-medium shadow-md ${
          status.includes('success') || status.includes('completed') || status.includes('Diagnosis')
            ? 'bg-green-100 border border-green-300 text-green-800'
            : status.includes('error') || status.includes('failed')
            ? 'bg-red-100 border border-red-300 text-red-800'
            : 'bg-blue-100 border border-blue-300 text-blue-800'
        }`}>
          {status}
        </div>
      )}

      {results && (
        <div className="results-container">
          {results.deficiency_prediction && (
            <div className="result-section deficiency">
              <h3>Nutrient Deficiency Analysis</h3>
              <p><strong>Predicted Deficiency:</strong> {results.deficiency_prediction.class}</p>
              <p><strong>Confidence:</strong> {Math.round((results.deficiency_prediction.confidence || 0) * 100)}%</p>
              {results.deficiency_prediction.explanation && <p><strong>Explanation:</strong> {results.deficiency_prediction.explanation}</p>}
              {results.deficiency_prediction.recommendation && <p><strong>Recommendation:</strong> {results.deficiency_prediction.recommendation}</p>}
            </div>
          )}
          {results.disease_prediction && (
            <div className="result-section disease">
              <h3>Disease Analysis</h3>
              <p><strong>Predicted Disease:</strong> {results.disease_prediction.class}</p>
              <p><strong>Confidence:</strong> {Math.round((results.disease_prediction.confidence || 0) * 100)}%</p>
              {results.disease_prediction.explanation && <p><strong>Explanation:</strong> {results.disease_prediction.explanation}</p>}
              {results.disease_prediction.recommendation && <p><strong>Recommendation:</strong> {results.disease_prediction.recommendation}</p>}
            </div>
          )}

          {results.translated_recommendations && (
            <div className="result-section translated">
              <h3>Translated Recommendations</h3>
              {results.translated_recommendations.disease_explanation && (
                <div>
                  <h4>Disease Explanation</h4>
                  <p>{results.translated_recommendations.disease_explanation}</p>
                </div>
              )}
              {results.translated_recommendations.disease_recommendation && (
                <div>
                  <h4>Disease Recommendation</h4>
                  <p>{results.translated_recommendations.disease_recommendation}</p>
                </div>
              )}
              {results.translated_recommendations.deficiency_explanation && (
                <div>
                  <h4>Deficiency Explanation</h4>
                  <p>{results.translated_recommendations.deficiency_explanation}</p>
                </div>
              )}
              {results.translated_recommendations.deficiency_recommendation && (
                <div>
                  <h4>Deficiency Recommendation</h4>
                  <p>{results.translated_recommendations.deficiency_recommendation}</p>
                </div>
              )}
            </div>
          )}

          {results.recommendations && results.recommendations.disease_recommendations && (
            <div className="result-section additional">
              <h3>Disease Recommendations</h3>
              {results.recommendations.disease_recommendations.overview && <p><strong>Overview:</strong> {results.recommendations.disease_recommendations.overview}</p>}
              {results.recommendations.disease_recommendations.symptoms && results.recommendations.disease_recommendations.symptoms.length > 0 && (
                <div>
                  <p><strong>Symptoms:</strong></p>
                  <button>
                    className={`cta-button text-sm ${loading ? 'opacity-60 cursor-wait' : ''}`}
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                </div>
                    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                      <path d="M12 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 7l4-4 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M21 21H3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
              {results.recommendations.disease_recommendations.integrated_management && (
                <div>
                  <h4>Integrated Management</h4>
                  {results.recommendations.disease_recommendations.integrated_management.cultural_practices && results.recommendations.disease_recommendations.integrated_management.cultural_practices.length > 0 && (
                    <div>
                      <p><strong>Cultural Practices:</strong></p>
                      <ul>
                        {results.recommendations.disease_recommendations.integrated_management.cultural_practices.map((practice, index) => (
                          <li key={index}>{practice}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {results.recommendations.disease_recommendations.integrated_management.chemical_control && results.recommendations.disease_recommendations.integrated_management.chemical_control.length > 0 && (
                    <div>
                      <p><strong>Chemical Control:</strong></p>
                      <ul>
                        {results.recommendations.disease_recommendations.integrated_management.chemical_control.map((control, index) => (
                          <li key={index}>{control}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {results.recommendations.disease_recommendations.integrated_management.biological_control && results.recommendations.disease_recommendations.integrated_management.biological_control.length > 0 && (
                    <div>
                      <p><strong>Biological Control:</strong></p>
                      <ul>
                        {results.recommendations.disease_recommendations.integrated_management.biological_control.map((control, index) => (
                          <li key={index}>{control}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {results.recommendations.disease_recommendations.integrated_management.monitoring && results.recommendations.disease_recommendations.integrated_management.monitoring.length > 0 && (
                    <div>
                      <p><strong>Monitoring:</strong></p>
                      <ul>
                        {results.recommendations.disease_recommendations.integrated_management.monitoring.map((monitor, index) => (
                          <li key={index}>{monitor}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {results.recommendations.disease_recommendations.severity_specific_recommendations && (
                <div>
                  <h4>Severity Specific Recommendations</h4>
                  <p><strong>Spray Frequency:</strong> {results.recommendations.disease_recommendations.severity_specific_recommendations.spray_frequency}</p>
                  <p><strong>Intervention Level:</strong> {results.recommendations.disease_recommendations.severity_specific_recommendations.intervention_level}</p>
                  {results.recommendations.disease_recommendations.severity_specific_recommendations.immediate_actions && results.recommendations.disease_recommendations.severity_specific_recommendations.immediate_actions.length > 0 && (
                    <div>
                      <p><strong>Immediate Actions:</strong></p>
                      <ul>
                        {results.recommendations.disease_recommendations.severity_specific_recommendations.immediate_actions.map((action, index) => (
                          <li key={index}>{action}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {results.recommendations.disease_recommendations.severity_specific_recommendations.long_term_strategies && results.recommendations.disease_recommendations.severity_specific_recommendations.long_term_strategies.length > 0 && (
                    <div>
                      <p><strong>Long-term Strategies:</strong></p>
                      <ul>
                        {results.recommendations.disease_recommendations.severity_specific_recommendations.long_term_strategies.map((strategy, index) => (
                          <li key={index}>{strategy}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {results.recommendations.disease_recommendations.monitoring_schedule && (
                <div>
                  <h4>Monitoring Schedule</h4>
                  <p><strong>Inspection Frequency:</strong> {results.recommendations.disease_recommendations.monitoring_schedule.inspection_frequency}</p>
                  <p><strong>Data Recording:</strong> {results.recommendations.disease_recommendations.monitoring_schedule.data_recording}</p>
                  <p><strong>Action Thresholds:</strong> {results.recommendations.disease_recommendations.monitoring_schedule.action_thresholds}</p>
                  <p><strong>Weather Monitoring:</strong> {results.recommendations.disease_recommendations.monitoring_schedule.weather_monitoring}</p>
                </div>
              )}
              {results.recommendations.disease_recommendations.economic_considerations && (
                <div>
                  <h4>Economic Considerations</h4>
                  <p><strong>Management Cost (USD/ha):</strong> {results.recommendations.disease_recommendations.economic_considerations.management_cost_usd_per_ha}</p>
                  <p><strong>Potential Yield Loss (%):</strong> {results.recommendations.disease_recommendations.economic_considerations.potential_yield_loss_percent}</p>
                  <p><strong>Return on Investment:</strong> {results.recommendations.disease_recommendations.economic_considerations.return_on_investment}</p>
                  <p><strong>Economic Threshold:</strong> {results.recommendations.disease_recommendations.economic_considerations.economic_threshold}</p>
                  {results.recommendations.disease_recommendations.economic_considerations.cost_effective_strategies && results.recommendations.disease_recommendations.economic_considerations.cost_effective_strategies.length > 0 && (
                    <div>
                      <p><strong>Cost Effective Strategies:</strong></p>
                      <ul>
                        {results.recommendations.disease_recommendations.economic_considerations.cost_effective_strategies.map((strategy, index) => (
                          <li key={index}>{strategy}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {results.recommendations.disease_recommendations.emergency_measures && (
                <div>
                  <h4>Emergency Measures</h4>
                  {results.recommendations.disease_recommendations.emergency_measures.high_infection && results.recommendations.disease_recommendations.emergency_measures.high_infection.length > 0 && (
                    <div>
                      <p><strong>High Infection:</strong></p>
                      <ul>
                        {results.recommendations.disease_recommendations.emergency_measures.high_infection.map((measure, index) => (
                          <li key={index}>{measure}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {results.recommendations.disease_recommendations.emergency_measures.preventive_protocol && results.recommendations.disease_recommendations.emergency_measures.preventive_protocol.length > 0 && (
                    <div>
                      <p><strong>Preventive Protocol:</strong></p>
                      <ul>
                        {results.recommendations.disease_recommendations.emergency_measures.preventive_protocol.map((protocol, index) => (
                          <li key={index}>{protocol}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}
              {results.recommendations.disease_recommendations.resistant_varieties && results.recommendations.disease_recommendations.resistant_varieties.length > 0 && (
                <div>
                  <h4>Resistant Varieties</h4>
                  <ul>
                    {results.recommendations.disease_recommendations.resistant_varieties.map((variety, index) => (
                      <li key={index}>
                        <strong>{variety.name}</strong> - {variety.resistance_level} resistance<br/>
                        <em>Characteristics:</em> {variety.characteristics}<br/>
                        <em>Adaptation:</em> {variety.adaptation}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {results.recommendations && results.recommendations.deficiency_recommendations && (
            <div className="result-section nutrition">
              <h3>Nutrition Recommendations</h3>
              {results.recommendations.deficiency_recommendations.symptoms && results.recommendations.deficiency_recommendations.symptoms.length > 0 && (
                <div>
                  <p><strong>Symptoms:</strong></p>
                  <ul>
                    {results.recommendations.deficiency_recommendations.symptoms.map((symptom, index) => (
                      <li key={index}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              )}
              {results.recommendations.deficiency_recommendations.basic && results.recommendations.deficiency_recommendations.basic.length > 0 && (
                <div>
                  <p><strong>Basic Recommendations:</strong></p>
                  <ul>
                    {results.recommendations.deficiency_recommendations.basic.map((rec, index) => (
                      <li key={index}>{rec}</li>
                    ))}
                  </ul>
                </div>
              )}
              {results.recommendations.deficiency_recommendations.management && results.recommendations.deficiency_recommendations.management.length > 0 && (
                <div>
                  <p><strong>Management:</strong></p>
                  <ul>
                    {results.recommendations.deficiency_recommendations.management.map((manage, index) => (
                      <li key={index}>{manage}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Upload;