import React, { useState, useCallback, useEffect } from 'react';
import { searchRag, searchRaw, getFiles, ingestGit, uploadFile } from './api';
import Sidebar from './components/Sidebar';
import SearchPanel from './components/SearchPanel';
import './styles/index.css';

export default function App() {
  // Search parameters
  const [topK, setTopK] = useState(5);
  const [minSimilarity, setMinSimilarity] = useState(0.0);
  const [llmProvider, setLlmProvider] = useState('openai');

  // Search state
  const [ragResponse, setRagResponse] = useState(null);
  const [rawResponse, setRawResponse] = useState(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchingRaw, setIsSearchingRaw] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Comparison mode
  const [comparisonMode, setComparisonMode] = useState(false);

  // Files state
  const [files, setFiles] = useState([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Ingest state
  const [isIngesting, setIsIngesting] = useState(false);
  const [ingestStatus, setIngestStatus] = useState(null);

  // Load files on mount
  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    setIsLoadingFiles(true);
    try {
      const response = await getFiles();
      setFiles(response.files || []);
    } catch (err) {
      console.error('Failed to load files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleSearch = useCallback(async (query) => {
    if (!query.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setHasSearched(true);
    setRawResponse(null);

    try {
      // Call RAG search endpoint with selected provider
      const response = await searchRag(query, topK, minSimilarity, llmProvider);
      setRagResponse(response);

      // If comparison mode, also fetch raw LLM
      if (comparisonMode) {
        setIsSearchingRaw(true);
        try {
          const rawResp = await searchRaw(query, llmProvider);
          setRawResponse(rawResp);
        } catch (err) {
          console.error('Raw search failed:', err);
          setRawResponse({ error: err.response?.data?.detail || 'Raw LLM search failed' });
        } finally {
          setIsSearchingRaw(false);
        }
      }
    } catch (err) {
      console.error('Search failed:', err);
      setSearchError(err.response?.data?.detail || 'Search failed. Please try again.');
      setRagResponse(null);
    } finally {
      setIsSearching(false);
    }
  }, [topK, minSimilarity, comparisonMode, llmProvider]);

  const handleGitIngest = async (repoUrl, branch) => {
    setIsIngesting(true);
    setIngestStatus(null);
    try {
      await ingestGit(repoUrl, branch);
      setIngestStatus({ type: 'success', message: `Queued: ${repoUrl} (${branch})` });
      setTimeout(loadFiles, 2000);
    } catch (err) {
      setIngestStatus({ type: 'error', message: err.response?.data?.detail || 'Ingestion failed' });
    } finally {
      setIsIngesting(false);
    }
  };

  const handleFileUpload = async (file) => {
    setIsIngesting(true);
    setIngestStatus(null);
    try {
      await uploadFile(file);
      setIngestStatus({ type: 'success', message: `Uploaded: ${file.name}` });
      setTimeout(loadFiles, 2000);
    } catch (err) {
      setIngestStatus({ type: 'error', message: err.response?.data?.detail || 'Upload failed' });
    } finally {
      setIsIngesting(false);
    }
  };

  const toggleComparisonMode = () => {
    setComparisonMode(prev => !prev);
    setRawResponse(null);
  };

  return (
    <div className="app-layout">
      <Sidebar
        files={files}
        isLoadingFiles={isLoadingFiles}
        onGitIngest={handleGitIngest}
        onFileUpload={handleFileUpload}
        isIngesting={isIngesting}
        ingestStatus={ingestStatus}
        onRefreshFiles={loadFiles}
      />

      <main className="main-content">
        <SearchPanel
          onSearch={handleSearch}
          isSearching={isSearching}
          ragResponse={ragResponse}
          rawResponse={rawResponse}
          hasSearched={hasSearched}
          searchError={searchError}
          comparisonMode={comparisonMode}
          onToggleComparison={toggleComparisonMode}
          isSearchingRaw={isSearchingRaw}
          topK={topK}
          setTopK={setTopK}
          minSimilarity={minSimilarity}
          setMinSimilarity={setMinSimilarity}
          llmProvider={llmProvider}
          setLlmProvider={setLlmProvider}
        />
      </main>
    </div>
  );
}