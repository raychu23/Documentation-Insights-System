import time
from fastapi import FastAPI, Depends, HTTPException, UploadFile, File as FastAPIFile
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from sqlalchemy import text
import shutil
from pathlib import Path

from .database import Base, engine, get_db
from .schemas import (
    IngestFSRequest, IngestGitRequest, SearchRequest,
    SearchResponse, RagSearchResponse,
    RawSearchRequest, RawSearchResponse,
    FilesResponse, FileInfo
)
from .services.search_service import semantic_search, rag_search
from .services.llm_service import generate_raw_answer
from .ingestion.ingest_tasks import run_fs_ingestion, run_git_ingestion, auto_ingest_all_repos

app = FastAPI(
    title="Engineering Docs RAG Backend",
    version="0.3.0",
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Upload directory
UPLOAD_DIR = Path("/workspace/uploads")
UPLOAD_DIR.mkdir(parents=True, exist_ok=True)


@app.on_event("startup")
def on_startup() -> None:
    Base.metadata.create_all(bind=engine)
    auto_ingest_all_repos.send()


# ===== Ingestion Endpoints =====

@app.post("/ingest/fs")
def ingest_fs(req: IngestFSRequest):
    """Queue filesystem ingestion."""
    rel_path = req.path.lstrip("/")
    run_fs_ingestion.send(rel_path)
    return {"queued": True, "path": rel_path}


@app.post("/ingest/git")
def ingest_git(req: IngestGitRequest):
    """Queue Git repository ingestion."""
    run_git_ingestion.send(req.repo_url, None, req.branch or "main")
    return {"queued": True, "repo_url": req.repo_url, "branch": req.branch or "main"}


@app.post("/ingest/upload")
async def ingest_upload(file: UploadFile = FastAPIFile(...)):
    """Upload and ingest a file."""
    allowed_extensions = {
        '.md', '.txt', '.py', '.js', '.ts', '.jsx', '.tsx',
        '.json', '.yaml', '.yml', '.html', '.css',
        '.java', '.go', '.rs', '.c', '.cpp', '.h'
    }
    ext = Path(file.filename).suffix.lower()
    if ext not in allowed_extensions:
        raise HTTPException(status_code=400, detail=f"File type {ext} not supported")
    
    file_path = UPLOAD_DIR / file.filename
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    run_fs_ingestion.send("uploads")
    return {"uploaded": True, "filename": file.filename}


# ===== Search Endpoints =====

@app.post("/search", response_model=SearchResponse)
def search(req: SearchRequest, db: Session = Depends(get_db)):
    """Semantic search (retrieval only, no LLM)."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    results, metrics = semantic_search(
        db,
        query=req.query,
        top_k=req.top_k,
        min_similarity=req.min_similarity
    )
    return SearchResponse(results=results, retrieval_metrics=metrics)


@app.post("/search/rag", response_model=RagSearchResponse)
def search_rag(req: SearchRequest, db: Session = Depends(get_db)):
    """Full RAG search (retrieval + LLM generation)."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    return rag_search(
        db,
        query=req.query,
        top_k=req.top_k,
        min_similarity=req.min_similarity,
        provider=req.provider
    )


@app.post("/search/raw", response_model=RawSearchResponse)
def search_raw(req: RawSearchRequest):
    """Raw LLM search (no RAG context)."""
    if not req.query.strip():
        raise HTTPException(status_code=400, detail="Query cannot be empty")
    
    answer, latency_ms = generate_raw_answer(req.query, provider=req.provider)
    
    return RawSearchResponse(
        provider=req.provider,
        answer=answer,
        latency_ms=round(latency_ms, 1)
    )


# ===== Files Endpoint =====

@app.get("/files", response_model=FilesResponse)
def get_files(db: Session = Depends(get_db)):
    """List all indexed files."""
    rows = db.execute(
        text("""
            SELECT id, path, hash, repo_name, created_at
            FROM files
            ORDER BY created_at DESC
        """)
    ).fetchall()
    
    files = [
        FileInfo(
            id=row.id,
            path=row.path,
            hash=row.hash,
            repo_name=row.repo_name,
            created_at=row.created_at.isoformat() if row.created_at else None
        )
        for row in rows
    ]
    
    return FilesResponse(files=files, total=len(files))


@app.get("/health")
def health():
    return {"status": "healthy", "version": "0.3.0"}

# from fastapi import FastAPI, Depends, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from sqlalchemy.orm import Session
# from .database import Base, engine, get_db
# from .schemas import IngestFSRequest, IngestGitRequest, SearchRequest, SearchResponse
# from .services.search_service import semantic_search
# from .ingestion.ingest_tasks import run_fs_ingestion, run_git_ingestion, auto_ingest_all_repos

# from .schemas import RagSearchResponse
# from .services.search_service import rag_search

# app = FastAPI(
#     title="Engineering Docs RAG Backend",
#     version="0.2.0",
# )

# # CORS for local dev; tighten for prod as needed
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# @app.on_event("startup")
# def on_startup() -> None:
#     Base.metadata.create_all(bind=engine)
#     # Kick off auto-ingestion for configured repos (non-blocking)
#     auto_ingest_all_repos.send()


# @app.post("/ingest/fs")
# def ingest_fs(req: IngestFSRequest):
#     """Queue a filesystem ingestion job for a directory under /workspace."""
#     rel_path = req.path.lstrip("/")
#     run_fs_ingestion.send(rel_path)
#     return {"queued": True, "path": rel_path}


# @app.post("/ingest/git")
# def ingest_git(req: IngestGitRequest):
#     """Queue a Git-based ingestion job. Repo will be cloned into /workspace/repos/<name>."""
#     run_git_ingestion.send(req.repo_url, None, req.branch or "main")
#     return {"queued": True, "repo_url": req.repo_url, "branch": req.branch or "main"}


# @app.post("/search", response_model=SearchResponse)
# def search(req: SearchRequest, db: Session = Depends(get_db)):
#     if not req.query.strip():
#         raise HTTPException(status_code=400, detail="Query cannot be empty")
#     results = semantic_search(db, query=req.query, top_k=req.top_k)
#     return SearchResponse(results=results)

# @app.post("/search/rag", response_model=RagSearchResponse)
# def search_rag(req: SearchRequest, db: Session = Depends(get_db)):
#     return rag_search(db, query=req.query, top_k=req.top_k or 5)

# @app.post("/search/raw", response_model=RawSearchResponse)
# def raw_llm_search(body: RawSearchRequest):
#     answer = run_llm(body.provider, body.query)
#     return RawSearchResponse(
#         provider=body.provider,
#         answer=answer
#     )
