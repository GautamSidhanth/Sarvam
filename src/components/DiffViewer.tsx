import React, { useState, useMemo } from 'react';

type DiffToken = {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
};

// Tokenizer: Splits text into words and whitespaces/punctuation to preserve exact formatting
const tokenize = (text: string): string[] => {
  if (!text) return [];
  // Match contiguous non-whitespace or contiguous whitespace
  return text.match(/(\s+|\S+)/g) || [];
};

// Greedy Lookahead Diffing Algorithm
// Time Complexity: O(N * L^2) where N is length and L is maxLookahead
const computeTokenDiff = (oldText: string, newText: string, maxLookahead: number = 15): DiffToken[] => {
  const oldTokens = tokenize(oldText);
  const newTokens = tokenize(newText);
  const result: DiffToken[] = [];
  
  let i = 0;
  let j = 0;

  while (i < oldTokens.length && j < newTokens.length) {
    if (oldTokens[i] === newTokens[j]) {
      result.push({ type: 'unchanged', value: oldTokens[i] });
      i++;
      j++;
    } else {
      let matchFound = false;
      let bestDx = -1;
      let bestDy = -1;

      // Lookahead search to find the nearest synchronization point
      // We search in expanding taxicab distance (dx + dy)
      for (let distance = 1; distance <= maxLookahead && !matchFound; distance++) {
        for (let dx = 0; dx <= distance; dx++) {
          let dy = distance - dx;
          
          if (i + dx < oldTokens.length && j + dy < newTokens.length) {
            if (oldTokens[i + dx] === newTokens[j + dy]) {
              bestDx = dx;
              bestDy = dy;
              matchFound = true;
              break;
            }
          }
        }
      }

      if (matchFound) {
        // Push the removed tokens
        for (let k = 0; k < bestDx; k++) {
          result.push({ type: 'removed', value: oldTokens[i + k] });
        }
        // Push the added tokens
        for (let k = 0; k < bestDy; k++) {
          result.push({ type: 'added', value: newTokens[j + k] });
        }
        i += bestDx;
        j += bestDy;
      } else {
        // If no match found within lookahead, just consume one token of each as a substitution
        result.push({ type: 'removed', value: oldTokens[i] });
        result.push({ type: 'added', value: newTokens[j] });
        i++;
        j++;
      }
    }
  }

  // Flush remaining tokens
  while (i < oldTokens.length) {
    result.push({ type: 'removed', value: oldTokens[i] });
    i++;
  }
  while (j < newTokens.length) {
    result.push({ type: 'added', value: newTokens[j] });
    j++;
  }

  return result;
};

export const DiffViewer: React.FC = () => {
  const [modelA, setModelA] = useState(
    "The process involves multiple steps that must be executed in order. First, we initialize the system. Then, we process the input data using algorithms. Finally, we generate the output based on the results."
  );
  const [modelB, setModelB] = useState(
    "This process involves several steps which must be executed in sequence. First, we initialize the core system. Then, we process the input data using advanced machine learning algorithms. Finally, we generate the final output based on the results."
  );

  const diffResult = useMemo(() => computeTokenDiff(modelA, modelB), [modelA, modelB]);

  return (
    <div className="diff-container" role="main" aria-label="Model Output Diff Viewer">
      <div>
        <h2 className="page-title">Model Output Diff Viewer</h2>
        <p className="page-subtitle">Compare outputs from two model versions with token-level highlighting.</p>
      </div>
      
      <div className="setup-form">
        <div className="input-group">
          <label htmlFor="model-a-input" className="input-label">Model Version A Output</label>
          <textarea
            id="model-a-input"
            className="text-input"
            rows={5}
            value={modelA}
            onChange={(e) => setModelA(e.target.value)}
            aria-label="Edit Model A Output"
          />
        </div>
        <div className="input-group">
          <label htmlFor="model-b-input" className="input-label">Model Version B Output</label>
          <textarea
            id="model-b-input"
            className="text-input"
            rows={5}
            value={modelB}
            onChange={(e) => setModelB(e.target.value)}
            aria-label="Edit Model B Output"
          />
        </div>
      </div>

      <div className="diff-grid">
        <div className="glass-panel diff-panel" aria-label="Diff Viewer - Original View">
          <h3 className="panel-title" style={{ marginBottom: '1rem' }}>Original (Model A)</h3>
          <div className="diff-content" aria-live="polite">
            {diffResult.map((token, idx) => {
              if (token.type === 'added') return null;
              
              if (token.type === 'removed') {
                return <span key={idx} className="diff-remove" aria-label={`Removed: ${token.value}`}>{token.value}</span>;
              }
              
              return <span key={idx} className="diff-unchanged">{token.value}</span>;
            })}
          </div>
        </div>

        <div className="glass-panel diff-panel" aria-label="Diff Viewer - Changes View">
          <h3 className="panel-title" style={{ marginBottom: '1rem' }}>Changes (Model B)</h3>
          <div className="diff-content" aria-live="polite">
            {diffResult.map((token, idx) => {
              if (token.type === 'removed') return null;
              
              if (token.type === 'added') {
                return <span key={idx} className="diff-add" aria-label={`Added: ${token.value}`}>{token.value}</span>;
              }
              
              return <span key={idx} className="diff-unchanged">{token.value}</span>;
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
