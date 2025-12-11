import os
import hashlib
from typing import List, Tuple, Dict, Optional
from sqlalchemy.orm import Session
from ..models import File, Chunk
from ..utils.chunking import simple_chunk_text
from .embedding_service import embed_texts
from ..config import load_ingestion_config
from ..database import SessionLocal
# from .milvus_service import collection as milvus_collection

WORKSPACE_ROOT = "/workspace"

cfg = load_ingestion_config()
_ing = cfg.get("ingestion", {})
ALLOWED_EXTENSIONS = set(_ing.get("allowed_extensions", [".py", ".md", ".txt"]))
CHUNK_MAX_CHARS = _ing.get("chunk", {}).get("max_chars", 1200)
CHUNK_OVERLAP = _ing.get("chunk", {}).get("overlap", 200)


def hash_file(path: str) -> str:
    hasher = hashlib.sha256()
    with open(path, "rb") as f:
        for block in iter(lambda: f.read(8192), b""):
            hasher.update(block)
    return hasher.hexdigest()


def collect_files(root_path: str) -> List[str]:
    files: List[str] = []
    for dirpath, _, filenames in os.walk(root_path):
        for fname in filenames:
            ext = os.path.splitext(fname)[1].lower()
            if ext in ALLOWED_EXTENSIONS:
                files.append(os.path.join(dirpath, fname))
    return files


def _ingest_single_file(
    db: Session,
    abs_path: str,
    repo_name: Optional[str] = None,
    last_commit: Optional[str] = None,
) -> Tuple[bool, bool]:
    file_hash = hash_file(abs_path)
    rel_path = os.path.relpath(abs_path, WORKSPACE_ROOT)

    db_file = db.query(File).filter(File.path == rel_path).first()

    if db_file and db_file.hash == file_hash:
        return (False, False)

    try:
        with open(abs_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
    except Exception as e:
        print(f"[WARN] Skipping unreadable file: {abs_path} ({e})")
        return (False, False)

    chunks = simple_chunk_text(text, max_chars=CHUNK_MAX_CHARS, overlap=CHUNK_OVERLAP)
    if not chunks:
        return (False, False)

    embeddings = embed_texts(chunks)

    is_new = False
    is_updated = False

    if db_file is None:
        db_file = File(
            path=rel_path,
            hash=file_hash,
            repo_name=repo_name,
            last_commit=last_commit,
        )
        db.add(db_file)
        db.flush()
        is_new = True
    else:
        db.query(Chunk).filter(Chunk.file_id == db_file.id).delete()
        db_file.hash = file_hash
        db_file.repo_name = repo_name or db_file.repo_name
        db_file.last_commit = last_commit or db_file.last_commit
        is_updated = True

    for idx, (chunk, emb) in enumerate(zip(chunks, embeddings)):
        db_chunk = Chunk(
            file_id=db_file.id,
            chunk_index=idx,
            content=chunk,
            embedding=emb,
        )
        db.add(db_chunk)

        # # Milvus
        # collection.insert([
        #     [emb],
        #     [rel_path],
        #     [idx]
        # ])

    return (is_new, is_updated)


def ingest_directory_from_workspace(
    relative_path: str,
    repo_name: Optional[str] = None,
    last_commit: Optional[str] = None,
) -> Dict[str, int]:
    abs_root = os.path.join(WORKSPACE_ROOT, relative_path.lstrip("/"))
    if not os.path.isdir(abs_root):
        raise ValueError(f"Path does not exist or is not a directory: {abs_root}")

    file_paths = collect_files(abs_root)

    stats = {
        "new_files": 0,
        "updated_files": 0,
        "skipped_files": 0,
        "total_files": len(file_paths),
    }

    db = SessionLocal()
    try:
        for path in file_paths:
            is_new, is_updated = _ingest_single_file(db, path, repo_name, last_commit)
            if is_new:
                stats["new_files"] += 1
            elif is_updated:
                stats["updated_files"] += 1
            else:
                stats["skipped_files"] += 1

        db.commit()
    finally:
        db.close()

    print(f"[INGEST] {relative_path} -> {stats}")
    return stats
