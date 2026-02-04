# Documentation Insights System (RAG-based)

Documentation Insights System is a **knowledge-base and information retrieval tool** designed to simulate internal enterprise software used by engineering teams.

It ingests large codebases and technical documents (via Git or local files), indexes them using vector embeddings, and enables engineers to ask natural-language questions grounded in their own code and documentation.

The project focuses on retrieval-augmented generation (RAG) to overcome limitations of standard GenAI tools when dealing with project-specific, rapidly changing, or highly technical information.

---

## Table of Contents

- Features  
- System Overview  
- Installation  
- Usage  
- Technologies Used  
- Limitations & Future Work  
- Contributing  

---

## Features

- Ingest entire Git repositories or local directories automatically  
- Chunk and embed files for semantic search using vector similarity  
- Store file metadata and embeddings in PostgreSQL with `pgvector`  
- Adjustable retrieval parameters (Top-K, similarity threshold)  
- Compare RAG-based answers against raw LLM responses  
- Web-based UI for search, exploration, and insights  
- Fully containerized local development environment  

---

## System Overview

Traditional GenAI tools generalize well but struggle with:
- Project-specific details  
- Large codebases  
- Recent changes  
- Internal documentation  

This system uses Retrieval-Augmented Generation (RAG):

1. Files are ingested and chunked  
2. Each chunk is embedded into a vector  
3. Relevant chunks are retrieved at query time  
4. Retrieved context is injected into the LLM prompt  
5. The LLM produces answers grounded in real project data  

This ensures answers are specific, traceable, and up to date.

---

## Installation

### Prerequisites

Ensure the following are installed:

- Git  
- Docker & Docker Compose  
- Node.js (v18+)  
- npm  

Verify installation:

git --version  
docker --version  
docker compose version  
node --version  
npm --version  

---

### Clone the Repository

git clone https://github.com/your-username/documentation-insights-system.git  
cd documentation-insights-system  

---

### Environment Setup

Create a `.env` file in the project root:

POSTGRES_DB=rag_db  
POSTGRES_USER=rag_user  
POSTGRES_PASSWORD=rag_password  

OPENAI_API_KEY=your_key_here  

---

### Start Backend Services

docker compose up --build  

This launches:
- PostgreSQL (with pgvector)
- Redis (for background tasks)
- FastAPI backend
- Ingestion worker

API available at:

http://localhost:8000  

---

### Start Frontend

cd frontend  
npm install  
npm run dev  

Frontend runs at:

http://localhost:5173  

---

## Usage

### Ingest a Git Repository

POST /ingest/git  

Example payload:

{
  "repo_url": "https://github.com/fastapi/fastapi"
}

---

### Ingest Local Files

Place files inside the `workspace/` directory, then call:

POST /ingest/fs  

{
  "path": "my-docs"
}

---

### Search with RAG

POST /search  

{
  "query": "How does dependency injection work in FastAPI?",
  "top_k": 5
}

---

## Example Interaction

Input Query:
How does FastAPI generate OpenAPI schemas?

Retrieved Context:
- docs/tutorial/openapi.md
- fastapi/applications.py

Output:
A detailed explanation based on FastAPI’s actual implementation and documentation, not generic API theory.

---

## Technologies Used

Backend:
- Python
- FastAPI
- SQLAlchemy
- PostgreSQL
- pgvector
- Redis
- Docker

Frontend:
- React
- Vite

AI / Retrieval:
- Vector embeddings (Llama-3 / OpenAI)
- Vector similarity search (cosine distance)

---

## Limitations & Future Work

- Local ingestion is slow for very large repositories
- Embedding costs limit large-scale ingestion
- No hybrid lexical + semantic search yet
- No live GitHub webhook syncing
- No production cloud deployment enabled by default

Planned extensions:
- Hybrid lexical + semantic retrieval
- AWS deployment (S3, Lambda, EventBridge)
- Scheduled insights generation
- Improved ranking and summarization

