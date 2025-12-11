from sqlalchemy.orm import Session
from ..models import Chunk

def get_chunk_by_id(db: Session, chunk_id: int) -> Chunk | None:
    return db.query(Chunk).filter(Chunk.id == chunk_id).first()
