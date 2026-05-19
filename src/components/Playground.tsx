import React, { useState, useRef, useEffect } from 'react';
import { Mic, Type, Play, Square, AlertCircle, Zap, Hash } from 'lucide-react';
import { simulateStreamingResponse } from '../lib/mockApi';

export const Playground: React.FC = () => {
  const [inputMode, setInputMode] = useState<'text' | 'audio'>('text');
  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [tokenCount, setTokenCount] = useState(0);
  const [tokensPerSecond, setTokensPerSecond] = useState(0);
  const [simulateError, setSimulateError] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const outputPanelRef = useRef<HTMLDivElement>(null);

  const handleToggleMode = (mode: 'text' | 'audio') => {
    setInputMode(mode);
    if (mode === 'audio' && isRecording) {
      setIsRecording(false);
    }
  };

  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInputText(transcript);
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    }
  }, []);

  const handleToggleRecording = () => {
    if (!recognitionRef.current) {
      alert("Speech Recognition API is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    if (!isRecording) {
      setIsRecording(true);
      setInputText('');
      try {
        recognitionRef.current.start();
      } catch (e) {
        console.error(e);
      }
    } else {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleSubmit = async () => {
    if (!inputText.trim()) return;

    // Reset state
    setOutput('');
    setError(null);
    setTokenCount(0);
    setTokensPerSecond(0);
    setIsGenerating(true);
    startTimeRef.current = performance.now();

    // Cancel any ongoing request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      // Replace with actual fetch to backend in a real app
      // const response = await fetch('/api/generate', { ... });
      const response = simulateStreamingResponse(inputText, simulateError);

      if (!response.body) {
        throw new Error("ReadableStream not supported in this browser.");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentOutput = '';
      let currentTokenCount = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        
        // Count tokens (simplified as space-separated words for this assignment)
        const newTokens = chunk.trim().split(/\s+/).filter(t => t.length > 0).length;
        currentTokenCount += newTokens;
        
        currentOutput += chunk;
        setOutput(currentOutput);
        setTokenCount(currentTokenCount);
        
        // Update tokens per second metric
        if (startTimeRef.current) {
          const elapsedSeconds = (performance.now() - startTimeRef.current) / 1000;
          if (elapsedSeconds > 0) {
            setTokensPerSecond(Math.round((currentTokenCount / elapsedSeconds) * 10) / 10);
          }
        }
        
        // Auto-scroll to bottom
        if (outputPanelRef.current) {
          outputPanelRef.current.scrollTop = outputPanelRef.current.scrollHeight;
        }
      }
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.log('Request aborted');
      } else {
        setError(err.message || 'An unexpected error occurred during generation.');
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  };

  return (
    <div className="playground-container" role="main" aria-label="Inference Playground">
      <h2 className="page-title">Inference Playground</h2>
      <p className="page-subtitle">Test multi-modal inputs and visualize token-by-token streaming responses.</p>
      
      {/* Settings toggle for demo purposes */}
      <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <input 
          type="checkbox" 
          id="simulate-error" 
          checked={simulateError}
          onChange={(e) => setSimulateError(e.target.checked)}
          aria-label="Simulate mid-stream error"
        />
        <label htmlFor="simulate-error" className="input-label" style={{ cursor: 'pointer' }}>
          Simulate mid-stream network failure (for testing Error Handling)
        </label>
      </div>

      <div className="playground-grid">
        {/* Input Panel */}
        <div className="glass-panel input-panel" aria-label="Input Configuration Panel">
          <div className="panel-header">
            <h3 className="panel-title">Input Configuration</h3>
          </div>
          
          <div className="input-content">
            <div className="input-mode-toggle" role="group" aria-label="Input mode selection">
              <button 
                className={`mode-btn ${inputMode === 'text' ? 'active' : ''}`}
                onClick={() => handleToggleMode('text')}
                aria-pressed={inputMode === 'text'}
              >
                <Type size={18} aria-hidden="true" />
                Text Input
              </button>
              <button 
                className={`mode-btn ${inputMode === 'audio' ? 'active' : ''}`}
                onClick={() => handleToggleMode('audio')}
                aria-pressed={inputMode === 'audio'}
              >
                <Mic size={18} aria-hidden="true" />
                Audio Input
              </button>
            </div>

            {inputMode === 'text' ? (
              <textarea
                id="prompt-input"
                className="textarea-input"
                placeholder="Enter your prompt here..."
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                disabled={isGenerating}
                aria-label="Text prompt input"
              />
            ) : (
              <div className="audio-input-area" aria-live="polite">
                <button 
                  className={`mic-btn ${isRecording ? 'recording' : ''}`}
                  onClick={handleToggleRecording}
                  disabled={isGenerating}
                  aria-label={isRecording ? "Stop recording" : "Start recording"}
                >
                  {isRecording ? <Square size={32} /> : <Mic size={32} />}
                </button>
                <p style={{ color: 'var(--text-secondary)' }}>
                  {isRecording ? 'Listening...' : 'Click to speak'}
                </p>
                {inputText && !isRecording && (
                  <p style={{ marginTop: '1rem', fontStyle: 'italic' }}>
                    "{inputText}"
                  </p>
                )}
              </div>
            )}

            <button 
              className="submit-btn"
              onClick={isGenerating ? handleStop : handleSubmit}
              disabled={(!inputText.trim() && !isGenerating) || (inputMode === 'audio' && isRecording)}
              aria-label={isGenerating ? "Stop generation" : "Run inference"}
            >
              {isGenerating ? (
                <>
                  <Square size={18} aria-hidden="true" />
                  Stop Generation
                </>
              ) : (
                <>
                  <Play size={18} aria-hidden="true" />
                  Run Inference
                </>
              )}
            </button>
          </div>
        </div>

        {/* Output Panel */}
        <div className="glass-panel output-panel" aria-label="Model Output Panel">
          <div className="panel-header">
            <h3 className="panel-title">Model Output</h3>
          </div>
          
          <div className="output-content" ref={outputPanelRef} aria-live="polite">
            {!output && !isGenerating && !error && (
              <div className="empty-state">
                <Zap size={32} aria-hidden="true" />
                <p>Output will stream here...</p>
              </div>
            )}
            
            {error && (
              <div className="error-banner" role="alert">
                <AlertCircle size={20} className="error-icon" aria-hidden="true" />
                <div>
                  <strong>Generation Failed</strong>
                  <p>{error}</p>
                </div>
              </div>
            )}
            
            <div className="output-text">
              {output}
              {isGenerating && <span className="blinking-cursor">|</span>}
            </div>
          </div>

          {/* Live Metrics */}
          <div className="metrics-bar" aria-label="Generation Metrics">
            <div className="metric" title="Tokens Processed">
              <Hash size={16} aria-hidden="true" />
              <span>Tokens: <span className="metric-value">{tokenCount}</span></span>
            </div>
            <div className="metric" title="Tokens Per Second">
              <Zap size={16} aria-hidden="true" />
              <span>Speed: <span className="metric-value">{tokensPerSecond} t/s</span></span>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .blinking-cursor {
          display: inline-block;
          animation: blink 1s step-end infinite;
          margin-left: 2px;
          color: var(--accent-color);
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </div>
  );
};
