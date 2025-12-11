import React, { useState } from 'react';

export default function SearchPanel({
  onSearch,
  isSearching,
  ragResponse,
  rawResponse,
  hasSearched,
  searchError,
  comparisonMode,
  onToggleComparison,
  isSearchingRaw,
  // Parameters
  topK,
  setTopK,
  minSimilarity,
  setMinSimilarity,
  // Provider
  llmProvider,
  setLlmProvider,
}) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (inputValue.trim()) {
      onSearch(inputValue.trim());
    }
  };

  const retrievalMetrics = ragResponse?.retrieval_metrics;
  const generationMetrics = ragResponse?.generation_metrics;

  return (
    <div className="search-panel">
      {/* Header */}
      <div className="search-panel__header">
        <h2>Search Documentation</h2>
        <p>Ask questions about your codebase and documentation</p>
      </div>

      {/* Search Bar */}
      <form onSubmit={handleSubmit} className="search-bar">
        <div className="search-bar__wrapper">
          <svg className="search-bar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="How do I configure authentication? What's the testing strategy?"
            className="search-bar__input"
            disabled={isSearching}
          />
          <button 
            type="submit" 
            className="search-bar__btn"
            disabled={isSearching || !inputValue.trim()}
          >
            {isSearching ? (
              <span className="search-bar__spinner" />
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                Search
              </>
            )}
          </button>
        </div>
      </form>

      {/* Parameters & Controls Row */}
      <div className="search-panel__controls">
        {/* Parameters */}
        <div className="params-group">
          <div className="param">
            <label className="param__label">Top-K <span className="param__hint">(results)</span></label>
            <input
              type="number"
              min="1"
              max="20"
              value={topK}
              onChange={(e) => setTopK(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
              className="param__input"
            />
          </div>
          <div className="param">
            <label className="param__label">Min Similarity <span className="param__hint">(0-1)</span></label>
            <input
              type="number"
              min="0"
              max="1"
              step="0.05"
              value={minSimilarity}
              onChange={(e) => setMinSimilarity(Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))}
              className="param__input"
            />
          </div>
        </div>

        {/* Model Selector */}
        <div className="model-selector">
          <label className="model-selector__label">Model:</label>
          <div className="model-selector__buttons">
            {['openai', 'groq', 'deepseek'].map((provider) => (
              <button
                key={provider}
                type="button"
                className={`model-selector__btn ${llmProvider === provider ? 'model-selector__btn--active' : ''}`}
                onClick={() => setLlmProvider(provider)}
              >
                {provider === 'openai' ? 'GPT-4' : provider === 'groq' ? 'Llama-3' : 'DeepSeek'}
              </button>
            ))}
          </div>
        </div>

        {/* Comparison Toggle */}
        <label className="toggle">
          <input
            type="checkbox"
            checked={comparisonMode}
            onChange={onToggleComparison}
          />
          <span className="toggle__slider" />
          <span className="toggle__label">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
            Compare RAG vs Raw
          </span>
        </label>
      </div>

      {/* Error Message */}
      {searchError && (
        <div className="search-panel__error">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {searchError}
        </div>
      )}

      {/* Metrics Panel */}
      {hasSearched && (retrievalMetrics || generationMetrics) && (
        <div className="metrics-panel">
          {/* Retrieval Metrics */}
          <div className="metrics-panel__section">
            <span className="metrics-panel__section-label">Retrieval</span>
            <div className="metrics-panel__items">
              <div className="metrics-panel__item">
                <span className="metrics-panel__value">{retrievalMetrics?.results_returned || 0}</span>
                <span className="metrics-panel__label">Results</span>
              </div>
              <div className="metrics-panel__item">
                <span className="metrics-panel__value">{retrievalMetrics?.latency_ms || 0}ms</span>
                <span className="metrics-panel__label">Latency</span>
              </div>
              <div className="metrics-panel__item">
                <span className="metrics-panel__value">
                  {retrievalMetrics?.top_similarity ? `${(retrievalMetrics.top_similarity * 100).toFixed(0)}%` : '—'}
                </span>
                <span className="metrics-panel__label">Top Score</span>
              </div>
              <div className="metrics-panel__item">
                <span className="metrics-panel__value">
                  {retrievalMetrics?.avg_similarity ? `${(retrievalMetrics.avg_similarity * 100).toFixed(0)}%` : '—'}
                </span>
                <span className="metrics-panel__label">Avg Score</span>
              </div>
              {retrievalMetrics?.results_filtered > 0 && (
                <div className="metrics-panel__item metrics-panel__item--muted">
                  <span className="metrics-panel__value">{retrievalMetrics.results_filtered}</span>
                  <span className="metrics-panel__label">Filtered</span>
                </div>
              )}
            </div>
          </div>

          <div className="metrics-panel__divider" />

          {/* Generation Metrics */}
          <div className="metrics-panel__section">
            <span className="metrics-panel__section-label">Generation</span>
            <div className="metrics-panel__items">
              <div className="metrics-panel__item">
                <span className="metrics-panel__value">
                  {generationMetrics?.llm_latency_ms ? `${Math.round(generationMetrics.llm_latency_ms)}ms` : '—'}
                </span>
                <span className="metrics-panel__label">LLM Time</span>
              </div>
              <div className="metrics-panel__item">
                <span className="metrics-panel__value">
                  {generationMetrics?.context_tokens || '—'}
                </span>
                <span className="metrics-panel__label">Tokens</span>
              </div>
              <div className="metrics-panel__item">
                <span className="metrics-panel__value">
                  {generationMetrics?.sources_used || '—'}
                </span>
                <span className="metrics-panel__label">Sources</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Area */}
      <div className={`results-area ${comparisonMode ? 'results-area--split' : ''}`}>
        {/* RAG Results */}
        <div className="results-column">
          {comparisonMode && (
            <div className="results-column__header results-column__header--rag">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                <line x1="12" y1="22.08" x2="12" y2="12" />
              </svg>
              RAG Results
            </div>
          )}
          
          {isSearching ? (
            <div className="results-loading">
              <div className="skeleton-card" />
              <div className="skeleton-card" />
              <div className="skeleton-card" />
            </div>
          ) : hasSearched && ragResponse ? (
            <div className="rag-results">
              {/* RAG Answer */}
              {ragResponse.answer && (
                <div className="rag-answer">
                  <div className="rag-answer__header">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                    </svg>
                    AI Answer
                  </div>
                  <div className="rag-answer__content">
                    {ragResponse.answer}
                  </div>
                </div>
              )}

              {/* Source Chunks */}
              {ragResponse.results?.length > 0 ? (
                <div className="sources-section">
                  <div className="sources-section__header">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    Sources ({ragResponse.results.length})
                  </div>
                  <div className="results-list">
                    {ragResponse.results.map((result, index) => (
                      <ResultCard key={`${result.file_path}-${result.chunk_index}`} result={result} index={index} />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="results-empty">
                  <p>No relevant sources found</p>
                </div>
              )}
            </div>
          ) : hasSearched ? (
            <div className="results-empty">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
                <path d="M8 8l6 6" />
                <path d="M14 8l-6 6" />
              </svg>
              <h3>No results found</h3>
              <p>Try a different query or lower the min similarity threshold</p>
            </div>
          ) : (
            <div className="results-empty results-empty--initial">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <h3>Search your documentation</h3>
              <p>Enter a query above to find relevant information from your indexed files</p>
            </div>
          )}
        </div>

        {/* Raw LLM Results (Comparison Mode) */}
        {comparisonMode && (
          <div className="results-column">
            <div className="results-column__header results-column__header--raw">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                <path d="M12 2a10 10 0 0 1 10 10" />
                <circle cx="12" cy="12" r="3" />
              </svg>
              Raw LLM (No RAG)
            </div>
            
            {isSearchingRaw ? (
              <div className="results-loading">
                <div className="skeleton-card skeleton-card--large" />
              </div>
            ) : rawResponse?.error ? (
              <div className="results-empty results-empty--error">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
                <p>{rawResponse.error}</p>
              </div>
            ) : rawResponse?.answer ? (
              <div className="raw-response">
                <div className="raw-response__meta">
                  <span className="raw-response__provider">{rawResponse.provider}</span>
                  <span className="raw-response__latency">{Math.round(rawResponse.latency_ms)}ms</span>
                </div>
                <div className="raw-response__content">
                  {rawResponse.answer}
                </div>
              </div>
            ) : hasSearched ? (
              <div className="results-empty">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                </svg>
                <p>Run a search to compare results</p>
              </div>
            ) : (
              <div className="results-empty results-empty--initial">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                  <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
                <h3>Raw LLM Response</h3>
                <p>See what the model generates without RAG context</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Project Context Panel - Proactive Insights */}
      <ProjectContextPanel />
    </div>
  );
}

// Mock project data - will be replaced with real data later
const MOCK_PROJECT = {
  name: "Auth Service Refactor",
  currentWeek: 4,
  totalWeeks: 6,
  phases: [
    { name: "Planning", weeks: [1], keywords: ["architecture", "design", "RFC"] },
    { name: "Implementation", weeks: [2, 3, 4], keywords: ["code", "API", "patterns"] },
    { name: "Testing", weeks: [5], keywords: ["test", "QA", "coverage"] },
    { name: "Deployment", weeks: [6], keywords: ["deploy", "CI/CD", "monitoring"] }
  ]
};

const MOCK_INSIGHTS = {
  critical: [
    { title: "Code Review Checklist", match: 92, path: "/docs/code-review.md" },
    { title: "Error Handling Standards", match: 87, path: "/docs/error-handling.md" }
  ],
  upcoming: [
    { title: "Unit Testing Guide", match: 85, path: "/docs/testing/unit-tests.md" },
    { title: "Mocking Strategy Doc", match: 78, path: "/docs/testing/mocking.md" }
  ],
  recommended: [
    { title: "Auth Best Practices", match: 85, path: "/docs/auth/best-practices.md" },
    { title: "API Security Guidelines", match: 72, path: "/docs/security/api.md" },
    { title: "OAuth 2.0 Implementation Notes", match: 68, path: "/docs/auth/oauth.md" }
  ]
};

function ProjectContextPanel() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const project = MOCK_PROJECT;
  const insights = MOCK_INSIGHTS;
  
  const currentPhase = project.phases.find(p => p.weeks.includes(project.currentWeek));
  const nextPhase = project.phases.find(p => 
    p.weeks.includes(project.currentWeek + 1) && !p.weeks.includes(project.currentWeek)
  );
  
  return (
    <div className={`insights-panel ${isCollapsed ? 'insights-panel--collapsed' : ''}`}>
      {/* Header */}
      <div className="insights-panel__header" onClick={() => setIsCollapsed(!isCollapsed)}>
        <div className="insights-panel__header-left">
          <span className="insights-panel__icon">📋</span>
          <div className="insights-panel__title-group">
            <h3 className="insights-panel__title">{project.name}</h3>
            <p className="insights-panel__meta">
              Week {project.currentWeek} of {project.totalWeeks} • {currentPhase?.name || 'In Progress'}
              {nextPhase && <span className="insights-panel__next"> → {nextPhase.name} next week</span>}
            </p>
          </div>
        </div>
        <button className="insights-panel__toggle">
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{ transform: isCollapsed ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {!isCollapsed && (
        <div className="insights-panel__content">
          {/* Critical This Week */}
          <div className="insights-section">
            <div className="insights-section__header">
              <span className="insights-section__icon insights-section__icon--critical">🔴</span>
              <span className="insights-section__title">Critical This Week</span>
            </div>
            <ul className="insights-list">
              {insights.critical.map((doc, i) => (
                <li key={i} className="insights-list__item">
                  <div className="insights-list__doc">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="insights-list__title">{doc.title}</span>
                  </div>
                  <span className="insights-list__match insights-list__match--high">{doc.match}%</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Prepare for Next Week */}
          {nextPhase && (
            <div className="insights-section">
              <div className="insights-section__header">
                <span className="insights-section__icon insights-section__icon--upcoming">📅</span>
                <span className="insights-section__title">Prepare for {nextPhase.name}</span>
              </div>
              <ul className="insights-list">
                {insights.upcoming.map((doc, i) => (
                  <li key={i} className="insights-list__item">
                    <div className="insights-list__doc">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                        <polyline points="14 2 14 8 20 8" />
                      </svg>
                      <span className="insights-list__title">{doc.title}</span>
                    </div>
                    <span className="insights-list__match">{doc.match}%</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Reading */}
          <div className="insights-section">
            <div className="insights-section__header">
              <span className="insights-section__icon insights-section__icon--reading">📚</span>
              <span className="insights-section__title">Recommended Reading</span>
            </div>
            <ul className="insights-list">
              {insights.recommended.map((doc, i) => (
                <li key={i} className="insights-list__item">
                  <div className="insights-list__doc">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                    <span className="insights-list__title">{doc.title}</span>
                  </div>
                  <span className="insights-list__match">{doc.match}%</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

function ResultCard({ result, index }) {
  const [expanded, setExpanded] = useState(false);
  const pathParts = result.file_path.split('/');
  const fileName = pathParts.pop();
  const dirPath = pathParts.join('/');
  
  const similarityPercent = (result.similarity * 100).toFixed(0);

  return (
    <div 
      className="result-card" 
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      <div className="result-card__header">
        <div className="result-card__file">
          <div className="result-card__file-icon">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="result-card__file-info">
            <span className="result-card__file-name">{fileName}</span>
            {dirPath && <span className="result-card__file-path">{dirPath}/</span>}
          </div>
        </div>
        
        <div className="result-card__meta">
          <span className="result-card__chunk">Chunk {result.chunk_index}</span>
          <div className="result-card__score">
            <span className="result-card__score-value">{similarityPercent}%</span>
            <span className="result-card__score-label">match</span>
          </div>
        </div>
      </div>
      
      <div className={`result-card__content ${expanded ? 'result-card__content--expanded' : ''}`}>
        {result.content_snippet}
      </div>
      
      {result.content_snippet.length > 200 && (
        <button 
          className="result-card__expand"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? 'Show less' : 'Show more'}
          <svg 
            width="14" 
            height="14" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
      )}
    </div>
  );
}

// import React, { useState } from 'react';

// export default function SearchPanel({
//   onSearch,
//   isSearching,
//   ragResponse,
//   rawResponse,
//   hasSearched,
//   searchError,
//   comparisonMode,
//   onToggleComparison,
//   isSearchingRaw,
//   // Parameters
//   topK,
//   setTopK,
//   minSimilarity,
//   setMinSimilarity,
//   // Provider
//   llmProvider,
//   setLlmProvider,
// }) {
//   const [inputValue, setInputValue] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (inputValue.trim()) {
//       onSearch(inputValue.trim());
//     }
//   };

//   const retrievalMetrics = ragResponse?.retrieval_metrics;
//   const generationMetrics = ragResponse?.generation_metrics;

//   return (
//     <div className="search-panel">
//       {/* Header */}
//       <div className="search-panel__header">
//         <h2>Search Documentation</h2>
//         <p>Ask questions about your codebase and documentation</p>
//       </div>

//       {/* Search Bar */}
//       <form onSubmit={handleSubmit} className="search-bar">
//         <div className="search-bar__wrapper">
//           <svg className="search-bar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <circle cx="11" cy="11" r="8" />
//             <path d="m21 21-4.35-4.35" />
//           </svg>
//           <input
//             type="text"
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             placeholder="How do I configure authentication? What's the testing strategy?"
//             className="search-bar__input"
//             disabled={isSearching}
//           />
//           <button 
//             type="submit" 
//             className="search-bar__btn"
//             disabled={isSearching || !inputValue.trim()}
//           >
//             {isSearching ? (
//               <span className="search-bar__spinner" />
//             ) : (
//               <>
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <line x1="22" y1="2" x2="11" y2="13" />
//                   <polygon points="22 2 15 22 11 13 2 9 22 2" />
//                 </svg>
//                 Search
//               </>
//             )}
//           </button>
//         </div>
//       </form>

//       {/* Parameters & Controls Row */}
//       <div className="search-panel__controls">
//         {/* Parameters */}
//         <div className="params-group">
//           <div className="param">
//             <label className="param__label">Top-K <span className="param__hint">(results)</span></label>
//             <input
//               type="number"
//               min="1"
//               max="20"
//               value={topK}
//               onChange={(e) => setTopK(Math.max(1, Math.min(20, parseInt(e.target.value) || 5)))}
//               className="param__input"
//             />
//           </div>
//           <div className="param">
//             <label className="param__label">Min Similarity <span className="param__hint">(0-1)</span></label>
//             <input
//               type="number"
//               min="0"
//               max="1"
//               step="0.05"
//               value={minSimilarity}
//               onChange={(e) => setMinSimilarity(Math.max(0, Math.min(1, parseFloat(e.target.value) || 0)))}
//               className="param__input"
//             />
//           </div>
//         </div>

//         {/* Model Selector */}
//         <div className="model-selector">
//           <label className="model-selector__label">Model:</label>
//           <div className="model-selector__buttons">
//             {['openai', 'groq', 'deepseek'].map((provider) => (
//               <button
//                 key={provider}
//                 type="button"
//                 className={`model-selector__btn ${llmProvider === provider ? 'model-selector__btn--active' : ''}`}
//                 onClick={() => setLlmProvider(provider)}
//               >
//                 {provider === 'openai' ? 'GPT-4' : provider === 'groq' ? 'Llama-3' : 'DeepSeek'}
//               </button>
//             ))}
//           </div>
//         </div>

//         {/* Comparison Toggle */}
//         <label className="toggle">
//           <input
//             type="checkbox"
//             checked={comparisonMode}
//             onChange={onToggleComparison}
//           />
//           <span className="toggle__slider" />
//           <span className="toggle__label">
//             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <rect x="3" y="3" width="7" height="7" />
//               <rect x="14" y="3" width="7" height="7" />
//               <rect x="14" y="14" width="7" height="7" />
//               <rect x="3" y="14" width="7" height="7" />
//             </svg>
//             Compare RAG vs Raw
//           </span>
//         </label>
//       </div>

//       {/* Error Message */}
//       {searchError && (
//         <div className="search-panel__error">
//           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <circle cx="12" cy="12" r="10" />
//             <line x1="12" y1="8" x2="12" y2="12" />
//             <line x1="12" y1="16" x2="12.01" y2="16" />
//           </svg>
//           {searchError}
//         </div>
//       )}

//       {/* Metrics Panel */}
//       {hasSearched && (retrievalMetrics || generationMetrics) && (
//         <div className="metrics-panel">
//           {/* Retrieval Metrics */}
//           <div className="metrics-panel__section">
//             <span className="metrics-panel__section-label">Retrieval</span>
//             <div className="metrics-panel__items">
//               <div className="metrics-panel__item">
//                 <span className="metrics-panel__value">{retrievalMetrics?.results_returned || 0}</span>
//                 <span className="metrics-panel__label">Results</span>
//               </div>
//               <div className="metrics-panel__item">
//                 <span className="metrics-panel__value">{retrievalMetrics?.latency_ms || 0}ms</span>
//                 <span className="metrics-panel__label">Latency</span>
//               </div>
//               <div className="metrics-panel__item">
//                 <span className="metrics-panel__value">
//                   {retrievalMetrics?.top_similarity ? `${(retrievalMetrics.top_similarity * 100).toFixed(0)}%` : '—'}
//                 </span>
//                 <span className="metrics-panel__label">Top Score</span>
//               </div>
//               <div className="metrics-panel__item">
//                 <span className="metrics-panel__value">
//                   {retrievalMetrics?.avg_similarity ? `${(retrievalMetrics.avg_similarity * 100).toFixed(0)}%` : '—'}
//                 </span>
//                 <span className="metrics-panel__label">Avg Score</span>
//               </div>
//               {retrievalMetrics?.results_filtered > 0 && (
//                 <div className="metrics-panel__item metrics-panel__item--muted">
//                   <span className="metrics-panel__value">{retrievalMetrics.results_filtered}</span>
//                   <span className="metrics-panel__label">Filtered</span>
//                 </div>
//               )}
//             </div>
//           </div>

//           <div className="metrics-panel__divider" />

//           {/* Generation Metrics */}
//           <div className="metrics-panel__section">
//             <span className="metrics-panel__section-label">Generation</span>
//             <div className="metrics-panel__items">
//               <div className="metrics-panel__item">
//                 <span className="metrics-panel__value">
//                   {generationMetrics?.llm_latency_ms ? `${Math.round(generationMetrics.llm_latency_ms)}ms` : '—'}
//                 </span>
//                 <span className="metrics-panel__label">LLM Time</span>
//               </div>
//               <div className="metrics-panel__item">
//                 <span className="metrics-panel__value">
//                   {generationMetrics?.context_tokens || '—'}
//                 </span>
//                 <span className="metrics-panel__label">Tokens</span>
//               </div>
//               <div className="metrics-panel__item">
//                 <span className="metrics-panel__value">
//                   {generationMetrics?.sources_used || '—'}
//                 </span>
//                 <span className="metrics-panel__label">Sources</span>
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* Results Area */}
//       <div className={`results-area ${comparisonMode ? 'results-area--split' : ''}`}>
//         {/* RAG Results */}
//         <div className="results-column">
//           {comparisonMode && (
//             <div className="results-column__header results-column__header--rag">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
//                 <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
//                 <line x1="12" y1="22.08" x2="12" y2="12" />
//               </svg>
//               RAG Results
//             </div>
//           )}
          
//           {isSearching ? (
//             <div className="results-loading">
//               <div className="skeleton-card" />
//               <div className="skeleton-card" />
//               <div className="skeleton-card" />
//             </div>
//           ) : hasSearched && ragResponse ? (
//             <div className="rag-results">
//               {/* RAG Answer */}
//               {ragResponse.answer && (
//                 <div className="rag-answer">
//                   <div className="rag-answer__header">
//                     <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
//                     </svg>
//                     AI Answer
//                   </div>
//                   <div className="rag-answer__content">
//                     {ragResponse.answer}
//                   </div>
//                 </div>
//               )}

//               {/* Source Chunks */}
//               {ragResponse.results?.length > 0 ? (
//                 <div className="sources-section">
//                   <div className="sources-section__header">
//                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//                       <polyline points="14 2 14 8 20 8" />
//                     </svg>
//                     Sources ({ragResponse.results.length})
//                   </div>
//                   <div className="results-list">
//                     {ragResponse.results.map((result, index) => (
//                       <ResultCard key={`${result.file_path}-${result.chunk_index}`} result={result} index={index} />
//                     ))}
//                   </div>
//                 </div>
//               ) : (
//                 <div className="results-empty">
//                   <p>No relevant sources found</p>
//                 </div>
//               )}
//             </div>
//           ) : hasSearched ? (
//             <div className="results-empty">
//               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
//                 <circle cx="11" cy="11" r="8" />
//                 <path d="m21 21-4.35-4.35" />
//                 <path d="M8 8l6 6" />
//                 <path d="M14 8l-6 6" />
//               </svg>
//               <h3>No results found</h3>
//               <p>Try a different query or lower the min similarity threshold</p>
//             </div>
//           ) : (
//             <div className="results-empty results-empty--initial">
//               <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
//                 <circle cx="11" cy="11" r="8" />
//                 <path d="m21 21-4.35-4.35" />
//               </svg>
//               <h3>Search your documentation</h3>
//               <p>Enter a query above to find relevant information from your indexed files</p>
//             </div>
//           )}
//         </div>

//         {/* Raw LLM Results (Comparison Mode) */}
//         {comparisonMode && (
//           <div className="results-column">
//             <div className="results-column__header results-column__header--raw">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
//                 <path d="M12 2a10 10 0 0 1 10 10" />
//                 <circle cx="12" cy="12" r="3" />
//               </svg>
//               Raw LLM (No RAG)
//             </div>
            
//             {isSearchingRaw ? (
//               <div className="results-loading">
//                 <div className="skeleton-card skeleton-card--large" />
//               </div>
//             ) : rawResponse?.error ? (
//               <div className="results-empty results-empty--error">
//                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//                   <circle cx="12" cy="12" r="10" />
//                   <line x1="15" y1="9" x2="9" y2="15" />
//                   <line x1="9" y1="9" x2="15" y2="15" />
//                 </svg>
//                 <p>{rawResponse.error}</p>
//               </div>
//             ) : rawResponse?.answer ? (
//               <div className="raw-response">
//                 <div className="raw-response__meta">
//                   <span className="raw-response__provider">{rawResponse.provider}</span>
//                   <span className="raw-response__latency">{Math.round(rawResponse.latency_ms)}ms</span>
//                 </div>
//                 <div className="raw-response__content">
//                   {rawResponse.answer}
//                 </div>
//               </div>
//             ) : hasSearched ? (
//               <div className="results-empty">
//                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//                   <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
//                 </svg>
//                 <p>Run a search to compare results</p>
//               </div>
//             ) : (
//               <div className="results-empty results-empty--initial">
//                 <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
//                   <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
//                   <circle cx="12" cy="12" r="3" />
//                 </svg>
//                 <h3>Raw LLM Response</h3>
//                 <p>See what the model generates without RAG context</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function ResultCard({ result, index }) {
//   const [expanded, setExpanded] = useState(false);
//   const pathParts = result.file_path.split('/');
//   const fileName = pathParts.pop();
//   const dirPath = pathParts.join('/');
  
//   const similarityPercent = (result.similarity * 100).toFixed(0);

//   return (
//     <div 
//       className="result-card" 
//       style={{ animationDelay: `${index * 0.05}s` }}
//     >
//       <div className="result-card__header">
//         <div className="result-card__file">
//           <div className="result-card__file-icon">
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//               <polyline points="14 2 14 8 20 8" />
//             </svg>
//           </div>
//           <div className="result-card__file-info">
//             <span className="result-card__file-name">{fileName}</span>
//             {dirPath && <span className="result-card__file-path">{dirPath}/</span>}
//           </div>
//         </div>
        
//         <div className="result-card__meta">
//           <span className="result-card__chunk">Chunk {result.chunk_index}</span>
//           <div className="result-card__score">
//             <span className="result-card__score-value">{similarityPercent}%</span>
//             <span className="result-card__score-label">match</span>
//           </div>
//         </div>
//       </div>
      
//       <div className={`result-card__content ${expanded ? 'result-card__content--expanded' : ''}`}>
//         {result.content_snippet}
//       </div>
      
//       {result.content_snippet.length > 200 && (
//         <button 
//           className="result-card__expand"
//           onClick={() => setExpanded(!expanded)}
//         >
//           {expanded ? 'Show less' : 'Show more'}
//           <svg 
//             width="14" 
//             height="14" 
//             viewBox="0 0 24 24" 
//             fill="none" 
//             stroke="currentColor" 
//             strokeWidth="2"
//             style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
//           >
//             <polyline points="6 9 12 15 18 9" />
//           </svg>
//         </button>
//       )}
//     </div>
//   );
// }

// import React, { useState } from 'react';

// export default function SearchPanel({
//   onSearch,
//   isSearching,
//   searchResults,
//   hasSearched,
//   searchQuery,
//   searchError,
//   searchMetrics,
//   comparisonMode,
//   onToggleComparison,
//   rawResults,
//   isSearchingRaw
// }) {
//   const [inputValue, setInputValue] = useState('');

//   const handleSubmit = (e) => {
//     e.preventDefault();
//     if (inputValue.trim()) {
//       onSearch(inputValue.trim());
//     }
//   };

//   return (
//     <div className="search-panel">
//       {/* Header */}
//       <div className="search-panel__header">
//         <h2>Search Documentation</h2>
//         <p>Ask questions about your codebase and documentation</p>
//       </div>

//       {/* Search Bar */}
//       <form onSubmit={handleSubmit} className="search-bar">
//         <div className="search-bar__wrapper">
//           <svg className="search-bar__icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <circle cx="11" cy="11" r="8" />
//             <path d="m21 21-4.35-4.35" />
//           </svg>
//           <input
//             type="text"
//             value={inputValue}
//             onChange={(e) => setInputValue(e.target.value)}
//             placeholder="How do I configure authentication? What's the testing strategy?"
//             className="search-bar__input"
//             disabled={isSearching}
//           />
//           <button 
//             type="submit" 
//             className="search-bar__btn"
//             disabled={isSearching || !inputValue.trim()}
//           >
//             {isSearching ? (
//               <span className="search-bar__spinner" />
//             ) : (
//               <>
//                 <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                   <line x1="22" y1="2" x2="11" y2="13" />
//                   <polygon points="22 2 15 22 11 13 2 9 22 2" />
//                 </svg>
//                 Search
//               </>
//             )}
//           </button>
//         </div>
//       </form>

//       {/* Comparison Toggle */}
//       <div className="search-panel__controls">
//         <label className="toggle">
//           <input
//             type="checkbox"
//             checked={comparisonMode}
//             onChange={onToggleComparison}
//           />
//           <span className="toggle__slider" />
//           <span className="toggle__label">
//             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <rect x="3" y="3" width="7" height="7" />
//               <rect x="14" y="3" width="7" height="7" />
//               <rect x="14" y="14" width="7" height="7" />
//               <rect x="3" y="14" width="7" height="7" />
//             </svg>
//             Compare RAG vs Raw LLM
//           </span>
//         </label>
//       </div>

//       {/* Error Message */}
//       {searchError && (
//         <div className="search-panel__error">
//           <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//             <circle cx="12" cy="12" r="10" />
//             <line x1="12" y1="8" x2="12" y2="12" />
//             <line x1="12" y1="16" x2="12.01" y2="16" />
//           </svg>
//           {searchError}
//         </div>
//       )}

//       {/* Metrics Panel */}
//       {searchMetrics && hasSearched && (
//         <div className="metrics-panel">
//           <div className="metrics-panel__item">
//             <span className="metrics-panel__value">{searchMetrics.resultCount}</span>
//             <span className="metrics-panel__label">Results</span>
//           </div>
//           <div className="metrics-panel__divider" />
//           <div className="metrics-panel__item">
//             <span className="metrics-panel__value">{searchMetrics.latency}ms</span>
//             <span className="metrics-panel__label">Latency</span>
//           </div>
//           <div className="metrics-panel__divider" />
//           <div className="metrics-panel__item">
//             <span className="metrics-panel__value">
//               {searchMetrics.avgScore > 0 ? (1 - searchMetrics.avgScore).toFixed(2) : '—'}
//             </span>
//             <span className="metrics-panel__label">Avg Similarity</span>
//           </div>
//         </div>
//       )}

//       {/* Results Area */}
//       <div className={`results-area ${comparisonMode ? 'results-area--split' : ''}`}>
//         {/* RAG Results */}
//         <div className="results-column">
//           {comparisonMode && (
//             <div className="results-column__header results-column__header--rag">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
//                 <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
//                 <line x1="12" y1="22.08" x2="12" y2="12" />
//               </svg>
//               RAG Results
//             </div>
//           )}
          
//           {isSearching ? (
//             <div className="results-loading">
//               <div className="skeleton-card" />
//               <div className="skeleton-card" />
//               <div className="skeleton-card" />
//             </div>
//           ) : hasSearched && searchResults.length === 0 ? (
//             <div className="results-empty">
//               <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
//                 <circle cx="11" cy="11" r="8" />
//                 <path d="m21 21-4.35-4.35" />
//                 <path d="M8 8l6 6" />
//                 <path d="M14 8l-6 6" />
//               </svg>
//               <h3>No results found</h3>
//               <p>Try a different query or ingest more documents</p>
//             </div>
//           ) : hasSearched ? (
//             <div className="results-list">
//               {searchResults.map((result, index) => (
//                 <ResultCard key={`${result.file_path}-${result.chunk_index}`} result={result} index={index} />
//               ))}
//             </div>
//           ) : (
//             <div className="results-empty results-empty--initial">
//               <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
//                 <circle cx="11" cy="11" r="8" />
//                 <path d="m21 21-4.35-4.35" />
//               </svg>
//               <h3>Search your documentation</h3>
//               <p>Enter a query above to find relevant information from your indexed files</p>
//             </div>
//           )}
//         </div>

//         {/* Raw LLM Results (Comparison Mode) */}
//         {comparisonMode && (
//           <div className="results-column">
//             <div className="results-column__header results-column__header--raw">
//               <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                 <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
//                 <path d="M12 2a10 10 0 0 1 10 10" />
//                 <circle cx="12" cy="12" r="3" />
//               </svg>
//               Raw LLM (No RAG)
//             </div>
            
//             {isSearchingRaw ? (
//               <div className="results-loading">
//                 <div className="skeleton-card skeleton-card--large" />
//               </div>
//             ) : rawResults?.error ? (
//               <div className="results-empty results-empty--error">
//                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//                   <circle cx="12" cy="12" r="10" />
//                   <line x1="15" y1="9" x2="9" y2="15" />
//                   <line x1="9" y1="9" x2="15" y2="15" />
//                 </svg>
//                 <p>{rawResults.error}</p>
//               </div>
//             ) : rawResults?.response ? (
//               <div className="raw-response">
//                 <div className="raw-response__content">
//                   {rawResults.response}
//                 </div>
//                 {rawResults.note && (
//                   <div className="raw-response__note">
//                     <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//                       <circle cx="12" cy="12" r="10" />
//                       <line x1="12" y1="16" x2="12" y2="12" />
//                       <line x1="12" y1="8" x2="12.01" y2="8" />
//                     </svg>
//                     {rawResults.note}
//                   </div>
//                 )}
//               </div>
//             ) : hasSearched ? (
//               <div className="results-empty">
//                 <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
//                   <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
//                 </svg>
//                 <p>Run a search to compare results</p>
//               </div>
//             ) : (
//               <div className="results-empty results-empty--initial">
//                 <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
//                   <path d="M12 2a10 10 0 1 0 10 10H12V2z" />
//                   <circle cx="12" cy="12" r="3" />
//                 </svg>
//                 <h3>Raw LLM Response</h3>
//                 <p>See what the model generates without RAG context</p>
//               </div>
//             )}
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }

// function ResultCard({ result, index }) {
//   const [expanded, setExpanded] = useState(false);
//   const pathParts = result.file_path.split('/');
//   const fileName = pathParts.pop();
//   const dirPath = pathParts.join('/');
  
//   // Convert distance to similarity (lower distance = higher similarity)
//   const similarity = Math.max(0, 1 - result.score);
//   const similarityPercent = (similarity * 100).toFixed(0);

//   return (
//     <div 
//       className="result-card" 
//       style={{ animationDelay: `${index * 0.05}s` }}
//     >
//       <div className="result-card__header">
//         <div className="result-card__file">
//           <div className="result-card__file-icon">
//             <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
//               <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
//               <polyline points="14 2 14 8 20 8" />
//             </svg>
//           </div>
//           <div className="result-card__file-info">
//             <span className="result-card__file-name">{fileName}</span>
//             {dirPath && <span className="result-card__file-path">{dirPath}/</span>}
//           </div>
//         </div>
        
//         <div className="result-card__meta">
//           <span className="result-card__chunk">Chunk {result.chunk_index}</span>
//           <div className="result-card__score">
//             <span className="result-card__score-value">{similarityPercent}%</span>
//             <span className="result-card__score-label">match</span>
//           </div>
//         </div>
//       </div>
      
//       <div className={`result-card__content ${expanded ? 'result-card__content--expanded' : ''}`}>
//         {result.content_snippet}
//       </div>
      
//       {result.content_snippet.length > 200 && (
//         <button 
//           className="result-card__expand"
//           onClick={() => setExpanded(!expanded)}
//         >
//           {expanded ? 'Show less' : 'Show more'}
//           <svg 
//             width="14" 
//             height="14" 
//             viewBox="0 0 24 24" 
//             fill="none" 
//             stroke="currentColor" 
//             strokeWidth="2"
//             style={{ transform: expanded ? 'rotate(180deg)' : 'none' }}
//           >
//             <polyline points="6 9 12 15 18 9" />
//           </svg>
//         </button>
//       )}
//     </div>
//   );
// }
