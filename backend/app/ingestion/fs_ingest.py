from ..services.ingestion_service import ingest_directory_from_workspace


def ingest_directory(relative_path: str, repo_name: str | None = None, last_commit: str | None = None):
    """Wrapper around the ingestion service for use in background workers."""
    return ingest_directory_from_workspace(relative_path, repo_name=repo_name, last_commit=last_commit)
