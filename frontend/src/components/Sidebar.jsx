import React, { useState, useRef } from 'react';

export default function Sidebar({
  files,
  isLoadingFiles,
  onGitIngest,
  onFileUpload,
  isIngesting,
  ingestStatus,
  onRefreshFiles
}) {
  const [gitUrl, setGitUrl] = useState('');
  const [gitBranch, setGitBranch] = useState('main');
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const handleGitSubmit = (e) => {
    e.preventDefault();
    if (gitUrl.trim()) {
      onGitIngest(gitUrl.trim(), gitBranch.trim() || 'main');
      setGitUrl('');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      onFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      onFileUpload(e.target.files[0]);
    }
  };

  // Group files by repo/directory
  const groupedFiles = files.reduce((acc, file) => {
    const parts = file.path.split('/');
    const group = parts.length > 1 ? parts[0] : 'uploads';
    if (!acc[group]) acc[group] = [];
    acc[group].push(file);
    return acc;
  }, {});

  return (
    <aside className="sidebar">
      <div className="sidebar__header">
        <div className="sidebar__logo">
          <div className="sidebar__logo-icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              <path d="M8 7h8" />
              <path d="M8 11h8" />
              <path d="M8 15h5" />
            </svg>
          </div>
          <div className="sidebar__logo-text">
            <h1>Doc Insights</h1>
            <span>RAG-Powered Search</span>
          </div>
        </div>
      </div>

      {/* Git Ingestion */}
      <div className="sidebar__section">
        <div className="sidebar__section-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="3" />
            <path d="M12 3v6" />
            <path d="M12 15v6" />
            <path d="M3 12h6" />
            <path d="M15 12h6" />
          </svg>
          <span>Add Repository</span>
        </div>
        
        <form onSubmit={handleGitSubmit} className="sidebar__form">
          <input
            type="text"
            value={gitUrl}
            onChange={(e) => setGitUrl(e.target.value)}
            placeholder="https://github.com/user/repo"
            className="sidebar__input"
            disabled={isIngesting}
          />
          <div className="sidebar__form-row">
            <input
              type="text"
              value={gitBranch}
              onChange={(e) => setGitBranch(e.target.value)}
              placeholder="Branch"
              className="sidebar__input sidebar__input--small"
              disabled={isIngesting}
            />
            <button 
              type="submit" 
              className="sidebar__btn sidebar__btn--primary"
              disabled={isIngesting || !gitUrl.trim()}
            >
              {isIngesting ? (
                <span className="sidebar__spinner" />
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                  Add
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* File Upload */}
      <div className="sidebar__section">
        <div className="sidebar__section-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="17 8 12 3 7 8" />
            <line x1="12" y1="3" x2="12" y2="15" />
          </svg>
          <span>Upload Files</span>
        </div>
        
        <div
          className={`sidebar__dropzone ${dragActive ? 'sidebar__dropzone--active' : ''}`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
            accept=".md,.txt,.py,.js,.ts,.jsx,.tsx,.json,.yaml,.yml,.html,.css"
          />
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="12" y1="18" x2="12" y2="12" />
            <line x1="9" y1="15" x2="15" y2="15" />
          </svg>
          <span>Drop file or click to browse</span>
        </div>
      </div>

      {/* Ingest Status */}
      {ingestStatus && (
        <div className={`sidebar__status sidebar__status--${ingestStatus.type}`}>
          {ingestStatus.type === 'success' ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
          )}
          <span>{ingestStatus.message}</span>
        </div>
      )}

      {/* Ingested Files List */}
      <div className="sidebar__section sidebar__section--files">
        <div className="sidebar__section-header">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
          <span>Indexed Files</span>
          <button 
            className="sidebar__refresh-btn"
            onClick={onRefreshFiles}
            disabled={isLoadingFiles}
            title="Refresh file list"
          >
            <svg 
              width="14" 
              height="14" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2"
              className={isLoadingFiles ? 'spinning' : ''}
            >
              <path d="M21 2v6h-6" />
              <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
              <path d="M3 22v-6h6" />
              <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
            </svg>
          </button>
        </div>
        
        <div className="sidebar__files">
          {isLoadingFiles ? (
            <div className="sidebar__files-loading">
              <div className="sidebar__skeleton" />
              <div className="sidebar__skeleton" />
              <div className="sidebar__skeleton" />
            </div>
          ) : files.length === 0 ? (
            <div className="sidebar__files-empty">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
              <span>No files indexed yet</span>
            </div>
          ) : (
            Object.entries(groupedFiles).map(([group, groupFiles]) => (
              <div key={group} className="sidebar__file-group">
                <div className="sidebar__file-group-header">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
                  </svg>
                  <span>{group}</span>
                  <span className="sidebar__file-count">{groupFiles.length}</span>
                </div>
                <div className="sidebar__file-list">
                  {groupFiles.slice(0, 10).map((file) => (
                    <div key={file.id} className="sidebar__file-item">
                      <FileIcon filename={file.path} />
                      <span className="sidebar__file-name" title={file.path}>
                        {file.path.split('/').pop()}
                      </span>
                    </div>
                  ))}
                  {groupFiles.length > 10 && (
                    <div className="sidebar__file-more">
                      +{groupFiles.length - 10} more files
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}

function FileIcon({ filename }) {
  const ext = filename.split('.').pop()?.toLowerCase();
  
  const getColor = () => {
    switch (ext) {
      case 'py': return '#3776ab';
      case 'js': case 'jsx': return '#f7df1e';
      case 'ts': case 'tsx': return '#3178c6';
      case 'md': return '#083fa1';
      case 'json': return '#292929';
      case 'yaml': case 'yml': return '#cb171e';
      case 'html': return '#e34f26';
      case 'css': return '#1572b6';
      default: return '#64748b';
    }
  };

  return (
    <svg 
      width="14" 
      height="14" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke={getColor()} 
      strokeWidth="2"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}
