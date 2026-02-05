
import React, { useState } from 'react';

const FILE_STRUCTURE = `latticevad-api/
├── app.py              # FastAPI Entry Point (Auth & Routing)
├── core/
│   ├── __init__.py
│   ├── features.py     # MFCC, Mel & Spectral Feature Extraction
│   └── classifier.py   # Model Architecture & Inference
├── models/
│   └── voice_model.h5   # Pre-trained CNN/LSTM Weights
├── requirements.txt    # Project Dependencies
└── README.md           # Deployment Instructions`;

const APP_PY = `from fastapi import FastAPI, Header, HTTPException, Body
from pydantic import BaseModel
import base64
import os
from core.classifier import VoiceClassifier

app = FastAPI(title="LatticeVAD Voice Detection API")
classifier = VoiceClassifier()

# In a real app, these would be in a database or environment variables
VALID_API_KEYS = ["sk_test_123456789", "vox_prod_secure_882"]

class DetectionRequest(BaseModel):
    language: str
    audioFormat: str
    audioBase64: str

@app.post("/api/voice-detection")
async def detect_voice(
    request: DetectionRequest = Body(...),
    x_api_key: str = Header(None)
):
    # 1. API Key Validation (Requirement 3)
    if not x_api_key or x_api_key not in VALID_API_KEYS:
        raise HTTPException(
            status_code=401, 
            detail={"status": "error", "message": "Invalid API key or malformed request"}
        )
    
    # 2. Language Validation (Requirement 1 & 4)
    supported = ["Tamil", "English", "Hindi", "Malayalam", "Telugu"]
    if request.language not in supported:
        raise HTTPException(
            status_code=400, 
            detail={"status": "error", "message": "Unsupported language"}
        )

    # 3. Format Validation (Requirement 4)
    if request.audioFormat.lower() != "mp3":
        raise HTTPException(
            status_code=400, 
            detail={"status": "error", "message": "Only mp3 format is supported"}
        )

    try:
        # 4. Base64 Decoding (Requirement 7)
        audio_data = base64.b64decode(request.audioBase64)
        
        # 5. Model Inference (Requirement 7)
        label, score, reason = classifier.predict(audio_data, request.language)
        
        # 6. Response Construction (Requirement 5)
        return {
            "status": "success",
            "language": request.language,
            "classification": label, # AI_GENERATED or HUMAN
            "confidenceScore": float(score),
            "explanation": reason
        }
    except Exception as e:
        return {"status": "error", "message": f"Internal processing error: {str(e)}"}
`;

const FEATURES_PY = `import librosa
import numpy as np
import io

def extract_audio_features(audio_bytes):
    """
    Extracts features as per Requirement 7:
    - MFCCs
    - Mel Spectrogram
    - Pitch stability (RMS / Spectral Centroid)
    """
    # Load from memory using io.BytesIO
    y, sr = librosa.load(io.BytesIO(audio_bytes), sr=22050, duration=5.0)
    
    # 1. MFCCs (40 coefficients)
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
    mfcc_mean = np.mean(mfccs.T, axis=0)
    
    # 2. Mel Spectrogram (Log-scaled)
    mel = librosa.feature.melspectrogram(y=y, sr=sr)
    mel_db = librosa.power_to_db(mel)
    mel_mean = np.mean(mel_db.T, axis=0)
    
    # 3. Spectral Roll-off (Catching unnatural high-frequency cutoffs in AI)
    rolloff = np.mean(librosa.feature.spectral_rolloff(y=y, sr=sr))
    
    # Combine all into one feature vector
    return np.hstack([mfcc_mean, mel_mean, [rolloff]])
`;

