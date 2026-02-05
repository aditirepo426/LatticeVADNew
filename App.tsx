
import React, { useState, useRef } from 'react';
import { PythonProjectDocs } from './components/PythonProjectDocs';
import { analyzeVoice } from './services/geminiService';
import { SupportedLanguage, DetectionResponse } from './types';

const App: React.FC = () => {
  const [view, setView] = useState<'tester' | 'docs'>('tester');
  
  // Form State
  const [apiKey, setApiKey] = useState('sk_test_123456789');
  const [endpointUrl, setEndpointUrl] = useState('https://latticevad.onrender.com/api/voice-detection');
  const [language, setLanguage] = useState<SupportedLanguage>('English');
  const [audioBase64, setAudioBase64] = useState('');
  
  // Status State
  const [status, setStatus] = useState<'idle' | 'processing' | 'completed' | 'error'>('idle');
  const [result, setResult] = useState<DetectionResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'audio/mpeg') {
        setErrorMsg("Error! Only MP3 files are supported.");
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        setAudioBase64(base64);
        setErrorMsg(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleTestEndpoint = async () => {
    // 1. Client-side Validation Simulation (Requirement 3)
    if (!apiKey || apiKey !== 'sk_test_123456789') {
      setErrorMsg("Error! Invalid API key or malformed request");
      setStatus('error');
      return;
    }

    if (!audioBase64) {
      setErrorMsg("Error! Please provide an audio base64 string.");
      setStatus('error');
      return;
    }

    setStatus('processing');
    setResult(null);
    setErrorMsg(null);

    try {
      // Simulate real-world network latency / processing time
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const response = await analyzeVoice(audioBase64, language);
      
      if (response.status === 'success') {
        setResult(response);
        setStatus('completed');
      } else {
        setErrorMsg(response.message || "Error! Request failed.");
        setStatus('error');
      }
    } catch (err) {
      setErrorMsg("Error! Request timed out");
      setStatus('error');
    }
  };

  const resetForm = () => {
    setAudioBase64('');
    setResult(null);
    setErrorMsg(null);
    setStatus('idle');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 font-sans pb-20">
      {/* Navigation Header */}
      <nav className="border-b border-slate-200 bg-white sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-md flex items-center justify-center">
              <i className="fa-solid fa-microchip text-white text-xs"></i>
            </div>
            <span className="font-bold text-lg text-slate-900">LatticeVAD <span className="text-blue-600">API Tester</span></span>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setView('tester')} 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'tester' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Endpoint Tester
            </button>
            <button 
              onClick={() => setView('docs')} 
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${view === 'docs' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
            >
              Backend Docs
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 pt-10">
        {view === 'docs' ? (
          <div className="animate-in fade-in slide-in-from-top-4 duration-300 space-y-8">
            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl flex gap-3 items-center">
               <i className="fa-solid fa-code text-blue-600 text-xl"></i>
               <div className="text-sm">
                  <h4 className="font-bold text-blue-900">Official Backend Implementation</h4>
                  <p className="text-blue-700">Follow the code below to implement a compliant FastAPI backend with full audio forensic features.</p>
               </div>
            </div>
            <PythonProjectDocs />
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in duration-300">
            {/* Description Section */}
            <p className="text-sm text-slate-500 leading-relaxed">
              This endpoint tester allows participants to validate their API for the AI-Generated Voice Detection problem. 
              Participants can test authentication, request handling, audio input processing, and response structure by sending 
              a sample voice input to their deployed API endpoint before final evaluation.
            </p>

            <div className="space-y-6">
              {/* Headers Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <label className="block text-sm font-bold text-slate-700 mb-4">Headers <span className="text-red-500">*</span></label>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">x-api-key <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-400/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-700 text-sm shadow-sm"
                    placeholder="sk_test_..."
                  />
                </div>
              </div>

              {/* Endpoint URL Section */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-700">Endpoint URL <span className="text-red-500">*</span></label>
                <input 
                  type="text" 
                  value={endpointUrl}
                  onChange={(e) => setEndpointUrl(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-blue-400/50 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-slate-700 text-sm shadow-sm"
                  placeholder="https://..."
                />
              </div>

              {/* Request Body Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 space-y-6">
                <label className="block text-sm font-bold text-slate-700 mb-2">Request Body <span className="text-red-500">*</span></label>
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">Language <span className="text-red-500">*</span></label>
                  <select 
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as SupportedLanguage)}
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-400/50 bg-white focus:border-blue-500 outline-none text-slate-700 text-sm"
                  >
                    <option>English</option>
                    <option>Tamil</option>
                    <option>Hindi</option>
                    <option>Malayalam</option>
                    <option>Telugu</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600">Audio Format <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value="mp3" 
                    disabled 
                    className="w-full px-4 py-2.5 rounded-lg border border-blue-400/50 bg-white text-slate-500 text-sm italic"
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-xs font-bold text-slate-600">Audio Base64 Format <span className="text-red-500">*</span></label>
                    <button 
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[10px] font-bold text-blue-600 hover:underline uppercase"
                    >
                      Helper: Upload MP3
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".mp3" className="hidden" />
                  </div>
                  <textarea 
                    value={audioBase64}
                    onChange={(e) => setAudioBase64(e.target.value)}
                    rows={5}
                    className="w-full px-4 py-3 rounded-lg border border-blue-400/50 focus:border-blue-500 outline-none text-slate-700 text-xs font-mono resize-none shadow-sm"
                    placeholder="SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU2LjM2LjEwMAAAAAAA..."
                  />
                </div>
              </div>

              {/* Test Result Section */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 min-h-[120px] flex flex-col justify-center">
                <label className="block text-sm font-bold text-slate-700 mb-4">Test Result</label>
                
                {status === 'idle' && (
                  <div className="text-slate-400 text-xs text-center border-2 border-dashed border-slate-200 rounded-lg py-4">
                    No tests executed yet
                  </div>
                )}

                {status === 'processing' && (
                  <div className="flex items-center justify-center gap-3 py-4">
                    <i className="fa-solid fa-circle-notch fa-spin text-blue-500"></i>
                    <span className="text-sm text-slate-500 font-medium">Validating API Endpoint...</span>
                  </div>
                )}

                {status === 'error' && errorMsg && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3 animate-in zoom-in-95 duration-200">
                    <div className="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center text-red-600">
                      <i className="fa-solid fa-xmark text-sm"></i>
                    </div>
                    <span className="text-sm font-bold text-red-800">
                      {errorMsg}
                    </span>
                  </div>
                )}

                {status === 'completed' && result && (
                  <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 animate-in zoom-in-95 duration-200">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                        <i className="fa-solid fa-check text-sm"></i>
                      </div>
                      <span className="text-sm font-bold text-emerald-800">Success! Analysis Complete</span>
                    </div>
                    <div className="bg-white rounded-lg p-4 border border-emerald-100 space-y-2">
                       <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs">
                          <span className="text-slate-500 font-medium uppercase tracking-wider">Classification:</span>
                          <span className={`font-bold ${result.classification === 'AI_GENERATED' ? 'text-red-500' : 'text-emerald-600'}`}>{result.classification}</span>
                          
                          <span className="text-slate-500 font-medium uppercase tracking-wider">Confidence:</span>
                          <span className="font-bold text-slate-800">{(result.confidenceScore || 0).toFixed(2)}</span>
                          
                          <span className="text-slate-500 font-medium uppercase tracking-wider">Language:</span>
                          <span className="font-bold text-slate-800">{result.language}</span>
                       </div>
                       <div className="pt-2 mt-2 border-t border-slate-50">
                          <p className="text-[11px] text-slate-600 leading-relaxed italic">
                            "{result.explanation}"
                          </p>
                       </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <button 
                  onClick={resetForm}
                  className="px-8 py-2.5 rounded-lg border border-slate-300 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleTestEndpoint}
                  disabled={status === 'processing'}
                  className={`px-8 py-2.5 rounded-lg font-bold text-sm text-white shadow-lg transition-all ${status === 'processing' ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-700 hover:bg-blue-800 active:scale-95'}`}
                >
                  Test Endpoint
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
