from pydantic import BaseModel, Field
from typing import List, Optional, Literal


class IngestFSRequest(BaseModel):
    path: str = Field(..., description="Directory path inside /workspace to ingest")


class IngestGitRequest(BaseModel):
    repo_url: str = Field(..., description="Git repository URL")
    name: Optional[str] = Field(None, description="Optional repo name")
    branch: Optional[str] = Field("main", description="Branch to track")


# Search Request with parameters
class SearchRequest(BaseModel):
    query: str
    top_k: int = Field(5, ge=1, le=20, description="Number of chunks to retrieve")
    min_similarity: float = Field(0.0, ge=0.0, le=1.0, description="Minimum similarity threshold")
    provider: Literal["openai", "groq", "deepseek"] = Field("openai", description="LLM provider")


# Individual search result
class SearchResult(BaseModel):
    file_path: str
    chunk_index: int
    content_snippet: str
    similarity: float  # Changed from 'score' - now 0-1 where higher is better


# Retrieval metrics
class RetrievalMetrics(BaseModel):
    latency_ms: float
    top_similarity: float
    avg_similarity: float
    results_returned: int
    results_filtered: int  # How many were cut by min_similarity


# Generation metrics (for RAG with LLM)
class GenerationMetrics(BaseModel):
    llm_latency_ms: float
    context_tokens: int
    sources_used: int


# Basic search response (retrieval only)
class SearchResponse(BaseModel):
    results: List[SearchResult]
    retrieval_metrics: RetrievalMetrics


# RAG search response (retrieval + generation)
class RagSearchResponse(BaseModel):
    query: str
    answer: str
    results: List[SearchResult]
    retrieval_metrics: RetrievalMetrics
    generation_metrics: GenerationMetrics


# Raw LLM search (no RAG)
class RawSearchRequest(BaseModel):
    query: str
    provider: Literal["openai", "groq", "deepseek"] = "openai"


class RawSearchResponse(BaseModel):
    provider: str
    answer: str
    latency_ms: float


# Files list
class FileInfo(BaseModel):
    id: int
    path: str
    hash: str
    repo_name: Optional[str] = None
    created_at: Optional[str] = None


class FilesResponse(BaseModel):
    files: List[FileInfo]
    total: int

# from pydantic import BaseModel, Field
# from typing import List, Optional, Literal

# class IngestFSRequest(BaseModel):
#     path: str = Field(..., description="Directory path inside /workspace to ingest")


# class IngestGitRequest(BaseModel):
#     repo_url: str = Field(..., description="Git repository URL (e.g. https://github.com/owner/repo.git)")
#     name: Optional[str] = Field(None, description="Optional repo name; derived from URL if omitted")
#     branch: Optional[str] = Field("main", description="Branch to track")


# class SearchRequest(BaseModel):
#     query: str
#     top_k: int = 5


# class SearchResult(BaseModel):
#     file_path: str
#     chunk_index: int
#     content_snippet: str
#     score: float


# class SearchResponse(BaseModel):
#     results: List[SearchResult]


# class RagSearchResponse(BaseModel):
#     query: str
#     rag_answer: str
#     results: List[SearchResult]
#     latency_ms: float


# class RawSearchRequest(BaseModel):
#     query: str
#     provider: Literal["openai", "groq", "deepseek"] = "openai"  # default


# class RawSearchResponse(BaseModel):
#     provider: str
#     answer: str
