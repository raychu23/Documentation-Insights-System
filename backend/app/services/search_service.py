import time
from typing import List, Tuple
from sqlalchemy.orm import Session
from sqlalchemy import text

from .embedding_service import embed_texts
from .llm_service import generate_rag_answer
from ..schemas import (
    SearchResult, SearchResponse, RetrievalMetrics,
    RagSearchResponse, GenerationMetrics
)


def semantic_search(
    db: Session,
    query: str,
    top_k: int = 5,
    min_similarity: float = 0.0
) -> Tuple[List[SearchResult], RetrievalMetrics]:
    """
    Perform semantic search with similarity scoring and filtering.
    
    Returns:
        Tuple of (filtered results, retrieval metrics)
    """
    start_time = time.time()
    
    # 1. Embed the query
    [query_emb] = embed_texts([query])
    
    # Convert embedding array to pgvector literal
    vect_literal = f"[{','.join(str(x) for x in query_emb)}]"
    
    # 2. Search in Postgres using pgvector L2 distance
    # Fetch more than top_k to allow for filtering
    fetch_limit = min(top_k * 2, 50)
    
    rows = db.execute(
        text("""
            SELECT
                f.path AS file_path,
                c.chunk_index AS chunk_index,
                c.content AS content,
                c.embedding <-> (:query_emb)::vector AS distance
            FROM chunks c
            JOIN files f ON c.file_id = f.id
            ORDER BY distance ASC
            LIMIT :fetch_limit
        """),
        {
            "query_emb": vect_literal,
            "fetch_limit": fetch_limit,
        }
    ).fetchall()
    
    # 3. Convert to results and apply min_similarity filter
    all_results: List[SearchResult] = []
    for row in rows:
        distance = float(row.distance)
        # Convert L2 distance to similarity score (0-1 range)
        # Using formula: similarity = 1 / (1 + distance)
        # This maps distance 0 -> similarity 1, larger distance -> lower similarity
        similarity = 1.0 / (1.0 + distance)
        
        snippet = row.content[:500].replace("\n", " ")
        all_results.append(
            SearchResult(
                file_path=row.file_path,
                chunk_index=row.chunk_index,
                content_snippet=snippet,
                similarity=round(similarity, 3),
            )
        )
    
    # 4. Filter by min_similarity and limit to top_k
    filtered_results = [r for r in all_results if r.similarity >= min_similarity]
    results_filtered = len(all_results) - len(filtered_results)
    final_results = filtered_results[:top_k]
    
    # 5. Calculate metrics
    latency_ms = (time.time() - start_time) * 1000
    
    top_similarity = final_results[0].similarity if final_results else 0.0
    avg_similarity = (
        sum(r.similarity for r in final_results) / len(final_results)
        if final_results else 0.0
    )
    
    metrics = RetrievalMetrics(
        latency_ms=round(latency_ms, 1),
        top_similarity=round(top_similarity, 3),
        avg_similarity=round(avg_similarity, 3),
        results_returned=len(final_results),
        results_filtered=results_filtered,
    )
    
    return final_results, metrics


def rag_search(
    db: Session,
    query: str,
    top_k: int = 5,
    min_similarity: float = 0.0,
    provider: str = "openai"
) -> RagSearchResponse:
    """
    Full RAG search: retrieval + LLM generation.
    """
    # 1. Retrieve relevant chunks
    results, retrieval_metrics = semantic_search(
        db, query=query, top_k=top_k, min_similarity=min_similarity
    )
    
    # 2. Build context for LLM
    context_chunks = [r.content_snippet for r in results]
    
    # Estimate token count (rough: 4 chars = 1 token)
    context_text = "\n\n---\n\n".join(context_chunks)
    context_tokens = len(context_text) // 4
    
    # 3. Generate answer with LLM using selected provider
    answer, llm_latency = generate_rag_answer(query, context_chunks, provider=provider)
    
    # 4. Count unique source files
    unique_sources = len(set(r.file_path for r in results))
    
    generation_metrics = GenerationMetrics(
        llm_latency_ms=round(llm_latency, 1),
        context_tokens=context_tokens,
        sources_used=unique_sources,
    )
    
    return RagSearchResponse(
        query=query,
        answer=answer,
        results=results,
        retrieval_metrics=retrieval_metrics,
        generation_metrics=generation_metrics,
    )
    
# from typing import List
# from sqlalchemy.orm import Session
# from sqlalchemy import text

# from .embedding_service import embed_texts
# from ..schemas import SearchResult

# from .llm_service import generate_rag_answer
# from ..schemas import RagSearchResponse

# def semantic_search(db: Session, query: str, top_k: int = 5) -> List[SearchResult]:
#     # 1. Embed the query
#     [query_emb] = embed_texts([query])   # <-- this is the real variable

#     # Convert embedding array to pgvector literal
#     vect_literal = f"[{','.join(str(x) for x in query_emb)}]"

#     # 2. Search in Postgres using pgvector distance
#     rows = db.execute(
#         text("""
#             SELECT
#                 f.path AS file_path,
#                 c.chunk_index AS chunk_index,
#                 c.content AS content,
#                 c.embedding <-> (:query_emb)::vector AS distance
#             FROM chunks c
#             JOIN files f ON c.file_id = f.id
#             ORDER BY distance
#             LIMIT :top_k
#         """),
#         {
#             "query_emb": vect_literal,   # <-- FIXED
#             "top_k": top_k,
#         }
#     ).fetchall()

#     # 3. Map to Pydantic response
#     results: List[SearchResult] = []
#     for row in rows:
#         snippet = row.content[:300].replace("\n", " ")
#         results.append(
#             SearchResult(
#                 file_path=row.file_path,
#                 chunk_index=row.chunk_index,
#                 content_snippet=snippet,
#                 score=float(row.distance),
#             )
#         )

#     return results


# def rag_search(db: Session, query: str, top_k: int = 5) -> RagSearchResponse:
#     # 1. Existing vector search to get chunks
#     vec_results: List[SearchResult] = semantic_search(db, query=query, top_k=top_k)

#     # 2. Build context for LLM
#     context_chunks = [r.content_snippet for r in vec_results]

#     # 3. Call LLM
#     rag_answer, llm_latency = generate_rag_answer(query, context_chunks)

#     return RagSearchResponse(
#         query=query,
#         rag_answer=rag_answer,
#         results=vec_results,
#         latency_ms=llm_latency,
#     )
