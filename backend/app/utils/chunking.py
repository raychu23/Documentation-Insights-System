from typing import List


def simple_chunk_text(text: str, max_chars: int = 1000, overlap: int = 200) -> List[str]:
    """Very simple character-based chunker with overlap."""
    chunks: List[str] = []
    start = 0
    n = len(text)

    while start < n:
        end = min(start + max_chars, n)
        chunk = text[start:end]
        chunks.append(chunk)
        if end == n:
            break
        start = end - overlap

    return chunks
