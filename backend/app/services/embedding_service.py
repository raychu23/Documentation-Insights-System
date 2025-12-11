from functools import lru_cache
from typing import List
from sentence_transformers import SentenceTransformer
from ..config import settings, load_ingestion_config


@lru_cache(maxsize=1)
def get_embedding_model() -> SentenceTransformer:
    cfg = load_ingestion_config()
    model_name = cfg.get("ingestion", {}).get("embedding", {}).get("model", settings.embedding_model)
    return SentenceTransformer(model_name)


def embed_texts(texts: List[str]) -> List[List[float]]:
    model = get_embedding_model()
    embeddings = model.encode(texts, convert_to_numpy=False, normalize_embeddings=True)
    return [emb.tolist() for emb in embeddings]