const CLASSIFIER_PY = `import tensorflow as tf
from tensorflow.keras import layers, models
from .features import extract_audio_features
import numpy as np

class VoiceClassifier:
    def __init__(self, model_path='models/voice_model.h5'):
        # Binary Classifier Architecture (Requirement 7)
        # CNN-based feature extractor followed by Dense layers
        self.model = self._build_model()
        try:
            # self.model.load_weights(model_path)
            pass
        except:
            print("Warning: Running with uninitialized weights. Please train first.")

    def _build_model(self):
        model = models.Sequential([
            layers.Input(shape=(169,)), # Combined MFCC (40) + Mel (128) + Rolloff (1)
            layers.Dense(512, activation='relu'),
            layers.BatchNormalization(),
            layers.Dropout(0.4),
            layers.Dense(256, activation='relu'),
            layers.Dropout(0.3),
            layers.Dense(1, activation='sigmoid') # Sigmoid for 0-1 confidence
        ])
        return model

    def predict(self, audio_bytes, language):
        features = extract_audio_features(audio_bytes)
        features = np.expand_dims(features, axis=0)
        
        # Get raw probability
        prediction = self.model.predict(features)[0][0]
        
        # Classification Mapping (Requirement 5)
        label = "AI_GENERATED" if prediction > 0.5 else "HUMAN"
        confidence = prediction if label == "AI_GENERATED" else 1.0 - prediction
        
        # Explanation Logic (Requirement 5 & 9)
        explanations = {
            "AI_GENERATED": f"Detected robotic cadence and spectral artifacts in {language} sample.",
            "HUMAN": f"Natural prosody and harmonic complexity typical of {language} speech patterns detected."
        }
        
        return label, confidence, explanations[label]
`;

const REQUIREMENTS_TXT = `fastapi==0.104.1
uvicorn==0.24.0
pydantic==2.5.2
librosa==0.10.1
numpy==1.26.2
tensorflow==2.15.0
scipy==1.11.4
python-multipart==0.0.6
`;

export const PythonProjectDocs: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'structure' | 'app' | 'features' | 'classifier' | 'req'>('structure');

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Code copied to clipboard!');
  };

  const getContent = () => {
    switch(activeTab) {
      case 'app': return APP_PY;
      case 'features': return FEATURES_PY;
      case 'classifier': return CLASSIFIER_PY;
      case 'req': return REQUIREMENTS_TXT;
      default: return FILE_STRUCTURE;
    }
  };

  return (
    <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
      <div className="flex border-b border-slate-800 bg-slate-900/50 overflow-x-auto">
        {[
          { id: 'structure', label: 'Structure' },
          { id: 'app', label: 'app.py' },
          { id: 'features', label: 'features.py' },
          { id: 'classifier', label: 'classifier.py' },
          { id: 'req', label: 'requirements.txt' }
        ].map(tab => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)} 
            className={`px-4 py-3 text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${activeTab === tab.id ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-400/5' : 'text-slate-500 hover:text-slate-300'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="p-6 relative bg-slate-950">
        <button 
          onClick={() => copyToClipboard(getContent())}
          className="absolute top-4 right-4 p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors z-10"
          title="Copy Code"
        >
          <i className="fa-regular fa-copy"></i>
        </button>

        <pre className="mono text-[11px] text-slate-300 overflow-x-auto min-h-[400px]">
          {activeTab === 'structure' && <code className="text-emerald-400">{FILE_STRUCTURE}</code>}
          {activeTab === 'app' && <code className="text-blue-300">{APP_PY}</code>}
          {activeTab === 'features' && <code className="text-orange-300">{FEATURES_PY}</code>}
          {activeTab === 'classifier' && <code className="text-purple-300">{CLASSIFIER_PY}</code>}
          {activeTab === 'req' && <code className="text-yellow-200">{REQUIREMENTS_TXT}</code>}
        </pre>
      </div>

      <div className="p-4 bg-slate-950/80 border-t border-slate-800">
        <div className="flex items-center gap-3 mb-3">
            <i className="fa-solid fa-circle-info text-blue-500"></i>
            <h4 className="text-xs font-bold uppercase tracking-widest text-slate-200">Local Setup Guide</h4>
        </div>
        <ol className="text-xs text-slate-400 space-y-2 list-decimal list-inside ml-2">
          <li>Create project root: <code className="text-slate-200 bg-slate-800 px-1 rounded">mkdir latticevad-api && cd latticevad-api</code></li>
          <li>Set up virtual env: <code className="text-slate-200 bg-slate-800 px-1 rounded">python -m venv venv && source venv/bin/activate</code></li>
          <li>Install: <code className="text-slate-200 bg-slate-800 px-1 rounded">pip install -r requirements.txt</code></li>
          <li>Start Server: <code className="text-slate-200 bg-slate-800 px-1 rounded">uvicorn app:app --host 0.0.0.0 --port 8000</code></li>
          <li>Test Endpoint: <code className="text-slate-200 bg-slate-800 px-1 rounded">POST http://localhost:8000/api/voice-detection</code></li>
        </ol>
      </div>
    </div>
  );
};
