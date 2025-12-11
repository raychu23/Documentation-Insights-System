import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('[API Error]', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

/**
 * Semantic search (retrieval only)
 */
export const search = async (query, topK = 5, minSimilarity = 0.0) => {
  const response = await api.post('/search', {
    query,
    top_k: topK,
    min_similarity: minSimilarity
  });
  return response.data;
};

/**
 * RAG search (retrieval + LLM generation)
 */
export const searchRag = async (query, topK = 5, minSimilarity = 0.0, provider = 'openai') => {
  const response = await api.post('/search/rag', {
    query,
    top_k: topK,
    min_similarity: minSimilarity,
    provider
  });
  return response.data;
};

/**
 * Raw LLM search (no RAG context)
 */
export const searchRaw = async (query, provider = 'openai') => {
  const response = await api.post('/search/raw', {
    query,
    provider
  });
  return response.data;
};

/**
 * Get indexed files
 */
export const getFiles = async () => {
  const response = await api.get('/files');
  return response.data;
};

/**
 * Ingest Git repository
 */
export const ingestGit = async (repoUrl, branch = 'main') => {
  const response = await api.post('/ingest/git', {
    repo_url: repoUrl,
    branch
  });
  return response.data;
};

/**
 * Upload file for ingestion
 */
export const uploadFile = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post('/ingest/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export default api;