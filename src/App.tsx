import React, { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { Playground } from './components/Playground';
import { DiffViewer } from './components/DiffViewer';
import './App.css';

function App() {
  const [activeTab, setActiveTab] = useState<'playground' | 'diff'>('playground');

  return (
    <div className="app-container">
      <header className="header" role="banner">
        <div className="logo-section">
          <Sparkles className="logo-icon" size={24} aria-hidden="true" />
          <span className="logo-text">Company X Developer Portal</span>
        </div>
        
        <nav className="nav-links" role="navigation" aria-label="Main Navigation">
          <button 
            className={`nav-item ${activeTab === 'playground' ? 'active' : ''}`}
            onClick={() => setActiveTab('playground')}
            aria-current={activeTab === 'playground' ? 'page' : undefined}
          >
            Inference Playground
          </button>
          <button 
            className={`nav-item ${activeTab === 'diff' ? 'active' : ''}`}
            onClick={() => setActiveTab('diff')}
            aria-current={activeTab === 'diff' ? 'page' : undefined}
          >
            Output Diff Viewer
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeTab === 'playground' ? <Playground /> : <DiffViewer />}
      </main>
    </div>
  );
}

export default App;
