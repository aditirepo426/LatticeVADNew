
import React, { useState } from 'react';

export const BackendCodeSection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  const pythonCode = `import librosa
import numpy as np
import tensorflow as tf
from tensorflow.keras import layers, models

def extract_features(file_path):
    # Load audio
    y, sr = librosa.load(file_path, duration=3.0)
    
    # Extract MFCCs
    mfccs = librosa.feature.mfcc(y=y, sr=sr, n_mfcc=40)
    mfccs_scaled = np.mean(mfccs.T, axis=0)
    
    # Extract Mel Spectrogram
    mel = librosa.feature.melspectrogram(y=y, sr=sr)
    mel_scaled = np.mean(librosa.power_to_db(mel).T, axis=0)
    
    return np.hstack([mfccs_scaled, mel_scaled])

def create_model(input_shape):
    model = models.Sequential([
        layers.Dense(256, activation='relu', input_shape=(input_shape,)),
        layers.Dropout(0.3),
        layers.Dense(128, activation='relu'),
        layers.Dropout(0.3),
        layers.Dense(64, activation='relu'),
        layers.Dense(1, activation='sigmoid') # Binary: Human vs AI
    ])
    model.compile(optimizer='adam', loss='binary_crossentropy', metrics=['accuracy'])
    return model

# Expected structure:
# dataset/
#   human/ (wav files)
#   ai/ (wav files)`;

  return (
    <div className="mt-12 bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex justify-between items-center text-slate-200 hover:bg-slate-700 transition-colors"
      >
        <div className="flex items-center gap-3">
          <i className="fa-brands fa-python text-yellow-500 text-xl"></i>
          <span className="font-semibold">Project Implementation Details (Python/ML)</span>
        </div>
        <i className={`fa-solid fa-chevron-${isOpen ? 'up' : 'down'}`}></i>
      </button>
      
      {isOpen && (
        <div className="p-6 bg-slate-900">
          <p className="text-sm text-slate-400 mb-4">
            For your college project documentation, here is the architecture overview and the core Python logic using 
            <span className="text-blue-400"> librosa</span> and <span className="text-blue-400">TensorFlow</span>.
          </p>
          
          <div className="mb-6">
            <h4 className="text-blue-400 font-medium mb-2">Model Architecture (CNN-Based)</h4>
            <ul className="text-sm text-slate-300 list-disc list-inside space-y-1">
              <li>Input: 128-bin Mel Spectrogram (Time-Frequency representation)</li>
              <li>Conv2D Layers: Extract spatial features from spectrograms</li>
              <li>Global Average Pooling: Reduce dimensionality</li>
              <li>Dense Layers: Final classification with Sigmoid activation</li>
              <li>Loss Function: Binary Cross-Entropy</li>
            </ul>
          </div>

          <pre className="mono text-xs bg-black p-4 rounded-lg text-green-400 overflow-x-auto">
            {pythonCode}
          </pre>
        </div>
      )}
    </div>
  );
};
