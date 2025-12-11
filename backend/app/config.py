from pydantic_settings import BaseSettings
from pydantic import Field
from functools import lru_cache
from pathlib import Path
import yaml

embedding_dim: int = 384

class Settings(BaseSettings):
    database_url: str = Field(..., alias="DATABASE_URL")
    embedding_model: str = Field("sentence-transformers/all-MiniLM-L6-v2", alias="EMBEDDING_MODEL")
    embedding_dim: int = Field(embedding_dim, alias="EMBEDDING_DIM")
    redis_url: str = Field("redis://rag_redis:6379/0", alias="REDIS_URL")

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        extra = "ignore"


settings = Settings()


@lru_cache(maxsize=1)
def load_ingestion_config() -> dict:
    """Load YAML ingestion config shipped with the backend image."""
    base = Path(__file__).resolve().parent.parent
    cfg_path = base / "ingestion_config.yaml"
    if not cfg_path.exists():
        return {}
    with cfg_path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f) or {}
