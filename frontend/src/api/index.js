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
export const searchRag = async (query, topK = 5, minSimilarity = 0.5, provider = 'openai') => {
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

// import axios from 'axios';

// // Auto-detect environment - works for both Docker and local dev
// const getBaseURL = () => {
//   // In browser, always use localhost since that's what the user accesses
//   // The nginx proxy or direct backend access handles routing
//   return 'http://localhost:8000';
// };

// const api = axios.create({
//   baseURL: getBaseURL(),
//   timeout: 60000, // Increased for LLM calls
//   headers: {
//     'Content-Type': 'application/json',
//   },
// });

// // Request interceptor for logging
// api.interceptors.request.use(
//   (config) => {
//     console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
//     return config;
//   },
//   (error) => Promise.reject(error)
// );

// // Response interceptor for error handling
// api.interceptors.response.use(
//   (response) => response,
//   (error) => {
//     console.error('[API Error]', error.response?.data || error.message);
//     return Promise.reject(error);
//   }
// );

// /**
//  * Search documentation using RAG (semantic search + context)
//  * @param {string} query - The search query
//  * @param {number} topK - Number of results to return
//  */
// export const search = async (query, topK = 5) => {
//   const response = await api.post('/search', { query, top_k: topK });
//   return response.data;
// };

// /**
//  * Search using raw LLM without RAG context (for comparison)
//  * @param {string} query - The search query
//  */
// export const searchRaw = async (query) => {
//   const response = await api.post('/search/raw', { query });
//   return response.data;
// };

// /**
//  * Get list of all indexed files
//  */
// export const getFiles = async () => {
//   const response = await api.get('/files');
//   return response.data;
// };

// /**
//  * Ingest files from a filesystem path
//  * @param {string} path - Directory path inside /workspace
//  */
// export const ingestFileSystem = async (path) => {
//   const response = await api.post('/ingest/fs', { path });
//   return response.data;
// };

// /**
//  * Ingest files from a Git repository
//  * @param {string} repoUrl - Git repository URL
//  * @param {string} branch - Branch to track (defaults to 'main')
//  */
// export const ingestGit = async (repoUrl, branch = 'main') => {
//   const response = await api.post('/ingest/git', { 
//     repo_url: repoUrl, 
//     branch 
//   });
//   return response.data;
// };

// /**
//  * Upload a file for ingestion
//  * @param {File} file - The file to upload
//  */
// export const uploadFile = async (file) => {
//   const formData = new FormData();
//   formData.append('file', file);
  
//   const response = await api.post('/ingest/upload', formData, {
//     headers: {
//       'Content-Type': 'multipart/form-data',
//     },
//   });
//   return response.data;
// };

// export default api;
