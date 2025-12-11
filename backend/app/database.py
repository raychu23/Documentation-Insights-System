from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from .config import settings


class Base(DeclarativeBase):
    pass


engine = create_engine(settings.database_url, echo=False, future=True)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    from fastapi import Depends  # type: ignore
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_db_session():
    """Utility for non-FastAPI contexts (e.g., background workers)."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
