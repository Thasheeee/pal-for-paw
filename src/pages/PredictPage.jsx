import React, { useState } from 'react';
import { Sparkles, Upload, Camera, AlertCircle, X, Image as ImageIcon } from 'lucide-react';

// --- 1. STATIC DATA FOR UI RICHNESS ---
// The AI returns just the disease name. We use this to look up the "Severity" and "Recommendation" 
// so your UI remains beautiful and informative.
const diseaseDetails = {
  'ringworm': {
    severity: 'Moderate',
    recommendation: 'Highly contagious. Isolate pet and wash hands after touching. Use antifungal shampoo or ointment prescribed by a vet.'
  },
  'demodicosis': {
    severity: 'Moderate',
    recommendation: 'Caused by mites. Requires veterinary diagnosis for specific miticide treatment. Immune support is often needed.'
  },
  'Fungal_infections': {
    severity: 'Low',
    recommendation: 'Keep the area dry and clean. Anti-fungal creams/sprays are usually effective. Check for underlying allergies.'
  },
  'Dermatitis': {
    severity: 'High',
    recommendation: 'Likely caused by infection or allergy. Look for hot spots. Antibiotics or steroids may be required to stop itching.'
  },
  'Hypersensitivity': {
    severity: 'Low',
    recommendation: 'Allergic reaction (fleas, food, or environment). Identification of the allergen is key. Antihistamines may help.'
  },
  'Healthy': {
    severity: 'None',
    recommendation: 'Great news! Your dog\'s skin looks healthy. Maintain regular grooming and check-ups.'
  }
};

const PredictPage = ({ user, role, navigateTo }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [imagePreview, setImagePreview] = useState(null);
  
  // NEW: Store the raw file for the API
  const [selectedFile, setSelectedFile] = useState(null); 
  
  const [symptoms, setSymptoms] = useState('');
  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // 1. Save File for API
      setSelectedFile(file);
      
      // 2. Create Preview for UI
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      // Clear previous results
      setPrediction(null);
    }
  };

  const handlePredict = async () => {
    setLoading(true);
    setPrediction(null);

    const BACKEND_URL = "http://localhost:5000"; // Your Flask URL
    let endpoint = "";
    let body = null;
    let headers = {};

    // --- STEP 1: PREPARE DATA BASED ON TAB ---
    if (activeTab === 'upload') {
      if (!selectedFile) {
        alert("Please select an image first.");
        setLoading(false);
        return;
      }
      endpoint = `${BACKEND_URL}/predict_image`;
      const formData = new FormData();
      formData.append('image', selectedFile);
      body = formData;
      // Note: Do NOT set Content-Type header for FormData, browser does it automatically
    } else {
      if (!symptoms.trim()) {
        alert("Please describe the symptoms.");
        setLoading(false);
        return;
      }
      endpoint = `${BACKEND_URL}/predict_text`;
      body = JSON.stringify({ text: symptoms });
      headers = { 'Content-Type': 'application/json' };
    }

    // --- STEP 2: CALL FLASK API ---
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: body,
      });

      const data = await response.json();

      if (response.ok) {
        // --- STEP 3: FORMAT RESULT FOR UI ---
        // Get the static details (Severity/Recommendation) based on the AI's result
        const details = diseaseDetails[data.disease] || { 
          severity: 'Unknown', 
          recommendation: 'Please consult a vet for specific advice.' 
        };

        // Clean up the confidence score string (remove '%' if present to parse it)
        const rawConf = typeof data.confidence === 'string' 
          ? parseFloat(data.confidence.replace('%', '')) 
          : data.confidence;

        setPrediction({
          disease: data.disease,
          confidence: rawConf, 
          recommendation: details.recommendation,
          severity: details.severity
        });
      } else {
        alert("Server Error: " + (data.error || "Unknown error"));
      }
    } catch (error) {
      console.error("Connection Error:", error);
      alert("Failed to connect to the Server. Is 'python server.py' running?");
    } finally {
      setLoading(false);
    }
  };

  if (!user || role !== 'user') {
    return (
      <div className="page">
        <div className="restriction-message">
          <AlertCircle size={64} />
          <h2>Login Required</h2>
          <p>Please login as a dog owner to access disease prediction</p>
          <button className="btn-primary" onClick={() => navigateTo('login')}>
            Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>
          <Sparkles size={36} />
          Dermatological Analysis
        </h1>
        <p>Upload an image or describe symptoms for analysis</p>
      </div>

      <div className="predict-container">
        <div className="tab-buttons">
          <button
            className={`tab-btn ${activeTab === 'upload' ? 'active' : ''}`}
            onClick={() => setActiveTab('upload')}
          >
            <Upload size={20} />
            Upload Image
          </button>
          <button
            className={`tab-btn ${activeTab === 'symptoms' ? 'active' : ''}`}
            onClick={() => setActiveTab('symptoms')}
          >
            <Camera size={20} />
            Describe Symptoms
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'upload' ? (
            <div className="upload-section">
              <div className="upload-box">
                {imagePreview ? (
                  <div className="image-preview">
                    <img src={imagePreview} alt="Uploaded dog image for skin analysis" />

                    <button className="remove-image" onClick={() => {
                        setImagePreview(null);
                        setSelectedFile(null); // Clear file too
                        setPrediction(null);
                    }}>
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <label className="upload-label">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      style={{ display: 'none' }}
                    />
                    <ImageIcon size={48} />
                    <p>Drag & drop an image here</p>
                    <span>or click to browse</span>
                  </label>
                )}
              </div>
            </div>
          ) : (
            <div className="symptoms-section">
              <textarea
                className="symptoms-input"
                placeholder="Describe symptoms like itching, redness, hair loss, bumps, skin irritation..."
                rows="8"
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              ></textarea>
            </div>
          )}

          <button
            className="btn-primary btn-large"
            onClick={handlePredict}
            disabled={loading || (activeTab === 'upload' ? !imagePreview : !symptoms)}
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles size={20} />
                Predict Skin Disease
              </>
            )}
          </button>

          {prediction && (
            <div className="prediction-result">
              <div className="result-header">
                <h3>Prediction Result</h3>
                <div className={`severity-badge ${prediction.severity.toLowerCase()}`}>
                  {prediction.severity}
                </div>
              </div>
              <div className="result-content">
                <div className="result-item">
                  <label>Detected Condition:</label>
                  <span className="disease-name">{prediction.disease}</span>
                </div>
                <div className="result-item">
                  <label>Confidence Score:</label>
                  <div className="confidence-bar">
                    <div className="confidence-fill" style={{ width: `${prediction.confidence}%` }}>
                      {prediction.confidence.toFixed(1)}%
                    </div>
                  </div>
                </div>
                <div className="result-item">
                  <label>Recommendation:</label>
                  <p>{prediction.recommendation}</p>
                </div>
              </div>
              <div className="result-disclaimer">
                <AlertCircle size={16} />
                <span>This is a computational prediction. Please consult a veterinarian for accurate diagnosis.</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PredictPage;